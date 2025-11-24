import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmployeeAdvocacyModule } from './employee-advocacy.module';
import {
  EmployeeProfileService,
  AdvocacyContentService,
  EmployeeShareService,
  GamificationService,
  LeaderboardService,
  ContentSuggestionService,
  AdvocacySettingsService,
} from './services';

describe('Employee Advocacy Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let employeeProfileService: EmployeeProfileService;
  let advocacyContentService: AdvocacyContentService;
  let employeeShareService: EmployeeShareService;
  let gamificationService: GamificationService;
  let leaderboardService: LeaderboardService;
  let contentSuggestionService: ContentSuggestionService;
  let advocacySettingsService: AdvocacySettingsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EmployeeAdvocacyModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    employeeProfileService = moduleFixture.get<EmployeeProfileService>(EmployeeProfileService);
    advocacyContentService = moduleFixture.get<AdvocacyContentService>(AdvocacyContentService);
    employeeShareService = moduleFixture.get<EmployeeShareService>(EmployeeShareService);
    gamificationService = moduleFixture.get<GamificationService>(GamificationService);
    leaderboardService = moduleFixture.get<LeaderboardService>(LeaderboardService);
    contentSuggestionService = moduleFixture.get<ContentSuggestionService>(ContentSuggestionService);
    advocacySettingsService = moduleFixture.get<AdvocacySettingsService>(AdvocacySettingsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Module Initialization', () => {
    it('should initialize all services', () => {
      expect(employeeProfileService).toBeDefined();
      expect(advocacyContentService).toBeDefined();
      expect(employeeShareService).toBeDefined();
      expect(gamificationService).toBeDefined();
      expect(leaderboardService).toBeDefined();
      expect(contentSuggestionService).toBeDefined();
      expect(advocacySettingsService).toBeDefined();
    });
  });

  describe('Service Dependencies', () => {
    it('should have PrismaService injected', () => {
      expect(prisma).toBeDefined();
    });
  });
});
