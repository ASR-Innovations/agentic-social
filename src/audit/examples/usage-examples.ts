/**
 * Audit Trail System - Usage Examples
 * 
 * This file demonstrates how to integrate the audit trail system
 * into various parts of the application.
 */

import { Injectable, Controller, Post, Body, Req, UseInterceptors } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { AuditLog } from '../interceptors/audit.interceptor';
import { AuditAction, AuditSeverity, AuditStatus } from '../dto/audit.dto';

// ============================================
// Example 1: Manual Audit Logging in Service
// ============================================

@Injectable()
export class PostService {
  constructor(private auditService: AuditService) {}

  async createPost(workspaceId: string, userId: string, data: any, req: any) {
    try {
      // Create the post
      const post = await this.savePost(data);

      // Log successful creation
      await this.auditService.logResourceAction(
        workspaceId,
        userId,
        AuditAction.POST_CREATE,
        'post',
        post.id,
        req.ip,
        req.headers['user-agent'],
        {
          title: post.title,
          platforms: post.platforms,
          scheduledAt: post.scheduledAt,
        },
        AuditStatus.SUCCESS,
      );

      return post;
    } catch (error) {
      // Log failed creation
      await this.auditService.create(workspaceId, userId, {
        action: AuditAction.POST_CREATE,
        resourceType: 'post',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: AuditStatus.FAILURE,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          data,
        },
        severity: AuditSeverity.ERROR,
      });

      throw error;
    }
  }

  private async savePost(data: any) {
    // Implementation
    return { id: 'post-123', ...data };
  }
}

// ============================================
// Example 2: Automatic Audit Logging with Decorator
// ============================================

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  /**
   * The @AuditLog decorator automatically logs this action
   * No manual logging code needed!
   */
  @Post()
  @AuditLog({
    action: AuditAction.POST_CREATE,
    resourceType: 'post',
    severity: AuditSeverity.INFO,
    includeBody: true, // Include request body in audit log
    includeResponse: true, // Include response in audit log
  })
  async create(@Body() data: any, @Req() req: any) {
    return this.postService.createPost(
      req.user.workspaceId,
      req.user.id,
      data,
      req,
    );
  }
}

// ============================================
// Example 3: Security Event Logging
// ============================================

@Injectable()
export class SecurityService {
  constructor(private auditService: AuditService) {}

  async handleFailedLogin(
    workspaceId: string,
    email: string,
    ipAddress: string,
    userAgent: string,
  ) {
    // Log failed login attempt
    await this.auditService.create(workspaceId, null, {
      action: AuditAction.LOGIN_FAILED,
      resourceType: 'user',
      ipAddress,
      userAgent,
      status: AuditStatus.FAILURE,
      details: {
        email,
        reason: 'Invalid credentials',
      },
      severity: AuditSeverity.WARNING,
    });

    // Check for brute force attack
    const recentFailures = await this.getRecentFailedLogins(ipAddress);
    if (recentFailures > 5) {
      await this.auditService.logSecurityEvent(
        workspaceId,
        null,
        AuditAction.LOGIN_FAILED,
        ipAddress,
        userAgent,
        {
          email,
          failureCount: recentFailures,
          action: 'IP temporarily blocked',
        },
        AuditSeverity.CRITICAL,
      );
    }
  }

  async handleSuccessfulLogin(
    workspaceId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    await this.auditService.logLogin(
      workspaceId,
      userId,
      ipAddress,
      userAgent,
      true,
    );
  }

  private async getRecentFailedLogins(ipAddress: string): Promise<number> {
    // Implementation
    return 0;
  }
}

// ============================================
// Example 4: Data Access Logging (GDPR Compliance)
// ============================================

@Injectable()
export class DataExportService {
  constructor(private auditService: AuditService) {}

  async exportUserData(
    workspaceId: string,
    userId: string,
    targetUserId: string,
    req: any,
  ) {
    // Log data export request
    await this.auditService.create(workspaceId, userId, {
      action: AuditAction.DATA_EXPORT,
      resourceType: 'user',
      resourceId: targetUserId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: AuditStatus.SUCCESS,
      details: {
        exportType: 'full_user_data',
        requestedBy: userId,
        targetUser: targetUserId,
        gdprCompliance: true,
      },
      severity: AuditSeverity.WARNING, // Data access is sensitive
    });

    // Perform export
    const data = await this.gatherUserData(targetUserId);
    return data;
  }

  async deleteUserData(
    workspaceId: string,
    userId: string,
    targetUserId: string,
    req: any,
  ) {
    // Log data deletion (critical action)
    await this.auditService.create(workspaceId, userId, {
      action: AuditAction.DATA_DELETE,
      resourceType: 'user',
      resourceId: targetUserId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: AuditStatus.SUCCESS,
      details: {
        deletionType: 'right_to_be_forgotten',
        requestedBy: userId,
        targetUser: targetUserId,
        gdprCompliance: true,
        dataTypes: ['posts', 'comments', 'messages', 'analytics'],
      },
      severity: AuditSeverity.CRITICAL,
    });

    // Perform deletion
    await this.performDataDeletion(targetUserId);
  }

  private async gatherUserData(userId: string) {
    // Implementation
    return {};
  }

  private async performDataDeletion(userId: string) {
    // Implementation
  }
}

// ============================================
// Example 5: Permission Change Logging
// ============================================

@Injectable()
export class PermissionService {
  constructor(private auditService: AuditService) {}

  async updateUserPermissions(
    workspaceId: string,
    adminUserId: string,
    targetUserId: string,
    oldPermissions: string[],
    newPermissions: string[],
    req: any,
  ) {
    // Log permission change
    await this.auditService.create(workspaceId, adminUserId, {
      action: AuditAction.PERMISSION_CHANGE,
      resourceType: 'user',
      resourceId: targetUserId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: AuditStatus.SUCCESS,
      details: {
        changedBy: adminUserId,
        targetUser: targetUserId,
        oldPermissions,
        newPermissions,
        added: newPermissions.filter(p => !oldPermissions.includes(p)),
        removed: oldPermissions.filter(p => !newPermissions.includes(p)),
      },
      severity: AuditSeverity.WARNING,
    });

    // Update permissions
    await this.savePermissions(targetUserId, newPermissions);
  }

  private async savePermissions(userId: string, permissions: string[]) {
    // Implementation
  }
}

// ============================================
// Example 6: AI Operations Logging
// ============================================

@Injectable()
export class AIService {
  constructor(private auditService: AuditService) {}

  async generateContent(
    workspaceId: string,
    userId: string,
    prompt: string,
    req: any,
  ) {
    const startTime = Date.now();

    try {
      // Generate content
      const content = await this.callAI(prompt);
      const duration = Date.now() - startTime;

      // Log AI usage
      await this.auditService.create(workspaceId, userId, {
        action: AuditAction.AI_CONTENT_GENERATE,
        resourceType: 'ai_operation',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: AuditStatus.SUCCESS,
        details: {
          model: 'gpt-4o',
          promptLength: prompt.length,
          responseLength: content.length,
          duration,
          cost: this.calculateCost(prompt, content),
        },
        severity: AuditSeverity.INFO,
      });

      return content;
    } catch (error) {
      // Log AI failure
      await this.auditService.create(workspaceId, userId, {
        action: AuditAction.AI_CONTENT_GENERATE,
        resourceType: 'ai_operation',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: AuditStatus.FAILURE,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          promptLength: prompt.length,
        },
        severity: AuditSeverity.ERROR,
      });

      throw error;
    }
  }

  private async callAI(prompt: string): Promise<string> {
    // Implementation
    return 'Generated content';
  }

  private calculateCost(prompt: string, response: string): number {
    // Implementation
    return 0.001;
  }
}

// ============================================
// Example 7: Workflow Approval Logging
// ============================================

@Injectable()
export class WorkflowService {
  constructor(private auditService: AuditService) {}

  async approvePost(
    workspaceId: string,
    approverId: string,
    postId: string,
    comments: string,
    req: any,
  ) {
    // Log approval
    await this.auditService.create(workspaceId, approverId, {
      action: AuditAction.APPROVAL_APPROVE,
      resourceType: 'post',
      resourceId: postId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: AuditStatus.SUCCESS,
      details: {
        approver: approverId,
        comments,
        approvalLevel: 'final',
      },
      severity: AuditSeverity.INFO,
    });

    // Process approval
    await this.processApproval(postId);
  }

  async rejectPost(
    workspaceId: string,
    approverId: string,
    postId: string,
    reason: string,
    req: any,
  ) {
    // Log rejection
    await this.auditService.create(workspaceId, approverId, {
      action: AuditAction.APPROVAL_REJECT,
      resourceType: 'post',
      resourceId: postId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: AuditStatus.SUCCESS,
      details: {
        approver: approverId,
        reason,
        approvalLevel: 'final',
      },
      severity: AuditSeverity.WARNING,
    });

    // Process rejection
    await this.processRejection(postId, reason);
  }

  private async processApproval(postId: string) {
    // Implementation
  }

  private async processRejection(postId: string, reason: string) {
    // Implementation
  }
}

// ============================================
// Example 8: Querying Audit Logs
// ============================================

@Injectable()
export class AuditQueryService {
  constructor(private auditService: AuditService) {}

  async getUserActivity(workspaceId: string, userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.auditService.findAll(workspaceId, {
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      sortBy: 'timestamp',
      sortOrder: 'desc',
      limit: 100,
    });
  }

  async getSecurityEvents(workspaceId: string, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.auditService.findAll(workspaceId, {
      severity: AuditSeverity.WARNING,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
  }

  async getFailedOperations(workspaceId: string, hours: number = 24) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    return this.auditService.findAll(workspaceId, {
      status: AuditStatus.FAILURE,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
  }
}
