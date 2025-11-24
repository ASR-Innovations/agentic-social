import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExportRequestDto } from '../dto/create-export-request.dto';
import { DataType, ExportStatus, ExportFormat } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataExportService {
  private readonly logger = new Logger(DataExportService.name);

  constructor(private prisma: PrismaService) {}

  async createExportRequest(workspaceId: string, userId: string, dto: CreateExportRequestDto) {
    const request = await this.prisma.dataExportRequest.create({
      data: {
        workspaceId,
        requestedBy: userId,
        requestType: dto.requestType,
        format: dto.format || ExportFormat.JSON,
        dataTypes: dto.dataTypes,
        dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
        dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
        filters: dto.filters,
        status: ExportStatus.PENDING,
      },
    });

    // Process export asynchronously
    this.processExport(request.id).catch(error => {
      this.logger.error(`Failed to process export ${request.id}:`, error);
    });

    return request;
  }

  async getExportRequests(workspaceId: string) {
    return this.prisma.dataExportRequest.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExportRequest(id: string, workspaceId: string) {
    return this.prisma.dataExportRequest.findFirst({
      where: { id, workspaceId },
    });
  }

  private async processExport(requestId: string) {
    const request = await this.prisma.dataExportRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Export request not found');
    }

    try {
      await this.prisma.dataExportRequest.update({
        where: { id: requestId },
        data: {
          status: ExportStatus.PROCESSING,
          startedAt: new Date(),
        },
      });

      const exportData: any = {};

      for (const dataType of request.dataTypes) {
        exportData[dataType] = await this.exportDataType(
          dataType,
          request.workspaceId,
          request.dateFrom,
          request.dateTo,
          request.filters as any,
        );
      }

      // Generate file
      const fileName = `export-${requestId}.${request.format.toLowerCase()}`;
      const filePath = path.join(process.cwd(), 'exports', fileName);
      
      // Ensure exports directory exists
      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      let fileContent: string;
      if (request.format === ExportFormat.JSON) {
        fileContent = JSON.stringify(exportData, null, 2);
      } else if (request.format === ExportFormat.CSV) {
        fileContent = this.convertToCSV(exportData);
      } else {
        fileContent = JSON.stringify(exportData, null, 2);
      }

      fs.writeFileSync(filePath, fileContent);

      const fileSize = fs.statSync(filePath).size;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      await this.prisma.dataExportRequest.update({
        where: { id: requestId },
        data: {
          status: ExportStatus.COMPLETED,
          fileUrl: `/exports/${fileName}`,
          fileSize: BigInt(fileSize),
          expiresAt,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Export ${requestId} completed successfully`);
    } catch (error) {
      this.logger.error(`Export ${requestId} failed:`, error);
      
      await this.prisma.dataExportRequest.update({
        where: { id: requestId },
        data: {
          status: ExportStatus.FAILED,
          error: error.message,
          completedAt: new Date(),
        },
      });
    }
  }

  private async exportDataType(
    dataType: DataType,
    workspaceId: string,
    dateFrom?: Date,
    dateTo?: Date,
    filters?: any,
  ) {
    const dateFilter = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };

    switch (dataType) {
      case DataType.POSTS:
        return this.prisma.post.findMany({
          where: {
            workspaceId,
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
        });

      case DataType.MEDIA_ASSETS:
        return this.prisma.mediaAsset.findMany({
          where: {
            workspaceId,
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
        });

      case DataType.CONVERSATIONS:
        return this.prisma.conversation.findMany({
          where: {
            workspaceId,
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
          include: {
            messages: true,
          },
        });

      case DataType.MESSAGES:
        return this.prisma.message.findMany({
          where: {
            conversation: { workspaceId },
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
        });

      case DataType.USER_DATA:
        return this.prisma.user.findMany({
          where: {
            workspaceId,
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      case DataType.SOCIAL_ACCOUNT_DATA:
        return this.prisma.socialAccount.findMany({
          where: {
            workspaceId,
            ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
          },
        });

      case DataType.AUDIT_LOGS:
        return this.prisma.securityAuditLog.findMany({
          where: {
            workspaceId,
            ...(dateFrom || dateTo ? { timestamp: dateFilter } : {}),
          },
        });

      default:
        return [];
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use a proper CSV library
    const rows: string[] = [];
    
    for (const [dataType, records] of Object.entries(data)) {
      if (Array.isArray(records) && records.length > 0) {
        rows.push(`\n# ${dataType}\n`);
        const headers = Object.keys(records[0]);
        rows.push(headers.join(','));
        
        for (const record of records) {
          const values = headers.map(h => {
            const value = record[h];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value).replace(/,/g, ';');
          });
          rows.push(values.join(','));
        }
      }
    }
    
    return rows.join('\n');
  }

  async cleanupExpiredExports() {
    const expiredExports = await this.prisma.dataExportRequest.findMany({
      where: {
        status: ExportStatus.COMPLETED,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    for (const exportRequest of expiredExports) {
      try {
        if (exportRequest.fileUrl) {
          const filePath = path.join(process.cwd(), exportRequest.fileUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        await this.prisma.dataExportRequest.update({
          where: { id: exportRequest.id },
          data: {
            status: ExportStatus.EXPIRED,
            fileUrl: null,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to cleanup export ${exportRequest.id}:`, error);
      }
    }

    this.logger.log(`Cleaned up ${expiredExports.length} expired exports`);
  }
}
