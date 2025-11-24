import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { MultiWorkspaceService } from './multi-workspace.service';
import { MultiWorkspaceController } from './multi-workspace.controller';
import { WhiteLabelService } from './services/white-label.service';
import { EmailTemplateService } from './services/email-template.service';
import { ReportBrandingService } from './services/report-branding.service';
import { WhiteLabelController } from './controllers/white-label.controller';
import { CustomDomainMiddleware } from './middleware/custom-domain.middleware';
import { Tenant } from './entities/tenant.entity';
import { WorkspaceTemplate } from './entities/workspace-template.entity';
import { ClientPortalAccess } from './entities/client-portal-access.entity';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, WorkspaceTemplate, ClientPortalAccess]),
    PrismaModule,
  ],
  controllers: [TenantController, MultiWorkspaceController, WhiteLabelController],
  providers: [
    TenantService,
    MultiWorkspaceService,
    WhiteLabelService,
    EmailTemplateService,
    ReportBrandingService,
    CustomDomainMiddleware,
  ],
  exports: [
    TenantService,
    MultiWorkspaceService,
    WhiteLabelService,
    EmailTemplateService,
    ReportBrandingService,
  ],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CustomDomainMiddleware).forRoutes('*');
  }
}