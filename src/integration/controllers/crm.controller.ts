import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CRMService } from '../services/crm/crm.service';
import {
  CreateCRMIntegrationDto,
  SyncContactDto,
  SyncLeadDto,
  ContactEnrichmentDto,
  LeadAttributionDto,
} from '../dto/crm-sync.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/crm')
@UseGuards(JwtAuthGuard)
export class CRMController {
  constructor(private readonly crmService: CRMService) {}

  /**
   * Create a new CRM integration
   * POST /api/crm/integrations
   */
  @Post('integrations')
  async createIntegration(
    @Request() req: any,
    @Body() dto: CreateCRMIntegrationDto,
  ) {
    return await this.crmService.createIntegration(
      req.user.workspaceId,
      req.user.userId,
      dto,
    );
  }

  /**
   * Sync contact to CRM
   * POST /api/crm/integrations/:id/contacts/sync
   */
  @Post('integrations/:id/contacts/sync')
  @HttpCode(HttpStatus.OK)
  async syncContact(
    @Param('id') integrationId: string,
    @Body() contact: SyncContactDto,
  ) {
    return await this.crmService.syncContact(integrationId, contact);
  }

  /**
   * Sync lead to CRM
   * POST /api/crm/integrations/:id/leads/sync
   */
  @Post('integrations/:id/leads/sync')
  @HttpCode(HttpStatus.OK)
  async syncLead(
    @Param('id') integrationId: string,
    @Body() lead: SyncLeadDto,
  ) {
    return await this.crmService.syncLead(integrationId, lead);
  }

  /**
   * Get contact from CRM by email
   * GET /api/crm/integrations/:id/contacts?email=xxx
   */
  @Get('integrations/:id/contacts')
  async getContact(
    @Param('id') integrationId: string,
    @Query('email') email: string,
  ) {
    return await this.crmService.getContactByEmail(integrationId, email);
  }

  /**
   * Get lead from CRM by email
   * GET /api/crm/integrations/:id/leads?email=xxx
   */
  @Get('integrations/:id/leads')
  async getLead(
    @Param('id') integrationId: string,
    @Query('email') email: string,
  ) {
    return await this.crmService.getLeadByEmail(integrationId, email);
  }

  /**
   * Enrich contact with social media data
   * POST /api/crm/integrations/:id/contacts/enrich
   */
  @Post('integrations/:id/contacts/enrich')
  @HttpCode(HttpStatus.OK)
  async enrichContact(
    @Param('id') integrationId: string,
    @Body() dto: ContactEnrichmentDto,
  ) {
    return await this.crmService.enrichContact(integrationId, dto);
  }

  /**
   * Track lead attribution
   * POST /api/crm/integrations/:id/leads/attribution
   */
  @Post('integrations/:id/leads/attribution')
  @HttpCode(HttpStatus.OK)
  async trackLeadAttribution(
    @Param('id') integrationId: string,
    @Body() dto: LeadAttributionDto,
  ) {
    return await this.crmService.trackLeadAttribution(integrationId, dto);
  }

  /**
   * Batch sync contacts
   * POST /api/crm/integrations/:id/contacts/batch-sync
   */
  @Post('integrations/:id/contacts/batch-sync')
  @HttpCode(HttpStatus.OK)
  async batchSyncContacts(
    @Param('id') integrationId: string,
    @Body() contacts: SyncContactDto[],
  ) {
    return await this.crmService.batchSyncContacts(integrationId, contacts);
  }

  /**
   * Batch sync leads
   * POST /api/crm/integrations/:id/leads/batch-sync
   */
  @Post('integrations/:id/leads/batch-sync')
  @HttpCode(HttpStatus.OK)
  async batchSyncLeads(
    @Param('id') integrationId: string,
    @Body() leads: SyncLeadDto[],
  ) {
    return await this.crmService.batchSyncLeads(integrationId, leads);
  }

  /**
   * Bidirectional sync from CRM
   * POST /api/crm/integrations/:id/sync-from-crm
   */
  @Post('integrations/:id/sync-from-crm')
  @HttpCode(HttpStatus.OK)
  async syncFromCRM(@Param('id') integrationId: string) {
    return await this.crmService.syncFromCRM(integrationId);
  }
}
