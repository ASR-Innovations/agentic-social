import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { WebhookEventType } from '@prisma/client';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, userId: string, dto: CreateWebhookDto) {
    // Generate a secret for HMAC signature
    const secret = this.generateSecret();

    const webhook = await this.prisma.webhook.create({
      data: {
        workspaceId,
        integrationId: dto.integrationId,
        name: dto.name,
        url: dto.url,
        secret,
        events: dto.events,
        headers: dto.headers,
        retryConfig: dto.retryConfig || { maxRetries: 3, backoffMultiplier: 2 },
        createdBy: userId,
      },
    });

    return {
      ...webhook,
      secret, // Return secret only on creation
    };
  }

  async findAll(workspaceId: string) {
    return this.prisma.webhook.findMany({
      where: { workspaceId },
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            provider: true,
          },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, workspaceId },
      include: {
        integration: true,
        deliveries: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  async update(id: string, workspaceId: string, dto: Partial<CreateWebhookDto>) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, workspaceId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhook.update({
      where: { id },
      data: {
        name: dto.name,
        url: dto.url,
        events: dto.events,
        headers: dto.headers,
        retryConfig: dto.retryConfig,
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, workspaceId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await this.prisma.webhook.delete({
      where: { id },
    });

    return { message: 'Webhook deleted successfully' };
  }

  async updateStatus(id: string, workspaceId: string, status: 'ACTIVE' | 'INACTIVE' | 'FAILED') {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, workspaceId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhook.update({
      where: { id },
      data: { status },
    });
  }

  async trigger(eventType: WebhookEventType, workspaceId: string, payload: any) {
    // Find all active webhooks for this event type
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        workspaceId,
        status: 'ACTIVE',
        events: {
          has: eventType,
        },
      },
    });

    // Trigger webhooks asynchronously
    const deliveryPromises = webhooks.map((webhook) =>
      this.deliverWebhook(webhook.id, eventType, payload),
    );

    await Promise.allSettled(deliveryPromises);
  }

  private async deliverWebhook(webhookId: string, eventType: WebhookEventType, payload: any) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) return;

    const delivery = await this.prisma.webhookDelivery.create({
      data: {
        webhookId,
        eventType,
        payload,
      },
    });

    try {
      const startTime = Date.now();
      
      // Generate HMAC signature
      const signature = this.generateSignature(webhook.secret, payload);
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'X-Webhook-Delivery-Id': delivery.id,
        ...(webhook.headers as Record<string, string> || {}),
      };

      // Send webhook
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: 30000, // 30 seconds
      });

      const duration = Date.now() - startTime;

      // Update delivery record
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          success: true,
          responseStatus: response.status,
          responseBody: JSON.stringify(response.data).slice(0, 1000), // Limit size
          responseTime: duration,
        },
      });

      // Update webhook stats
      await this.prisma.webhook.update({
        where: { id: webhookId },
        data: {
          lastTriggeredAt: new Date(),
          lastSuccessAt: new Date(),
          successCount: { increment: 1 },
          failureCount: 0, // Reset failure count on success
        },
      });
    } catch (error: any) {
      const duration = Date.now() - Date.now();

      // Update delivery record with error
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          success: false,
          error: error.message,
          responseStatus: error.response?.status,
          responseBody: error.response?.data ? JSON.stringify(error.response.data).slice(0, 1000) : null,
          responseTime: duration,
        },
      });

      // Update webhook stats
      const updatedWebhook = await this.prisma.webhook.update({
        where: { id: webhookId },
        data: {
          lastTriggeredAt: new Date(),
          lastFailureAt: new Date(),
          failureCount: { increment: 1 },
        },
      });

      // Mark webhook as failed if too many consecutive failures
      if (updatedWebhook && updatedWebhook.failureCount >= 10) {
        await this.prisma.webhook.update({
          where: { id: webhookId },
          data: { status: 'FAILED' },
        });
      }

      // Schedule retry if configured
      const retryConfig = webhook.retryConfig as any;
      if (delivery.attempt < (retryConfig?.maxRetries || 3)) {
        const backoffMultiplier = retryConfig?.backoffMultiplier || 2;
        const nextRetryDelay = Math.pow(backoffMultiplier, delivery.attempt) * 60000; // Minutes to ms
        const nextRetryAt = new Date(Date.now() + nextRetryDelay);

        await this.prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            nextRetryAt,
            attempt: { increment: 1 },
          },
        });
      }
    }
  }

  async retryDelivery(deliveryId: string, workspaceId: string) {
    const delivery = await this.prisma.webhookDelivery.findFirst({
      where: {
        id: deliveryId,
        webhook: { workspaceId },
      },
      include: { webhook: true },
    });

    if (!delivery) {
      throw new NotFoundException('Webhook delivery not found');
    }

    await this.deliverWebhook(delivery.webhookId, delivery.eventType, delivery.payload);
  }

  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateSignature(secret: string, payload: any): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }
}
