import { Test, TestingModule } from '@nestjs/testing';
import { PaidSocialService } from './paid-social.service';
import { PaidSocialModule } from './paid-social.module';
import { PrismaService } from '../prisma/prisma.service';
import { AdCampaignObjective, AdPlatform, BidStrategy } from './dto';

describe('PaidSocialService Integration Tests', () => {
  let service: PaidSocialService;
  let prisma: PrismaService;
  let testWorkspaceId: string;
  let testUserId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PaidSocialModule],
    }).compile();

    service = module.get<PaidSocialService>(PaidSocialService);
    prisma = module.get<PrismaService>(PrismaService);

    // Create test workspace and user
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace-paid-social',
        plan: 'PROFESSIONAL',
      },
    });
    testWorkspaceId = workspace.id;

    const user = await prisma.user.create({
      data: {
        email: 'test-paid-social@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        workspaceId: testWorkspaceId,
        role: 'ADMIN',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { workspaceId: testWorkspaceId } });
    await prisma.workspace.delete({ where: { id: testWorkspaceId } });
    await prisma.$disconnect();
  });

  describe('Campaign Management', () => {
    it('should create a new ad campaign', async () => {
      const campaign = await service.createCampaign(testWorkspaceId, testUserId, {
        name: 'Test Campaign',
        objective: AdCampaignObjective.CONVERSIONS,
        platforms: [AdPlatform.FACEBOOK, AdPlatform.INSTAGRAM],
        totalBudget: 1000,
        dailyBudget: 100,
        bidStrategy: BidStrategy.LOWEST_COST,
      });

      expect(campaign).toBeDefined();
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.workspaceId).toBe(testWorkspaceId);
    });
  });
});
