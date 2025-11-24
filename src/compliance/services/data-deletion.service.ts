import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeletionRequestDto } from '../dto/create-deletion-request.dto';
import { DataType, DeletionStatus } from '@prisma/client';

@Injectable()
export class DataDeletionService {
  private readonly logger = new Logger(DataDeletionService.name);

  constructor(private prisma: PrismaService) {}

  async createDeletionRequest(workspaceId: string, userId: string, dto: CreateDeletionRequestDto) {
    return this.prisma.dataDeletionRequest.create({
      data: {
        workspaceId,
        requestedBy: userId,
        requestType: dto.requestType,
        dataTypes: dto.dataTypes,
        userId: dto.userId,
        dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
        dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
        filters: dto.filters,
        requiresApproval: dto.requiresApproval ?? true,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        status: dto.requiresApproval ? DeletionStatus.PENDING_APPROVAL : DeletionStatus.SCHEDULED,
      },
    });
  }

  async getDeletionRequests(workspaceId: string) {
    return this.prisma.dataDeletionRequest.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDeletionRequest(id: string, workspaceId: string) {
    return this.prisma.dataDeletionRequest.findFirst({
      where: { id, workspaceId },
    });
  }

  async approveDeletionRequest(id: string, workspaceId: string, userId: string) {
    const request = await this.prisma.dataDeletionRequest.findFirst({
      where: { id, workspaceId },
    });

    if (!request) {
      throw new Error('Deletion request not found');
    }

    if (request.status !== DeletionStatus.PENDING_APPROVAL) {
      throw new Error('Request is not pending approval');
    }

    const scheduledFor = request.scheduledFor || new Date();

    await this.prisma.dataDeletionRequest.update({
      where: { id },
      data: {
        status: DeletionStatus.APPROVED,
        approvedBy: userId,
        approvedAt: new Date(),
        scheduledFor,
      },
    });

    // If scheduled for immediate execution, process it
    if (scheduledFor <= new Date()) {
      this.processDeletion(id).catch(error => {
        this.logger.error(`Failed to process deletion ${id}:`, error);
      });
    }

    return this.getDeletionRequest(id, workspaceId);
  }

  async rejectDeletionRequest(id: string, workspaceId: string, userId: string, reason: string) {
    return this.prisma.dataDeletionRequest.update({
      where: { id },
      data: {
        status: DeletionStatus.REJECTED,
        rejectedBy: userId,
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  async processScheduledDeletions() {
    this.logger.log('Processing scheduled deletions');

    const requests = await this.prisma.dataDeletionRequest.findMany({
      where: {
        status: {
          in: [DeletionStatus.APPROVED, DeletionStatus.SCHEDULED],
        },
        scheduledFor: {
          lte: new Date(),
        },
      },
    });

    for (const request of requests) {
      try {
        await this.processDeletion(request.id);
      } catch (error) {
        this.logger.error(`Failed to process deletion ${request.id}:`, error);
      }
    }

    this.logger.log(`Processed ${requests.length} scheduled deletions`);
  }

  private async processDeletion(requestId: string) {
    const request = await this.prisma.dataDeletionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Deletion request not found');
    }

    try {
      await this.prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: DeletionStatus.PROCESSING,
        },
      });

      let totalDeleted = 0;
      let totalFailed = 0;
      const auditLog: any[] = [];

      for (const dataType of request.dataTypes) {
        try {
          const result = await this.deleteDataType(
            dataType,
            request.workspaceId,
            request.userId,
            request.dateFrom,
            request.dateTo,
            request.filters as any,
          );

          totalDeleted += result.deleted;
          auditLog.push({
            dataType,
            deleted: result.deleted,
            timestamp: new Date(),
          });
        } catch (error) {
          totalFailed++;
          auditLog.push({
            dataType,
            error: error.message,
            timestamp: new Date(),
          });
        }
      }

      await this.prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: DeletionStatus.COMPLETED,
          executedAt: new Date(),
          itemsDeleted: totalDeleted,
          itemsFailed: totalFailed,
          auditLog,
        },
      });

      this.logger.log(`Deletion ${requestId} completed: ${totalDeleted} items deleted, ${totalFailed} failed`);
    } catch (error) {
      this.logger.error(`Deletion ${requestId} failed:`, error);
      
      await this.prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: DeletionStatus.FAILED,
          error: error.message,
          executedAt: new Date(),
        },
      });
    }
  }

  private async deleteDataType(
    dataType: DataType,
    workspaceId: string,
    userId?: string,
    dateFrom?: Date,
    dateTo?: Date,
    filters?: any,
  ): Promise<{ deleted: number }> {
    const dateFilter = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };

    let deleted = 0;

    switch (dataType) {
      case DataType.POSTS:
        const postsResult = await this.prisma.post.deleteMany({
          where: {
            workspaceId,
            ...(userId && { authorId: userId }),
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
        });
        deleted = postsResult.count;
        break;

      case DataType.MEDIA_ASSETS:
        const assetsResult = await this.prisma.mediaAsset.deleteMany({
          where: {
            workspaceId,
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
        });
        deleted = assetsResult.count;
        break;

      case DataType.CONVERSATIONS:
        const conversationsResult = await this.prisma.conversation.deleteMany({
          where: {
            workspaceId,
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
        });
        deleted = conversationsResult.count;
        break;

      case DataType.MESSAGES:
        const messagesResult = await this.prisma.message.deleteMany({
          where: {
            conversation: { workspaceId },
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
        });
        deleted = messagesResult.count;
        break;

      case DataType.USER_DATA:
        if (userId) {
          // Anonymize user data instead of deleting
          await this.prisma.user.update({
            where: { id: userId },
            data: {
              email: `deleted-${userId}@anonymized.local`,
              name: 'Deleted User',
              avatar: null,
              isActive: false,
            },
          });
          deleted = 1;
        }
        break;

      case DataType.AUDIT_LOGS:
        const logsResult = await this.prisma.securityAuditLog.deleteMany({
          where: {
            workspaceId,
            ...(userId && { userId }),
            ...(dateFrom || dateTo ? { timestamp: dateFilter } : {}),
          },
        });
        deleted = logsResult.count;
        break;

      default:
        this.logger.warn(`Unsupported data type for deletion: ${dataType}`);
    }

    return { deleted };
  }
}
