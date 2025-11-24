import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowModule } from './workflow.module';
import { AuthModule } from '../auth/auth.module';
import { WorkflowType, WorkflowStepType, ConditionOperator, ApprovalAction } from './dto';

describe('Workflow Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let workspaceId: string;
  let userId: string;
  let approver1Id: string;
  let approver2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WorkflowModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test workspace and users
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace-workflow',
        plan: 'PROFESSIONAL',
      },
    });
    workspaceId = workspace.id;

    const user = await prisma.user.create({
      data: {
        email: 'workflow-test@example.com',
        password: 'hashedpassword',
        name: 'Workflow Test User',
        workspaceId,
        role: 'ADMIN',
      },
    });
    userId = user.id;

    const approver1 = await prisma.user.create({
      data: {
        email: 'approver1@example.com',
        password: 'hashedpassword',
        name: 'Approver 1',
        workspaceId,
        role: 'MANAGER',
      },
    });
    approver1Id = approver1.id;

    const approver2 = await prisma.user.create({
      data: {
        email: 'approver2@example.com',
        password: 'hashedpassword',
        name: 'Approver 2',
        workspaceId,
        role: 'MANAGER',
      },
    });
    approver2Id = approver2.id;

    // Mock authentication
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.workflowInstance.deleteMany({ where: { workflow: { workspaceId } } });
    await prisma.workflow.deleteMany({ where: { workspaceId } });
    await prisma.user.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await app.close();
  });

  describe('Workflow Management', () => {
    let workflowId: string;

    it('should create a new workflow', async () => {
      const createDto = {
        name: 'Content Approval Workflow',
        description: 'Multi-level approval for content publishing',
        type: WorkflowType.APPROVAL,
        config: {
          triggerType: 'MANUAL',
          entityTypes: ['post'],
          deadlineHours: 24,
        },
        steps: [
          {
            name: 'Manager Approval',
            description: 'Requires manager approval',
            type: WorkflowStepType.APPROVAL,
            order: 0,
            config: {
              approvers: [approver1Id],
              approvalType: 'ALL',
            },
            isRequired: true,
          },
          {
            name: 'Director Approval',
            description: 'Requires director approval',
            type: WorkflowStepType.APPROVAL,
            order: 1,
            config: {
              approvers: [approver2Id],
              approvalType: 'ALL',
            },
            isRequired: true,
          },
        ],
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.steps).toHaveLength(2);
      workflowId = response.body.id;
    });

    it('should get workflow by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/workflows/${workflowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(workflowId);
      expect(response.body.name).toBe('Content Approval Workflow');
    });

    it('should list workflows', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should update workflow', async () => {
      const updateDto = {
        name: 'Updated Content Approval Workflow',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .put(`/workflows/${workflowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.description).toBe(updateDto.description);
    });

    it('should get workflow analytics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/workflows/${workflowId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalInstances');
      expect(response.body).toHaveProperty('completedInstances');
      expect(response.body).toHaveProperty('completionRate');
    });
  });

  describe('Workflow Instances', () => {
    let workflowId: string;
    let instanceId: string;
    let postId: string;

    beforeAll(async () => {
      // Create a test post
      const post = await prisma.post.create({
        data: {
          workspaceId,
          authorId: userId,
          content: { text: 'Test post for workflow' },
          status: 'DRAFT',
        },
      });
      postId = post.id;

      // Create workflow
      const workflow = await prisma.workflow.create({
        data: {
          workspaceId,
          name: 'Test Instance Workflow',
          type: 'APPROVAL',
          config: { entityTypes: ['post'] },
          createdBy: userId,
          steps: {
            create: [
              {
                name: 'Approval Step',
                type: 'APPROVAL',
                order: 0,
                config: {
                  approvers: [approver1Id],
                  approvalType: 'ALL',
                },
              },
            ],
          },
        },
        include: {
          steps: true,
        },
      });
      workflowId = workflow.id;
    });

    it('should start a workflow instance', async () => {
      const startDto = {
        workflowId,
        entityType: 'post',
        entityId: postId,
        metadata: {
          priority: 'high',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/workflows/instances')
        .set('Authorization', `Bearer ${authToken}`)
        .send(startDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('IN_PROGRESS');
      expect(response.body.entityType).toBe('post');
      expect(response.body.entityId).toBe(postId);
      instanceId = response.body.id;
    });

    it('should list workflow instances', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows/instances')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get workflow instance by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/workflows/instances/${instanceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(instanceId);
      expect(response.body.approvals).toBeInstanceOf(Array);
      expect(response.body.auditLogs).toBeInstanceOf(Array);
    });

    it('should filter instances by entity type', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows/instances')
        .query({ entityType: 'post' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((instance: any) => {
        expect(instance.entityType).toBe('post');
      });
    });
  });

  describe('Approvals', () => {
    let workflowId: string;
    let instanceId: string;
    let approvalId: string;
    let postId: string;

    beforeAll(async () => {
      // Create test post
      const post = await prisma.post.create({
        data: {
          workspaceId,
          authorId: userId,
          content: { text: 'Test post for approval' },
          status: 'DRAFT',
        },
      });
      postId = post.id;

      // Create workflow
      const workflow = await prisma.workflow.create({
        data: {
          workspaceId,
          name: 'Approval Test Workflow',
          type: 'APPROVAL',
          config: { entityTypes: ['post'] },
          createdBy: userId,
          steps: {
            create: [
              {
                name: 'Manager Approval',
                type: 'APPROVAL',
                order: 0,
                config: {
                  approvers: [approver1Id],
                  approvalType: 'ALL',
                },
              },
            ],
          },
        },
      });
      workflowId = workflow.id;

      // Start workflow instance
      const instance = await prisma.workflowInstance.create({
        data: {
          workflowId,
          entityType: 'post',
          entityId: postId,
          status: 'IN_PROGRESS',
        },
      });
      instanceId = instance.id;

      // Create approval
      const approval = await prisma.workflowApproval.create({
        data: {
          instanceId,
          stepId: workflow.steps[0].id,
          approverId: approver1Id,
          status: 'PENDING',
        },
      });
      approvalId = approval.id;
    });

    it('should list pending approvals', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows/approvals/pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should approve a workflow step', async () => {
      const approveDto = {
        action: ApprovalAction.APPROVE,
        comments: 'Looks good!',
      };

      const response = await request(app.getHttpServer())
        .put(`/workflows/approvals/${approvalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(approveDto)
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });

    it('should support bulk approval', async () => {
      // Create additional approvals
      const approval2 = await prisma.workflowApproval.create({
        data: {
          instanceId,
          stepId: (await prisma.workflowStep.findFirst({ where: { workflowId } }))!.id,
          approverId: approver2Id,
          status: 'PENDING',
        },
      });

      const bulkDto = {
        approvalIds: [approval2.id],
        action: ApprovalAction.APPROVE,
        comments: 'Bulk approved',
      };

      const response = await request(app.getHttpServer())
        .post('/workflows/approvals/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkDto)
        .expect(200);

      expect(response.body).toHaveProperty('successful');
      expect(response.body).toHaveProperty('failed');
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('Delegations', () => {
    let delegationId: string;

    it('should create a delegation', async () => {
      const createDto = {
        toUserId: approver2Id,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Vacation',
      };

      const response = await request(app.getHttpServer())
        .post('/workflows/delegations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.toUserId).toBe(approver2Id);
      delegationId = response.body.id;
    });

    it('should list delegations', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows/delegations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should list active delegations', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows/delegations/active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should get delegation by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/workflows/delegations/${delegationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(delegationId);
    });

    it('should update delegation', async () => {
      const updateDto = {
        reason: 'Extended vacation',
      };

      const response = await request(app.getHttpServer())
        .put(`/workflows/delegations/${delegationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.reason).toBe(updateDto.reason);
    });

    it('should cancel delegation', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/workflows/delegations/${delegationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Conditional Routing', () => {
    it('should create workflow with conditional steps', async () => {
      const createDto = {
        name: 'Conditional Workflow',
        description: 'Workflow with conditional routing',
        type: WorkflowType.APPROVAL,
        config: {
          triggerType: 'AUTOMATIC',
          entityTypes: ['post'],
        },
        steps: [
          {
            name: 'High Value Check',
            type: WorkflowStepType.CONDITION,
            order: 0,
            config: {},
            conditions: [
              {
                field: 'campaign.budget',
                operator: ConditionOperator.GREATER_THAN,
                value: 10000,
              },
            ],
          },
          {
            name: 'Executive Approval',
            type: WorkflowStepType.APPROVAL,
            order: 1,
            config: {
              approvers: [approver2Id],
              approvalType: 'ALL',
            },
          },
        ],
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.steps[0].conditions).toHaveLength(1);
      expect(response.body.steps[0].conditions[0].operator).toBe(ConditionOperator.GREATER_THAN);
    });
  });

  describe('Analytics', () => {
    it('should get analytics overview', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalInstances');
      expect(response.body).toHaveProperty('completedInstances');
      expect(response.body).toHaveProperty('rejectedInstances');
      expect(response.body).toHaveProperty('inProgressInstances');
      expect(response.body).toHaveProperty('completionRate');
      expect(response.body).toHaveProperty('rejectionRate');
      expect(response.body).toHaveProperty('avgCompletionTime');
    });
  });
});
