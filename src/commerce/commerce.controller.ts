import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommerceService } from './commerce.service';
import { ProductService } from './services/product.service';
import { IntegrationService } from './services/integration.service';
import { ConversionTrackingService } from './services/conversion-tracking.service';
import { CommerceAnalyticsService } from './services/commerce-analytics.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { SyncProductsDto } from './dto/sync-products.dto';
import { TagProductDto } from './dto/tag-product.dto';
import { CreateShoppablePostDto } from './dto/create-shoppable-post.dto';
import { TrackConversionDto } from './dto/track-conversion.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { CommerceAnalyticsQueryDto } from './dto/commerce-analytics-query.dto';

@Controller('commerce')
@UseGuards(JwtAuthGuard)
export class CommerceController {
  constructor(
    private readonly commerceService: CommerceService,
    private readonly productService: ProductService,
    private readonly integrationService: IntegrationService,
    private readonly conversionTrackingService: ConversionTrackingService,
    private readonly commerceAnalyticsService: CommerceAnalyticsService,
  ) {}

  // Integration endpoints
  @Post('integrations')
  async createIntegration(@Request() req, @Body() dto: CreateIntegrationDto) {
    return this.integrationService.createIntegration(req.user.workspaceId, dto);
  }

  @Get('integrations')
  async getIntegrations(@Request() req) {
    return this.integrationService.getIntegrations(req.user.workspaceId);
  }

  @Get('integrations/:id')
  async getIntegration(@Request() req, @Param('id') id: string) {
    return this.integrationService.getIntegration(id, req.user.workspaceId);
  }

  @Put('integrations/:id')
  async updateIntegration(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.integrationService.updateIntegration(id, req.user.workspaceId, dto);
  }

  @Delete('integrations/:id')
  async deleteIntegration(@Request() req, @Param('id') id: string) {
    return this.integrationService.deleteIntegration(id, req.user.workspaceId);
  }

  @Post('integrations/:id/test')
  async testIntegration(@Request() req, @Param('id') id: string) {
    const isConnected = await this.integrationService.testIntegrationConnection(id, req.user.workspaceId);
    return { connected: isConnected };
  }

  // Product endpoints
  @Post('products/sync')
  async syncProducts(@Request() req, @Body() dto: SyncProductsDto) {
    return this.productService.syncProducts(dto.integrationId, req.user.workspaceId, {
      fullSync: dto.fullSync,
      cursor: dto.cursor,
    });
  }

  @Get('products')
  async getProducts(@Request() req, @Query() query: QueryProductsDto) {
    return this.productService.getProducts(req.user.workspaceId, query);
  }

  @Get('products/:id')
  async getProduct(@Request() req, @Param('id') id: string) {
    return this.productService.getProduct(id, req.user.workspaceId);
  }

  @Post('products/tag')
  async tagProduct(@Request() req, @Body() dto: TagProductDto) {
    return this.productService.tagProductInPost(req.user.workspaceId, dto);
  }

  @Delete('products/tags/:id')
  async removeProductTag(@Request() req, @Param('id') id: string) {
    return this.productService.removeProductTag(id, req.user.workspaceId);
  }

  // Shoppable post endpoints
  @Post('shoppable-posts')
  async createShoppablePost(@Request() req, @Body() dto: CreateShoppablePostDto) {
    return this.commerceService.createShoppablePost(req.user.workspaceId, dto);
  }

  @Get('shoppable-posts/:postId')
  async getShoppablePost(@Request() req, @Param('postId') postId: string) {
    return this.commerceService.getShoppablePost(postId, req.user.workspaceId);
  }

  // Conversion tracking endpoints
  @Post('conversions')
  async trackConversion(@Request() req, @Body() dto: TrackConversionDto) {
    return this.conversionTrackingService.trackConversion(req.user.workspaceId, dto);
  }

  @Get('conversions')
  async getConversions(@Request() req, @Query() query: any) {
    return this.conversionTrackingService.getConversions(req.user.workspaceId, query);
  }

  @Get('conversions/funnel')
  async getConversionFunnel(@Request() req, @Query() query: any) {
    return this.conversionTrackingService.getConversionFunnel(req.user.workspaceId, query);
  }

  // Analytics endpoints
  @Get('analytics')
  async getAnalytics(@Request() req, @Query() query: CommerceAnalyticsQueryDto) {
    return this.commerceAnalyticsService.getAnalytics(req.user.workspaceId, query);
  }

  @Get('analytics/top-products')
  async getTopProducts(@Request() req, @Query() query: any) {
    return this.commerceAnalyticsService.getTopProducts(req.user.workspaceId, query);
  }

  // Overview endpoint
  @Get('overview')
  async getOverview(@Request() req, @Query() query: any) {
    return this.commerceService.getCommerceOverview(req.user.workspaceId, query);
  }
}
