import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmployeeAdvocacyController } from './employee-advocacy.controller';
import {
  EmployeeProfileService,
  AdvocacyContentService,
  EmployeeShareService,
  GamificationService,
  LeaderboardService,
  ContentSuggestionService,
  AdvocacySettingsService,
} from './services';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeAdvocacyController],
  providers: [
    EmployeeProfileService,
    AdvocacyContentService,
    EmployeeShareService,
    GamificationService,
    LeaderboardService,
    ContentSuggestionService,
    AdvocacySettingsService,
  ],
  exports: [
    EmployeeProfileService,
    AdvocacyContentService,
    EmployeeShareService,
    GamificationService,
    LeaderboardService,
    ContentSuggestionService,
    AdvocacySettingsService,
  ],
})
export class EmployeeAdvocacyModule {}
