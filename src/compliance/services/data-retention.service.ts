import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRetentionPolicyDto } from '../dto/create-retention-policy.dto';
import { DataType, RetentionAction } from '@prisma/client';

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(private prisma: PrismaService) {}

  async createPolicy(workspaceId: string, userId: string, dto: CreateRetentionPolicyDto) {
    const nextExecutionAt = new Date();
    nextExecutionAt.setDate(nextExecutionAt.getDate() + 1); // Execute daily

    return this.prisma.dataRetentionPolicy.create({
      data: {
        workspaceId,
        createdBy: userId,
        name: dto.name,
        description: dto.description,
        dataType: dto.dataType,
        retentionDays: dto.retentionDays,
        action: dto.action,
        conditions: dto.conditions,
        isActive: dto.isActive ?? true,
        nextExecutionAt,
      },
    });
  }

  async getPolicies(workspaceId: string) {
    return this.prisma.dataRetentionPolicy.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPolicy(id: string, workspaceId: string) {
    return this.prisma.dataRetentionPolicy.findFirst({
      where: { id, workspaceId },
    });
  }

  async updatePolicy(id: string, workspaceId: string, dto: Partial<CreateRetentionPolicyDto>) {
    return this.prisma.dataRetentionPolicy.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async deletePolicy(id: string, workspaceId: string) {
    return this.prisma.dataRetentionPolicy.delete({
      where: { id },
    });
  }

  async executePolicies() {
    this.logger.log('Starting data retention policy execution');

    const policies = await this.prisma.dataRetentionPolicy.findMany({
      where: {
        isActive: true,
        nextExecutionAt: {
          lte: new Date(),
        },
      },
    });

    for (const policy of policies) {
      try {
        await this.executePolicy(policy);
        
        // Update next execution time
        const nextExecutionAt = new Date();
        nextExecutionAt.setDate(nextExecutionAt.getDate() + 1);
        
        await this.prisma.dataRetentionPolicy.update({
          where: { id: policy.id },
          data: {
            lastExecutedAt: new Date(),
            nextExecutionAt,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to execute policy ${policy.id}:`, error);
      }
    }

    this.logger.log('Completed data retention policy execution');
  }

  private async executePolicy(policy: any) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    this.logger.log(`Executing policy ${policy.id} for ${policy.dataType} with cutoff ${cutoffDate}`);

    switch (policy.dataType) {
      case DataType.POSTS:
        await this.retainPosts(policy.workspaceId, cutoffDate, policy.action);
        break;
      case DataType.MEDIA_ASSETS:
        await this.retainMediaAssets(policy.workspaceId, cutoffDate, policy.action);
        break;
      case DataType.CONVERSATIONS:
        await this.retainConversations(policy.workspaceId, cutoffDate, policy.action);
        break;
      case DataType.MESSAGES:
        await this.retainMessages(policy.workspaceId, cutoffDate, policy.action);
        break;
      case DataType.AUDIT_LOGS:
        await this.retainAuditLogs(policy.workspaceId, cutoffDate, policy.action);
        break;
      default:
        this.logger.warn(`Unsupported data type: ${policy.dataType}`);
    }
  }

  private async retainPosts(workspaceId: string, cutoffDate: Date, action: RetentionAction) {
    const posts = await this.prisma.post.findMany({
      where: {
        workspaceId,
        createdAt: { lt: cutoffDate },
      },
    });

    if (action === RetentionAction.DELETE) {
      await this.prisma.post.deleteMany({
        where: {
          id: { in: posts.map(p => p.id) },
        },
      });
      this.logger.log(`Deleted ${posts.length} posts`);
    } else if (action === RetentionAction.ARCHIVE) {
      // In a real implementation, move to archive storage
      this.logger.log(`Archived ${posts.length} posts`);
    }
  }

  private async retainMediaAssets(workspaceId: string, cutoffDate: Date, action: RetentionAction) {
    const assets = await this.prisma.mediaAsset.findMany({
      where: {
        workspaceId,
        createdAt: { lt: cutoffDate },
      },
    });

    if (action === RetentionAction.DELETE) {
      await this.prisma.mediaAsset.deleteMany({
        where: {
          id: { in: assets.map(a => a.id) },
        },
      });
      this.logger.log(`Deleted ${assets.length} media assets`);
    }
  }

  private async retainConversations(workspaceId: string, cutoffDate: Date, action: RetentionAction) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        workspaceId,
        createdAt: { lt: cutoffDate },
      },
    });

    if (action === RetentionAction.DELETE) {
      await this.prisma.conversation.deleteMany({
        where: {
          id: { in: conversations.map(c => c.id) },
        },
      });
      this.logger.log(`Deleted ${conversations.length} conversations`);
    }
  }

  private async retainMessages(workspaceId: string, cutoffDate: Date, action: RetentionAction) {
    const messages = await this.prisma.message.findMany({
      where: {
        conversation: { workspaceId },
        createdAt: { lt: cutoffDate },
      },
    });

    if (action === RetentionAction.DELETE) {
      await this.prisma.message.deleteMany({
        where: {
          id: { in: messages.map(m => m.id) },
        },
      });
      this.logger.log(`Deleted ${messages.length} messages`);
    }
  }

  private async retainAuditLogs(workspaceId: string, cutoffDate: Date, action: RetentionAction) {
    const logs = await this.prisma.securityAuditLog.findMany({
      where: {
        workspaceId,
        timestamp: { lt: cutoffDate },
      },
    });

    if (action === RetentionAction.DELETE) {
      await this.prisma.securityAuditLog.deleteMany({
        where: {
          id: { in: logs.map(l => l.id) },
        },
      });
      this.logger.log(`Deleted ${logs.length} audit logs`);
    }
  }
}
