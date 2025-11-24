import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MarketingAutomationService } from '../services/marketing-automation/marketing-automation.service';
import {
  CreateMarketingAutomationIntegrationDto,
  SyncAudienceDto,
  CreateListDto,
  AddToListDto,
  UpdateContactDto,
  TrackEventDto,
  CreateWorkflowTriggerDto,
  GetAudienceStatsDto,
} from '../dto/marketing-automation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/marketing-automation')
@UseGuards(JwtAuthGuard)
export class MarketingAutomationController {
  constructor(
    private readonly marketingAutomationService: MarketingAutomationService,
  ) {}

  /**
   * Create a new marketing automation integration
   * POST /api/marketing-automation/integrations
   */
  @Post('integrations')
  async createIntegration(
    @Request() req: any,
    @Body() dto: CreateMarketingAutomationIntegrationDto,
  ) {
    return await this.marketingAutomationService.createIntegration(
      req.user.workspaceId,
      req.user.userId,
      dto,
    );
  }

  /**
   * Sync contact to marketing automation platform
   * POST /api/marketing-automation/integrations/:id/contacts/sync
   */
  @Post('integrations/:id/contacts/sync')
  @HttpCode(HttpStatus.OK)
  async syncContact(
    @Param('id') integrationId: string,
    @Body() contact: SyncAudienceDto,
  ) {
    return await this.marketingAutomationService.syncContact(
      integrationId,
      contact,
    );
  }

  /**
   * Get contact by email
   * GET /api/marketing-automation/integrations/:id/contacts?email=xxx
   */
  @Get('integrations/:id/contacts')
  async getContact(
    @Param('id') integrationId: string,
    @Query('email') email: string,
  ) {
    return await this.marketingAutomationService.getContactByEmail(
      integrationId,
      email,
    );
  }

  /**
   * Update contact
   * PUT /api/marketing-automation/integrations/:id/contacts/:contactId
   */
  @Put('integrations/:id/contacts/:contactId')
  @HttpCode(HttpStatus.OK)
  async updateContact(
    @Param('id') integrationId: string,
    @Param('contactId') contactId: string,
    @Body() data: UpdateContactDto,
  ) {
    return await this.marketingAutomationService.updateContact(
      integrationId,
      contactId,
      data,
    );
  }

  /**
   * Create a new list/audience
   * POST /api/marketing-automation/integrations/:id/lists
   */
  @Post('integrations/:id/lists')
  async createList(
    @Param('id') integrationId: string,
    @Body() list: CreateListDto,
  ) {
    return await this.marketingAutomationService.createList(integrationId, list);
  }

  /**
   * Get all lists
   * GET /api/marketing-automation/integrations/:id/lists
   */
  @Get('integrations/:id/lists')
  async getLists(@Param('id') integrationId: string) {
    return await this.marketingAutomationService.getLists(integrationId);
  }

  /**
   * Add contacts to a list
   * POST /api/marketing-automation/integrations/:id/lists/add-contacts
   */
  @Post('integrations/:id/lists/add-contacts')
  @HttpCode(HttpStatus.OK)
  async addToList(
    @Param('id') integrationId: string,
    @Body() data: AddToListDto,
  ) {
    return await this.marketingAutomationService.addToList(integrationId, data);
  }

  /**
   * Remove contact from list
   * DELETE /api/marketing-automation/integrations/:id/lists/:listId/contacts
   */
  @Delete('integrations/:id/lists/:listId/contacts')
  @HttpCode(HttpStatus.OK)
  async removeFromList(
    @Param('id') integrationId: string,
    @Param('listId') listId: string,
    @Query('email') email: string,
  ) {
    return await this.marketingAutomationService.removeFromList(
      integrationId,
      listId,
      email,
    );
  }

  /**
   * Track custom event
   * POST /api/marketing-automation/integrations/:id/events
   */
  @Post('integrations/:id/events')
  @HttpCode(HttpStatus.OK)
  async trackEvent(
    @Param('id') integrationId: string,
    @Body() event: TrackEventDto,
  ) {
    return await this.marketingAutomationService.trackEvent(
      integrationId,
      event,
    );
  }

  /**
   * Get audience statistics
   * GET /api/marketing-automation/integrations/:id/stats
   */
  @Get('integrations/:id/stats')
  async getAudienceStats(
    @Param('id') integrationId: string,
    @Query() query: GetAudienceStatsDto,
  ) {
    return await this.marketingAutomationService.getAudienceStats(
      integrationId,
      query.listId,
    );
  }

  /**
   * Get campaigns
   * GET /api/marketing-automation/integrations/:id/campaigns
   */
  @Get('integrations/:id/campaigns')
  async getCampaigns(@Param('id') integrationId: string) {
    return await this.marketingAutomationService.getCampaigns(integrationId);
  }

  /**
   * Batch sync contacts
   * POST /api/marketing-automation/integrations/:id/contacts/batch-sync
   */
  @Post('integrations/:id/contacts/batch-sync')
  @HttpCode(HttpStatus.OK)
  async batchSyncContacts(
    @Param('id') integrationId: string,
    @Body() contacts: SyncAudienceDto[],
  ) {
    return await this.marketingAutomationService.batchSyncContacts(
      integrationId,
      contacts,
    );
  }

  /**
   * Add tags to contact
   * POST /api/marketing-automation/integrations/:id/contacts/tags
   */
  @Post('integrations/:id/contacts/tags')
  @HttpCode(HttpStatus.OK)
  async addTags(
    @Param('id') integrationId: string,
    @Body() body: { email: string; tags: string[] },
  ) {
    return await this.marketingAutomationService.addTags(
      integrationId,
      body.email,
      body.tags,
    );
  }

  /**
   * Remove tags from contact
   * DELETE /api/marketing-automation/integrations/:id/contacts/tags
   */
  @Delete('integrations/:id/contacts/tags')
  @HttpCode(HttpStatus.OK)
  async removeTags(
    @Param('id') integrationId: string,
    @Body() body: { email: string; tags: string[] },
  ) {
    return await this.marketingAutomationService.removeTags(
      integrationId,
      body.email,
      body.tags,
    );
  }

  /**
   * Subscribe contact to list
   * POST /api/marketing-automation/integrations/:id/lists/:listId/subscribe
   */
  @Post('integrations/:id/lists/:listId/subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribeToList(
    @Param('id') integrationId: string,
    @Param('listId') listId: string,
    @Body() body: { email: string },
  ) {
    return await this.marketingAutomationService.subscribeToList(
      integrationId,
      body.email,
      listId,
    );
  }

  /**
   * Unsubscribe contact from list
   * POST /api/marketing-automation/integrations/:id/lists/:listId/unsubscribe
   */
  @Post('integrations/:id/lists/:listId/unsubscribe')
  @HttpCode(HttpStatus.OK)
  async unsubscribeFromList(
    @Param('id') integrationId: string,
    @Param('listId') listId: string,
    @Body() body: { email: string },
  ) {
    return await this.marketingAutomationService.unsubscribeFromList(
      integrationId,
      body.email,
      listId,
    );
  }

  /**
   * Create workflow trigger
   * POST /api/marketing-automation/integrations/:id/triggers
   */
  @Post('integrations/:id/triggers')
  async createWorkflowTrigger(
    @Request() req: any,
    @Param('id') integrationId: string,
    @Body() dto: CreateWorkflowTriggerDto,
  ) {
    return await this.marketingAutomationService.createWorkflowTrigger(
      req.user.workspaceId,
      integrationId,
      dto,
    );
  }

  /**
   * Sync audience from social platform
   * POST /api/marketing-automation/integrations/:id/sync-from-social
   */
  @Post('integrations/:id/sync-from-social')
  @HttpCode(HttpStatus.OK)
  async syncAudienceFromSocial(
    @Request() req: any,
    @Param('id') integrationId: string,
    @Body() body: { socialAccountId: string; listId: string },
  ) {
    return await this.marketingAutomationService.syncAudienceFromSocial(
      req.user.workspaceId,
      integrationId,
      body.socialAccountId,
      body.listId,
    );
  }
}
