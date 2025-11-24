import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DesignToolService } from '../services/design-tools/design-tool.service';
import {
  ConnectDesignToolDto,
  DesignToolProvider,
  CanvaDesignDto,
  CreateCanvaDesignDto,
  AdobeAssetDto,
  StockPhotoSearchDto,
  DownloadStockPhotoDto,
  ImportAssetDto,
} from '../dto/design-tool.dto';

@ApiTags('Design Tool Integrations')
@ApiBearerAuth()
@Controller('integrations/design-tools')
export class DesignToolController {
  constructor(private readonly designToolService: DesignToolService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect a design tool integration' })
  @ApiResponse({ status: 201, description: 'Design tool connected successfully' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async connectDesignTool(@Request() req: any, @Body() dto: ConnectDesignToolDto) {
    return this.designToolService.connectDesignTool(req.user.workspaceId, req.user.id, dto);
  }

  @Get('connected')
  @ApiOperation({ summary: 'Get all connected design tools' })
  @ApiResponse({ status: 200, description: 'List of connected design tools' })
  async getConnectedTools(@Request() req: any) {
    return this.designToolService.getConnectedTools(req.user.workspaceId);
  }

  @Delete(':integrationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect a design tool' })
  @ApiResponse({ status: 204, description: 'Design tool disconnected successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async disconnectDesignTool(@Request() req: any, @Param('integrationId') integrationId: string) {
    return this.designToolService.disconnectDesignTool(req.user.workspaceId, integrationId);
  }

  // Canva endpoints
  @Post('canva/designs')
  @ApiOperation({ summary: 'Create a new Canva design' })
  @ApiResponse({ status: 201, description: 'Canva design created successfully' })
  async createCanvaDesign(@Request() req: any, @Body() dto: CreateCanvaDesignDto) {
    return this.designToolService.createCanvaDesign(req.user.workspaceId, dto);
  }

  @Get('canva/designs')
  @ApiOperation({ summary: 'List Canva designs' })
  @ApiResponse({ status: 200, description: 'List of Canva designs' })
  async listCanvaDesigns(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.designToolService.listCanvaDesigns(req.user.workspaceId, page, perPage);
  }

  @Post('canva/designs/export')
  @ApiOperation({ summary: 'Export a Canva design' })
  @ApiResponse({ status: 200, description: 'Canva design exported successfully' })
  async exportCanvaDesign(@Request() req: any, @Body() dto: CanvaDesignDto) {
    return this.designToolService.exportCanvaDesign(req.user.workspaceId, dto);
  }

  @Get('canva/designs/:designId/edit-url')
  @ApiOperation({ summary: 'Get Canva design edit URL' })
  @ApiResponse({ status: 200, description: 'Edit URL retrieved successfully' })
  async getCanvaEditUrl(@Request() req: any, @Param('designId') designId: string) {
    return this.designToolService.getCanvaEditUrl(req.user.workspaceId, designId);
  }

  // Adobe endpoints
  @Get('adobe/assets')
  @ApiOperation({ summary: 'List Adobe Creative Cloud assets' })
  @ApiResponse({ status: 200, description: 'List of Adobe assets' })
  async listAdobeAssets(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('assetType') assetType?: string,
  ) {
    return this.designToolService.listAdobeAssets(req.user.workspaceId, page, perPage, assetType);
  }

  @Post('adobe/assets/get')
  @ApiOperation({ summary: 'Get Adobe asset details' })
  @ApiResponse({ status: 200, description: 'Adobe asset retrieved successfully' })
  async getAdobeAsset(@Request() req: any, @Body() dto: AdobeAssetDto) {
    return this.designToolService.getAdobeAsset(req.user.workspaceId, dto);
  }

  // Stock photo endpoints
  @Post('stock-photos/search')
  @ApiOperation({ summary: 'Search stock photos' })
  @ApiResponse({ status: 200, description: 'Stock photos search results' })
  async searchStockPhotos(
    @Request() req: any,
    @Query('provider') provider: DesignToolProvider,
    @Body() dto: StockPhotoSearchDto,
  ) {
    return this.designToolService.searchStockPhotos(req.user.workspaceId, provider, dto);
  }

  @Post('stock-photos/download')
  @ApiOperation({ summary: 'Download and import stock photo' })
  @ApiResponse({ status: 200, description: 'Stock photo downloaded and imported successfully' })
  async downloadStockPhoto(@Request() req: any, @Body() dto: DownloadStockPhotoDto) {
    return this.designToolService.downloadStockPhoto(req.user.workspaceId, dto);
  }

  // Asset import endpoint
  @Post('import')
  @ApiOperation({ summary: 'Import asset from design tool' })
  @ApiResponse({ status: 200, description: 'Asset imported successfully' })
  async importAsset(@Request() req: any, @Body() dto: ImportAssetDto) {
    return this.designToolService.importAsset(req.user.workspaceId, dto);
  }
}
