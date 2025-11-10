import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { AIService } from './ai.service';
import {
  GenerateCaptionDto,
  GenerateContentDto,
  GenerateImageDto,
  GenerateHashtagsDto,
  ImproveContentDto,
  TranslateContentDto,
  AnalyzeSentimentDto,
} from './dto/ai-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIRequestType } from './entities/ai-request.entity';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  /**
   * Generate captions
   * POST /api/v1/ai/generate/caption
   */
  @Post('generate/caption')
  async generateCaption(@Request() req, @Body() dto: GenerateCaptionDto) {
    return this.aiService.generateCaption(req.user.tenantId, req.user.userId, dto);
  }

  /**
   * Generate content
   * POST /api/v1/ai/generate/content
   */
  @Post('generate/content')
  async generateContent(@Request() req, @Body() dto: GenerateContentDto) {
    return this.aiService.generateContent(req.user.tenantId, req.user.userId, dto);
  }

  /**
   * Generate image
   * POST /api/v1/ai/generate/image
   */
  @Post('generate/image')
  async generateImage(@Request() req, @Body() dto: GenerateImageDto) {
    return this.aiService.generateImage(req.user.tenantId, req.user.userId, dto);
  }

  /**
   * Generate hashtags
   * POST /api/v1/ai/generate/hashtags
   */
  @Post('generate/hashtags')
  async generateHashtags(@Request() req, @Body() dto: GenerateHashtagsDto) {
    return this.aiService.generateHashtags(req.user.tenantId, req.user.userId, dto);
  }

  /**
   * Improve content
   * POST /api/v1/ai/improve
   */
  @Post('improve')
  async improveContent(@Request() req, @Body() dto: ImproveContentDto) {
    return this.aiService.improveContent(req.user.tenantId, req.user.userId, dto);
  }

  /**
   * Get AI request history
   * GET /api/v1/ai/history
   */
  @Get('history')
  async getHistory(
    @Request() req,
    @Query('type') type?: AIRequestType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.aiService.getRequestHistory(req.user.tenantId, {
      type,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  /**
   * Get AI usage statistics
   * GET /api/v1/ai/usage
   */
  @Get('usage')
  async getUsage(@Request() req) {
    return this.aiService.getUsageStats(req.user.tenantId);
  }
}
