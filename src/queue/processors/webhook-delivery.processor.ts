import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

/**
 * Webhook Delivery Processor
 * 
 * Processes webhook delivery jobs with aggressive retry strategy.
 * Implements exponential backoff for reliable webhook delivery.
 */
@Processor('webhook-delivery')
export class WebhookDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookDeliveryProcessor.name);

  async process(job: Job): Promise<any> {
    const { url, event, payload, workspaceId } = job.data;

    this.logger.log(
      `Processing webhook delivery for workspace ${workspaceId}: ${event} -> ${url}`,
    );

    try {
      const startTime = Date.now();

      // Deliver webhook
      const response = await this.deliverWebhook(url, event, payload);

      const duration = Date.now() - startTime;

      this.logger.log(
        `Webhook delivered successfully to ${url} in ${duration}ms (status: ${response.status})`,
      );

      return {
        success: true,
        url,
        event,
        status: response.status,
        duration,
        attemptsMade: job.attemptsMade,
      };
    } catch (error: any) {
      this.logger.error(
        `Error delivering webhook to ${url} (attempt ${job.attemptsMade}/${job.opts.attempts}):`,
        error.message,
      );

      // Check if this is the last attempt
      if (job.attemptsMade >= (job.opts.attempts || 10)) {
        this.logger.error(
          `Failed to deliver webhook to ${url} after ${job.attemptsMade} attempts`,
        );
        
        // In production:
        // - Store failed webhook in database
        // - Alert workspace admin
        // - Provide manual retry option in UI
      }

      // Throw error to trigger retry with exponential backoff
      throw error;
    }
  }

  private async deliverWebhook(url: string, event: string, payload: any) {
    // Simulate HTTP request
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Simulate occasional failures for testing retry logic
    if (Math.random() < 0.15) {
      throw new Error('Webhook endpoint unavailable');
    }

    return {
      status: 200,
      data: { received: true },
    };
  }
}
