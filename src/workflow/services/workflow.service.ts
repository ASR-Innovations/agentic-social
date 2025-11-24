import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  StartWorkflowDto,
  ApproveWorkflowDto,
  BulkApproveDto,
  QueryWorkflowDto,
  QueryWorkflowInstanceDto,
  QueryApprovalDto,
  ApprovalAction,
} from '../dto';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new workflow
   */
  async createWorkflow(workspaceId: string, userId: string, dto: CreateWorkflowDto) {
    // Create workflow with steps and conditions
    const workflow = await this.prisma.workflow.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        config: dto.config as any,
        isActive: dto.isActive ?? true,
        createdBy: userId,
        steps: {
          create: dto.steps.map((step) => ({
            name: step.name,
            description: step.description,
            type: step.type,
            order: step.order,
            config: step.config as any,
            isRequired: step.isRequired ?? true,
            conditions: step.conditions
              ? {
                  create: step.conditions.map((condition) => ({
                    field: condition.field,
                    operator: condition.operator,
                    value: condition.value as any,
                    logicalOperator: condition.logicalOperator,
                    order: condition.order ?? 0,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        steps: {
          include: {
            conditions: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return workflow;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workspaceId: string, workflowId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id: workflowId,
        workspaceId,
      },
      include: {
        steps: {
          include: {
            conditions: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  /**
   * List workflows
   */
  async listWorkflows(workspaceId: string, query: QueryWorkflowDto) {
    const { type, status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      workspaceId,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [workflows, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        include: {
          steps: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return {
      data: workflows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workspaceId: string, workflowId: string, dto: UpdateWorkflowDto) {
    const workflow = await this.getWorkflow(workspaceId, workflowId);

    // If updating steps, delete old ones and create new ones
    const updateData: any = {
      name: dto.name,
      description: dto.description,
      type: dto.type,
      status: dto.status,
      config: dto.config as any,
      isActive: dto.isActive,
    };

    if (dto.steps) {
      // Delete existing steps
      await this.prisma.workflowStep.deleteMany({
        where: { workflowId },
      });

      // Create new steps
      updateData.steps = {
        create: dto.steps.map((step) => ({
          name: step.name,
          description: step.description,
          type: step.type,
          order: step.order,
          config: step.config as any,
          isRequired: step.isRequired ?? true,
          conditions: step.conditions
            ? {
                create: step.conditions.map((condition) => ({
                  field: condition.field,
                  operator: condition.operator,
                  value: condition.value as any,
                  logicalOperator: condition.logicalOperator,
                  order: condition.order ?? 0,
                })),
              }
            : undefined,
        })),
      };
    }

    const updated = await this.prisma.workflow.update({
      where: { id: workflowId },
      data: updateData,
      include: {
        steps: {
          include: {
            conditions: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workspaceId: string, workflowId: string) {
    await this.getWorkflow(workspaceId, workflowId);

    await this.prisma.workflow.delete({
      where: { id: workflowId },
    });

    return { success: true };
  }

  /**
   * Start a workflow instance
   */
  async startWorkflow(workspaceId: string, userId: string, dto: StartWorkflowDto) {
    const workflow = await this.getWorkflow(workspaceId, dto.workflowId);

    if (!workflow.isActive) {
      throw new BadRequestException('Workflow is not active');
    }

    // Check if workflow applies to this entity type
    const config = workflow.config as any;
    if (config.entityTypes && !config.entityTypes.includes(dto.entityType)) {
      throw new BadRequestException('Workflow does not apply to this entity type');
    }

    // Get first step
    const firstStep = workflow.steps[0];
    if (!firstStep) {
      throw new BadRequestException('Workflow has no steps');
    }

    // Create workflow instance
    const instance = await this.prisma.workflowInstance.create({
      data: {
        workflowId: workflow.id,
        entityType: dto.entityType,
        entityId: dto.entityId,
        status: 'IN_PROGRESS',
        currentStepId: firstStep.id,
        metadata: dto.metadata as any,
      },
    });

    // Create audit log
    await this.createAuditLog(instance.id, null, userId, 'WORKFLOW_STARTED', {
      workflowName: workflow.name,
      entityType: dto.entityType,
      entityId: dto.entityId,
    });

    // Process first step
    await this.processStep(instance.id, firstStep.id, userId);

    return this.getWorkflowInstance(workspaceId, instance.id);
  }

  /**
   * Process a workflow step
   */
  private async processStep(instanceId: string, stepId: string, userId: string | null) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        workflow: {
          include: {
            steps: {
              include: {
                conditions: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    const step = instance.workflow.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new NotFoundException('Workflow step not found');
    }

    // Evaluate conditions
    const conditionsMet = await this.evaluateConditions(instance, step);
    if (!conditionsMet && step.isRequired) {
      // Skip to next step if conditions not met and step is not required
      await this.moveToNextStep(instance, step);
      return;
    }

    // Process based on step type
    switch (step.type) {
      case 'APPROVAL':
        await this.createApprovals(instance, step);
        break;
      case 'NOTIFICATION':
        await this.sendNotifications(instance, step);
        await this.moveToNextStep(instance, step);
        break;
      case 'ACTION':
        await this.executeAction(instance, step);
        await this.moveToNextStep(instance, step);
        break;
      case 'CONDITION':
        await this.moveToNextStep(instance, step);
        break;
    }
  }

  /**
   * Evaluate step conditions
   */
  private async evaluateConditions(instance: any, step: any): Promise<boolean> {
    if (!step.conditions || step.conditions.length === 0) {
      return true;
    }

    // Get entity data
    const entityData = await this.getEntityData(instance.entityType, instance.entityId);
    const metadata = instance.metadata || {};

    // Evaluate each condition
    const results = step.conditions.map((condition: any) => {
      const fieldValue = this.getFieldValue(entityData, metadata, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });

    // Combine results based on logical operators
    // For simplicity, using AND for all conditions
    return results.every((r: boolean) => r);
  }

  /**
   * Get entity data for condition evaluation
   */
  private async getEntityData(entityType: string, entityId: string): Promise<any> {
    switch (entityType) {
      case 'post':
        return this.prisma.post.findUnique({ where: { id: entityId } });
      case 'campaign':
        return this.prisma.campaign.findUnique({ where: { id: entityId } });
      default:
        return {};
    }
  }

  /**
   * Get field value from entity data or metadata
   */
  private getFieldValue(entityData: any, metadata: any, field: string): any {
    // Support nested field access (e.g., "post.content.text")
    const parts = field.split('.');
    let value = entityData;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        break;
      }
    }

    // If not found in entity data, check metadata
    if (value === undefined && metadata[field] !== undefined) {
      value = metadata[field];
    }

    return value;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(fieldValue: any, operator: string, compareValue: any): boolean {
    switch (operator) {
      case 'EQUALS':
        return fieldValue === compareValue;
      case 'NOT_EQUALS':
        return fieldValue !== compareValue;
      case 'CONTAINS':
        return String(fieldValue).includes(String(compareValue));
      case 'NOT_CONTAINS':
        return !String(fieldValue).includes(String(compareValue));
      case 'GREATER_THAN':
        return Number(fieldValue) > Number(compareValue);
      case 'LESS_THAN':
        return Number(fieldValue) < Number(compareValue);
      case 'IN':
        return Array.isArray(compareValue) && compareValue.includes(fieldValue);
      case 'NOT_IN':
        return Array.isArray(compareValue) && !compareValue.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Create approval records for a step
   */
  private async createApprovals(instance: any, step: any) {
    const config = step.config as any;
    const approvers = config.approvers || [];

    // Check for delegations
    const now = new Date();
    const delegations = await this.prisma.workflowDelegation.findMany({
      where: {
        workspaceId: instance.workflow.workspaceId,
        fromUserId: { in: approvers },
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // Replace delegated approvers
    const finalApprovers = approvers.map((approverId: string) => {
      const delegation = delegations.find((d) => d.fromUserId === approverId);
      return delegation ? delegation.toUserId : approverId;
    });

    // Create approval records
    await Promise.all(
      finalApprovers.map((approverId: string) =>
        this.prisma.workflowApproval.create({
          data: {
            instanceId: instance.id,
            stepId: step.id,
            approverId,
            status: 'PENDING',
          },
        }),
      ),
    );

    // Create audit log
    await this.createAuditLog(instance.id, step.id, null, 'APPROVALS_CREATED', {
      stepName: step.name,
      approvers: finalApprovers,
    });
  }

  /**
   * Send notifications for a step
   */
  private async sendNotifications(instance: any, step: any) {
    const config = step.config as any;
    const recipients = config.notificationRecipients || [];

    // TODO: Implement actual notification sending (email, push, etc.)
    // For now, just log it
    await this.createAuditLog(instance.id, step.id, null, 'NOTIFICATIONS_SENT', {
      stepName: step.name,
      recipients,
    });
  }

  /**
   * Execute an action for a step
   */
  private async executeAction(instance: any, step: any) {
    const config = step.config as any;
    const actionType = config.actionType;

    // TODO: Implement actual action execution based on actionType
    // For now, just log it
    await this.createAuditLog(instance.id, step.id, null, 'ACTION_EXECUTED', {
      stepName: step.name,
      actionType,
    });
  }

  /**
   * Move to next step in workflow
   */
  private async moveToNextStep(instance: any, currentStep: any) {
    const steps = instance.workflow.steps;
    const currentIndex = steps.findIndex((s: any) => s.id === currentStep.id);
    const nextStep = steps[currentIndex + 1];

    if (nextStep) {
      // Move to next step
      await this.prisma.workflowInstance.update({
        where: { id: instance.id },
        data: { currentStepId: nextStep.id },
      });

      // Process next step
      await this.processStep(instance.id, nextStep.id, null);
    } else {
      // Workflow complete
      await this.prisma.workflowInstance.update({
        where: { id: instance.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          currentStepId: null,
        },
      });

      await this.createAuditLog(instance.id, null, null, 'WORKFLOW_COMPLETED', {
        workflowName: instance.workflow.name,
      });
    }
  }

  /**
   * Approve or reject a workflow step
   */
  async approveWorkflow(
    workspaceId: string,
    approvalId: string,
    userId: string,
    dto: ApproveWorkflowDto,
  ) {
    const approval = await this.prisma.workflowApproval.findUnique({
      where: { id: approvalId },
      include: {
        instance: {
          include: {
            workflow: {
              include: {
                steps: {
                  include: {
                    conditions: true,
                  },
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
          },
        },
        step: true,
      },
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    // Check if user is the approver or has delegation
    if (approval.approverId !== userId) {
      const now = new Date();
      const delegation = await this.prisma.workflowDelegation.findFirst({
        where: {
          workspaceId,
          fromUserId: approval.approverId,
          toUserId: userId,
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      if (!delegation) {
        throw new ForbiddenException('You are not authorized to approve this');
      }
    }

    // Update approval
    const status = dto.action === ApprovalAction.APPROVE ? 'APPROVED' : dto.action === ApprovalAction.REJECT ? 'REJECTED' : 'SKIPPED';

    await this.prisma.workflowApproval.update({
      where: { id: approvalId },
      data: {
        status,
        comments: dto.comments,
        metadata: dto.metadata as any,
        respondedAt: new Date(),
      },
    });

    // Create audit log
    await this.createAuditLog(approval.instanceId, approval.stepId, userId, `APPROVAL_${status}`, {
      stepName: approval.step.name,
      comments: dto.comments,
    });

    // Check if step is complete
    await this.checkStepCompletion(approval.instance, approval.step);

    return this.getWorkflowInstance(workspaceId, approval.instanceId);
  }

  /**
   * Check if all approvals for a step are complete
   */
  private async checkStepCompletion(instance: any, step: any) {
    const approvals = await this.prisma.workflowApproval.findMany({
      where: {
        instanceId: instance.id,
        stepId: step.id,
      },
    });

    const config = step.config as any;
    const approvalType = config.approvalType || 'ALL';

    const approved = approvals.filter((a) => a.status === 'APPROVED').length;
    const rejected = approvals.filter((a) => a.status === 'REJECTED').length;
    const pending = approvals.filter((a) => a.status === 'PENDING').length;

    let stepComplete = false;
    let stepRejected = false;

    switch (approvalType) {
      case 'ANY':
        stepComplete = approved > 0;
        stepRejected = rejected > 0 && pending === 0;
        break;
      case 'ALL':
        stepComplete = approved === approvals.length;
        stepRejected = rejected > 0;
        break;
      case 'MAJORITY':
        const majority = Math.ceil(approvals.length / 2);
        stepComplete = approved >= majority;
        stepRejected = rejected >= majority;
        break;
    }

    if (stepRejected) {
      // Workflow rejected
      await this.prisma.workflowInstance.update({
        where: { id: instance.id },
        data: {
          status: 'REJECTED',
          completedAt: new Date(),
        },
      });

      await this.createAuditLog(instance.id, step.id, null, 'WORKFLOW_REJECTED', {
        stepName: step.name,
      });
    } else if (stepComplete) {
      // Move to next step
      await this.moveToNextStep(instance, step);
    }
  }

  /**
   * Bulk approve multiple approvals
   */
  async bulkApprove(workspaceId: string, userId: string, dto: BulkApproveDto) {
    const results = await Promise.allSettled(
      dto.approvalIds.map((approvalId) =>
        this.approveWorkflow(workspaceId, approvalId, userId, {
          action: dto.action,
          comments: dto.comments,
        }),
      ),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      successful,
      failed,
      total: dto.approvalIds.length,
    };
  }

  /**
   * Get workflow instance
   */
  async getWorkflowInstance(workspaceId: string, instanceId: string) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: {
        id: instanceId,
        workflow: {
          workspaceId,
        },
      },
      include: {
        workflow: {
          include: {
            steps: {
              include: {
                conditions: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            step: true,
          },
        },
        auditLogs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    return instance;
  }

  /**
   * List workflow instances
   */
  async listWorkflowInstances(workspaceId: string, query: QueryWorkflowInstanceDto) {
    const { workflowId, entityType, entityId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      workflow: {
        workspaceId,
      },
    };

    if (workflowId) {
      where.workflowId = workflowId;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (status) {
      where.status = status;
    }

    const [instances, total] = await Promise.all([
      this.prisma.workflowInstance.findMany({
        where,
        include: {
          workflow: true,
          approvals: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.workflowInstance.count({ where }),
    ]);

    return {
      data: instances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List pending approvals for a user
   */
  async listPendingApprovals(workspaceId: string, userId: string, query: QueryApprovalDto) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Get active delegations where user is the delegate
    const now = new Date();
    const delegations = await this.prisma.workflowDelegation.findMany({
      where: {
        workspaceId,
        toUserId: userId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    const delegatedFromUserIds = delegations.map((d) => d.fromUserId);

    const where: any = {
      instance: {
        workflow: {
          workspaceId,
        },
      },
      OR: [{ approverId: userId }, { approverId: { in: delegatedFromUserIds } }],
    };

    if (status) {
      where.status = status;
    } else {
      where.status = 'PENDING';
    }

    const [approvals, total] = await Promise.all([
      this.prisma.workflowApproval.findMany({
        where,
        include: {
          instance: {
            include: {
              workflow: true,
            },
          },
          step: true,
          approver: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.workflowApproval.count({ where }),
    ]);

    return {
      data: approvals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(
    instanceId: string,
    stepId: string | null,
    userId: string | null,
    action: string,
    details: any,
  ) {
    await this.prisma.workflowAuditLog.create({
      data: {
        instanceId,
        stepId,
        userId,
        action,
        details: details as any,
      },
    });
  }

  /**
   * Get workflow analytics
   */
  async getWorkflowAnalytics(workspaceId: string, workflowId?: string) {
    const where: any = {
      workflow: {
        workspaceId,
      },
    };

    if (workflowId) {
      where.workflowId = workflowId;
    }

    const [totalInstances, completedInstances, rejectedInstances, inProgressInstances, avgCompletionTime] =
      await Promise.all([
        this.prisma.workflowInstance.count({ where }),
        this.prisma.workflowInstance.count({ where: { ...where, status: 'COMPLETED' } }),
        this.prisma.workflowInstance.count({ where: { ...where, status: 'REJECTED' } }),
        this.prisma.workflowInstance.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        this.calculateAverageCompletionTime(where),
      ]);

    const completionRate = totalInstances > 0 ? (completedInstances / totalInstances) * 100 : 0;
    const rejectionRate = totalInstances > 0 ? (rejectedInstances / totalInstances) * 100 : 0;

    return {
      totalInstances,
      completedInstances,
      rejectedInstances,
      inProgressInstances,
      completionRate,
      rejectionRate,
      avgCompletionTime,
    };
  }

  /**
   * Calculate average completion time
   */
  private async calculateAverageCompletionTime(where: any): Promise<number> {
    const completedInstances = await this.prisma.workflowInstance.findMany({
      where: {
        ...where,
        status: 'COMPLETED',
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    if (completedInstances.length === 0) {
      return 0;
    }

    const totalTime = completedInstances.reduce((sum, instance) => {
      const duration = instance.completedAt!.getTime() - instance.startedAt.getTime();
      return sum + duration;
    }, 0);

    // Return average in hours
    return totalTime / completedInstances.length / (1000 * 60 * 60);
  }
}
