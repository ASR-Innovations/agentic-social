import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { InfluencerCampaignService } from './services/influencer-campaign.service';
import { InfluencerCollaborationService } from './services/influencer-collaboration.service';
import { InfluencerRelationshipService } from './services/influencer-relationship.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('Influencer Campaign Management (Integration)', () => {
  let prisma: PrismaService;
  let campaignService: InfluencerCampaignService;
  let collaborationService: InfluencerCollaborationService;
  let relationshipService: InfluencerRelationshipService;
  let workspaceId: string;
  let userId: string;
  let influencerId: string;
  let campaignId: string;
  let collaborationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        InfluencerCampaignService,
        InfluencerCollaborationService,
        InfluencerRelationshipService,
      ],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    campaignService = moduleFixture.get<InfluencerCampaignService>(InfluencerCampaignService);
    collaborationService = moduleFixture.get<InfluencerCollaborationService>(InfluencerCollaborationService);
    relationshipService = moduleFixture.get<InfluencerRelationshipService>(InfluencerRelationshipService);

    // Create test workspace and user
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace-' + Date.now(),
        plan: 'PROFESSIONAL',
      },
    });
    workspaceId = workspace.id;

    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'Test User',
        workspaceId,
        role: 'ADMIN',
      },
    });
    userId = user.id;

    // Create test influencer in Prisma
    const influencer = await prisma.influencer.create({
      data: {
        workspaceId,
        name: 'Test Influencer',
        niche: ['fashion', 'lifestyle'],
        overallScore: 85,
        totalFollowers: 50000,
        avgEngagementRate: 5.5,
        status: 'DISCOVERED',
      },
    });
    influencerId = influencer.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.influencerNote.deleteMany({ where: { influencerId } });
    await prisma.influencerCollaboration.deleteMany({ where: { workspaceId } });
    await prisma.influencerCampaign.deleteMany({ where: { workspaceId } });
    await prisma.influencer.deleteMany({ where: { workspaceId } });
    await prisma.user.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
  });

  describe('Campaign Management', () => {
    it('should create a new influencer campaign', async () => {
      const campaign = await campaignService.createCampaign(workspaceId, {
        name: 'Summer Fashion Campaign',
        description: 'Promote summer collection',
        objectives: ['brand awareness', 'sales'],
        budget: 10000,
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-08-31T23:59:59Z',
        targetNiches: ['fashion', 'lifestyle'],
        targetPlatforms: ['INSTAGRAM', 'TIKTOK'],
        minFollowers: 10000,
        maxFollowers: 100000,
        minEngagementRate: 3.0,
      });

      expect(campaign).toHaveProperty('id');
      expect(campaign.name).toBe('Summer Fashion Campaign');
      expect(campaign.status).toBe('DRAFT');
      expect(campaign.budget).toBe(10000);

      campaignId = campaign.id;
    });

    it('should list campaigns', async () => {
      const result = await campaignService.listCampaigns(workspaceId, {});

      expect(result).toHaveProperty('campaigns');
      expect(result).toHaveProperty('pagination');
      expect(result.campaigns.length).toBeGreaterThan(0);
    });

    it('should get campaign by ID', async () => {
      const campaign = await campaignService.getCampaignById(workspaceId, campaignId);

      expect(campaign.id).toBe(campaignId);
      expect(campaign.name).toBe('Summer Fashion Campaign');
    });

    it('should update campaign', async () => {
      const campaign = await campaignService.updateCampaign(workspaceId, campaignId, {
        status: 'ACTIVE',
        budget: 12000,
      });

      expect(campaign.status).toBe('ACTIVE');
      expect(campaign.budget).toBe(12000);
    });

    it('should find matching influencers for campaign', async () => {
      const result = await campaignService.findMatchingInfluencers(workspaceId, campaignId);

      expect(result).toHaveProperty('matches');
      expect(result).toHaveProperty('total');
    });

    it('should get campaign analytics', async () => {
      const analytics = await campaignService.getCampaignAnalytics(workspaceId, campaignId);

      expect(analytics).toHaveProperty('campaign');
      expect(analytics).toHaveProperty('metrics');
      expect(analytics).toHaveProperty('collaborations');
    });
  });

  describe('Collaboration Management', () => {
    it('should create a collaboration', async () => {
      const collaboration = await collaborationService.createCollaboration(workspaceId, {
        influencerId,
        campaignId,
        type: 'SPONSORED_POST',
        status: 'PROPOSED',
        deliverables: ['1 Instagram post', '3 Stories'],
        compensation: 1500,
        startDate: '2024-06-15T00:00:00Z',
        endDate: '2024-06-30T23:59:59Z',
      });

      expect(collaboration).toHaveProperty('id');
      expect(collaboration.type).toBe('SPONSORED_POST');
      expect(collaboration.compensation).toBe(1500);

      collaborationId = collaboration.id;
    });

    it('should list collaborations', async () => {
      const result = await collaborationService.listCollaborations(workspaceId, {});

      expect(result).toHaveProperty('collaborations');
      expect(result.collaborations.length).toBeGreaterThan(0);
    });

    it('should get collaboration by ID', async () => {
      const collaboration = await collaborationService.getCollaborationById(workspaceId, collaborationId);

      expect(collaboration.id).toBe(collaborationId);
      expect(collaboration.type).toBe('SPONSORED_POST');
    });

    it('should update collaboration status', async () => {
      const collaboration = await collaborationService.updateCollaboration(workspaceId, collaborationId, {
        status: 'ACCEPTED',
        contractSigned: true,
      });

      expect(collaboration.status).toBe('ACCEPTED');
      expect(collaboration.contractSigned).toBe(true);
    });

    it('should track deliverable completion', async () => {
      const collaboration = await collaborationService.trackDeliverable(
        workspaceId,
        collaborationId,
        '1 Instagram post',
      );

      expect(collaboration.actualDeliverables).toContain('1 Instagram post');
    });

    it('should update performance metrics', async () => {
      const collaboration = await collaborationService.updatePerformanceMetrics(
        workspaceId,
        collaborationId,
        {
          reach: 45000,
          engagement: 2250,
          conversions: 50,
          impressions: 60000,
          clicks: 1200,
        },
      );

      expect(collaboration.performanceMetrics).toHaveProperty('reach');
      expect((collaboration.performanceMetrics as any).reach).toBe(45000);
    });

    it('should get collaboration performance', async () => {
      const performance = await collaborationService.getCollaborationPerformance(
        workspaceId,
        collaborationId,
      );

      expect(performance).toHaveProperty('metrics');
      expect(performance).toHaveProperty('deliverables');
      expect(performance.metrics.reach).toBe(45000);
    });
  });

  describe('Relationship Management', () => {
    it('should add a note to influencer', async () => {
      const note = await relationshipService.addNote(
        workspaceId,
        influencerId,
        userId,
        { content: 'Great engagement on recent posts' },
      );

      expect(note).toHaveProperty('id');
      expect(note.content).toBe('Great engagement on recent posts');
    });

    it('should get influencer notes', async () => {
      const notes = await relationshipService.getNotes(workspaceId, influencerId);

      expect(Array.isArray(notes)).toBe(true);
      expect(notes.length).toBeGreaterThan(0);
    });

    it('should get relationship history', async () => {
      const history = await relationshipService.getRelationshipHistory(workspaceId, influencerId);

      expect(history).toHaveProperty('influencer');
      expect(history).toHaveProperty('relationshipMetrics');
      expect(history).toHaveProperty('collaborations');
      expect(history).toHaveProperty('notes');
    });

    it('should get payment summary', async () => {
      const summary = await relationshipService.getPaymentSummary(workspaceId, influencerId);

      expect(summary).toHaveProperty('summary');
      expect(summary).toHaveProperty('payments');
      expect(summary.summary).toHaveProperty('totalPaid');
      expect(summary.summary).toHaveProperty('totalPending');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-existent campaign', async () => {
      await expect(
        campaignService.getCampaignById(workspaceId, 'non-existent-id'),
      ).rejects.toThrow('Campaign not found');
    });

    it('should throw error for invalid date range', async () => {
      await expect(
        campaignService.createCampaign(workspaceId, {
          name: 'Invalid Campaign',
          objectives: ['test'],
          startDate: '2024-08-31T00:00:00Z',
          endDate: '2024-06-01T00:00:00Z', // End before start
          targetNiches: ['test'],
          targetPlatforms: ['INSTAGRAM'],
        }),
      ).rejects.toThrow('End date must be after start date');
    });

    it('should throw error for non-existent influencer in collaboration', async () => {
      await expect(
        collaborationService.createCollaboration(workspaceId, {
          influencerId: 'non-existent-id',
          type: 'SPONSORED_POST',
          deliverables: ['test'],
        }),
      ).rejects.toThrow('Influencer not found');
    });
  });
});
