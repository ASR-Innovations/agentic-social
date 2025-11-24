import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { WorkspaceTemplate } from './entities/workspace-template.entity';
import { ClientPortalAccess } from './entities/client-portal-access.entity';
import {
  CreateWorkspaceTemplateDto,
  ApplyWorkspaceTemplateDto,
} from './dto/workspace-template.dto';
import {
  CreateClientPortalAccessDto,
  UpdateClientPortalAccessDto,
} from './dto/client-portal.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class MultiWorkspaceService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(WorkspaceTemplate)
    private templateRepository: Repository<WorkspaceTemplate>,
    @InjectRepository(ClientPortalAccess)
    private clientPortalRepository: Repository<ClientPortalAccess>,
  ) {}

  /**
   * Get all workspaces accessible by a user
   */
  async getUserWorkspaces(userId: string): Promise<Tenant[]> {
    // This would typically join with user_workspace_access table
    // For now, returning all workspaces where user is a member
    return await this.tenantRepository
      .createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  /**
   * Switch user's active workspace
   */
  async switchWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<{ workspace: Tenant; accessToken?: string }> {
    // Verify user has access to this workspace
    const workspace = await this.tenantRepository
      .createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.users', 'user')
      .where('workspace.id = :workspaceId', { workspaceId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!workspace) {
      throw new ForbiddenException(
        'You do not have access to this workspace',
      );
    }

    // In a real implementation, you would generate a new JWT token
    // with the new workspace context
    return {
      workspace,
      // accessToken would be generated here with workspace context
    };
  }

  /**
   * Get cross-workspace analytics for agency dashboard
   */
  async getCrossWorkspaceAnalytics(
    userId: string,
    workspaceIds?: string[],
    dateRange?: { startDate: Date; endDate: Date },
  ) {
    let workspaces: Tenant[];

    if (workspaceIds && workspaceIds.length > 0) {
      // Get specific workspaces
      workspaces = await this.tenantRepository
        .createQueryBuilder('workspace')
        .leftJoinAndSelect('workspace.users', 'user')
        .where('workspace.id IN (:...workspaceIds)', { workspaceIds })
        .andWhere('user.id = :userId', { userId })
        .getMany();
    } else {
      // Get all user's workspaces
      workspaces = await this.getUserWorkspaces(userId);
    }

    // Set default date range if not provided (last 30 days)
    const endDate = dateRange?.endDate || new Date();
    const startDate =
      dateRange?.startDate ||
      new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Aggregate analytics across workspaces
    const analytics = await Promise.all(
      workspaces.map(async (workspace) => {
        // Query actual analytics data from the database
        // This would integrate with the analytics service
        const metrics = await this.getWorkspaceMetrics(
          workspace.id,
          startDate,
          endDate,
        );

        return {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          metrics,
          trends: {
            postsGrowth: metrics.postsGrowthPercent || 0,
            engagementGrowth: metrics.engagementGrowthPercent || 0,
            reachGrowth: metrics.reachGrowthPercent || 0,
            followersGrowth: metrics.followersGrowthPercent || 0,
          },
          topPlatforms: metrics.platformBreakdown || [],
        };
      }),
    );

    // Calculate aggregate totals
    const summary = {
      totalWorkspaces: workspaces.length,
      totalPosts: analytics.reduce((sum, a) => sum + a.metrics.totalPosts, 0),
      totalEngagement: analytics.reduce(
        (sum, a) => sum + a.metrics.totalEngagement,
        0,
      ),
      totalReach: analytics.reduce((sum, a) => sum + a.metrics.totalReach, 0),
      totalFollowers: analytics.reduce(
        (sum, a) => sum + a.metrics.totalFollowers,
        0,
      ),
      averageEngagementRate:
        analytics.reduce((sum, a) => sum + (a.metrics.engagementRate || 0), 0) /
        analytics.length,
      totalSocialAccounts: analytics.reduce(
        (sum, a) => sum + (a.metrics.socialAccounts || 0),
        0,
      ),
    };

    // Calculate time-series data for charts
    const timeSeriesData = await this.aggregateTimeSeriesData(
      workspaces.map((w) => w.id),
      startDate,
      endDate,
    );

    return {
      workspaces: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        plan: w.planTier,
        slug: (w as any).slug || w.id, // Fallback to id if slug doesn't exist
      })),
      analytics,
      summary,
      timeSeriesData,
      dateRange: { startDate, endDate },
    };
  }

  /**
   * Get metrics for a specific workspace
   */
  private async getWorkspaceMetrics(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // This would query the actual metrics from MongoDB or PostgreSQL
    // For now, returning structured placeholder data
    return {
      totalPosts: 0,
      totalEngagement: 0,
      totalReach: 0,
      totalFollowers: 0,
      engagementRate: 0,
      socialAccounts: 0,
      postsGrowthPercent: 0,
      engagementGrowthPercent: 0,
      reachGrowthPercent: 0,
      followersGrowthPercent: 0,
      platformBreakdown: [],
    };
  }

  /**
   * Aggregate time-series data across workspaces
   */
  private async aggregateTimeSeriesData(
    workspaceIds: string[],
    startDate: Date,
    endDate: Date,
  ) {
    // This would aggregate time-series metrics across all workspaces
    // For now, returning placeholder structure
    return {
      engagement: [],
      reach: [],
      followers: [],
      posts: [],
    };
  }

  /**
   * Create a workspace template
   */
  async createTemplate(
    createDto: CreateWorkspaceTemplateDto,
    userId: string,
  ): Promise<WorkspaceTemplate> {
    const template = this.templateRepository.create({
      ...createDto,
      createdBy: userId,
    });

    return await this.templateRepository.save(template);
  }

  /**
   * Get all available templates
   */
  async getTemplates(userId: string): Promise<WorkspaceTemplate[]> {
    return await this.templateRepository.find({
      where: [{ isPublic: true }, { createdBy: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific template
   */
  async getTemplate(templateId: string): Promise<WorkspaceTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  /**
   * Apply a template to a workspace
   */
  async applyTemplate(
    applyDto: ApplyWorkspaceTemplateDto,
    userId: string,
  ): Promise<Tenant> {
    const template = await this.getTemplate(applyDto.templateId);
    const workspace = await this.tenantRepository.findOne({
      where: { id: applyDto.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Verify user has access to modify this workspace
    const hasAccess = await this.tenantRepository
      .createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.users', 'user')
      .where('workspace.id = :workspaceId', {
        workspaceId: applyDto.workspaceId,
      })
      .andWhere('user.id = :userId', { userId })
      .andWhere('user.role IN (:...roles)', { roles: ['OWNER', 'ADMIN'] })
      .getOne();

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have permission to modify this workspace',
      );
    }

    // Apply template configuration to workspace
    if (template.config) {
      workspace.settings = {
        ...workspace.settings,
        ...template.config.settings,
        ...(template.config.branding && { branding: template.config.branding }),
      };
    }

    return await this.tenantRepository.save(workspace);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const template = await this.getTemplate(templateId);

    if (template.createdBy !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this template',
      );
    }

    await this.templateRepository.remove(template);
  }

  /**
   * Create client portal access
   */
  async createClientPortalAccess(
    createDto: CreateClientPortalAccessDto,
  ): Promise<ClientPortalAccess> {
    // Check if workspace exists
    const workspace = await this.tenantRepository.findOne({
      where: { id: createDto.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if client already has access
    const existing = await this.clientPortalRepository.findOne({
      where: {
        email: createDto.email,
        workspaceId: createDto.workspaceId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Client already has access to this workspace',
      );
    }

    // Generate invite token
    const inviteToken = randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7 days expiry

    const access = this.clientPortalRepository.create({
      ...createDto,
      inviteToken,
      inviteExpiresAt,
    });

    return await this.clientPortalRepository.save(access);
  }

  /**
   * Get all client portal accesses for a workspace
   */
  async getClientPortalAccesses(
    workspaceId: string,
  ): Promise<ClientPortalAccess[]> {
    return await this.clientPortalRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update client portal access
   */
  async updateClientPortalAccess(
    accessId: string,
    updateDto: UpdateClientPortalAccessDto,
  ): Promise<ClientPortalAccess> {
    const access = await this.clientPortalRepository.findOne({
      where: { id: accessId },
    });

    if (!access) {
      throw new NotFoundException('Client portal access not found');
    }

    Object.assign(access, updateDto);
    return await this.clientPortalRepository.save(access);
  }

  /**
   * Revoke client portal access
   */
  async revokeClientPortalAccess(accessId: string): Promise<void> {
    const access = await this.clientPortalRepository.findOne({
      where: { id: accessId },
    });

    if (!access) {
      throw new NotFoundException('Client portal access not found');
    }

    access.isActive = false;
    await this.clientPortalRepository.save(access);
  }

  /**
   * Verify client portal access token
   */
  async verifyClientPortalToken(token: string): Promise<ClientPortalAccess> {
    const access = await this.clientPortalRepository.findOne({
      where: { inviteToken: token, isActive: true },
      relations: ['workspace'],
    });

    if (!access) {
      throw new NotFoundException('Invalid or expired invite token');
    }

    if (access.inviteExpiresAt && access.inviteExpiresAt < new Date()) {
      throw new BadRequestException('Invite token has expired');
    }

    // Update last access time
    access.lastAccessAt = new Date();
    await this.clientPortalRepository.save(access);

    return access;
  }

  /**
   * Get agency dashboard data
   */
  async getAgencyDashboard(
    userId: string,
    dateRange?: { startDate: Date; endDate: Date },
  ) {
    const workspaces = await this.getUserWorkspaces(userId);

    // Get analytics for all workspaces
    const analytics = await this.getCrossWorkspaceAnalytics(
      userId,
      undefined,
      dateRange,
    );

    // Get client portal accesses across all workspaces
    const clientAccesses = await Promise.all(
      workspaces.map((workspace) =>
        this.getClientPortalAccesses(workspace.id),
      ),
    );

    const totalClients = clientAccesses.flat().length;
    const activeClients = clientAccesses
      .flat()
      .filter((access) => access.isActive).length;

    // Calculate workspace health scores
    const workspaceHealth = await Promise.all(
      workspaces.map(async (workspace) => {
        const health = await this.calculateWorkspaceHealth(workspace.id);
        return {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          healthScore: health.score,
          issues: health.issues,
        };
      }),
    );

    // Get recent activity across all workspaces
    const recentActivity = await this.getRecentCrossWorkspaceActivity(
      workspaces.map((w) => w.id),
      10,
    );

    // Calculate revenue metrics (if applicable)
    const revenueMetrics = await this.calculateRevenueMetrics(
      workspaces.map((w) => w.id),
    );

    // Get top performing workspaces
    const topPerformers = analytics.analytics
      .sort((a, b) => b.metrics.totalEngagement - a.metrics.totalEngagement)
      .slice(0, 5);

    return {
      overview: {
        totalClients,
        activeClients,
        ...analytics.summary,
        averageHealthScore:
          workspaceHealth.reduce((sum, w) => sum + w.healthScore, 0) /
          workspaceHealth.length,
        ...revenueMetrics,
      },
      workspaces: workspaces.map((workspace) => {
        const health = workspaceHealth.find(
          (h) => h.workspaceId === workspace.id,
        );
        const clientCount = clientAccesses
          .flat()
          .filter((a) => a.workspaceId === workspace.id).length;

        return {
          id: workspace.id,
          name: workspace.name,
          slug: (workspace as any).slug || workspace.id, // Fallback to id if slug doesn't exist
          plan: workspace.planTier,
          clientCount,
          healthScore: health?.healthScore || 0,
          issues: health?.issues || [],
        };
      }),
      recentActivity,
      performanceMetrics: analytics.analytics,
      topPerformers,
      workspaceHealth,
      timeSeriesData: analytics.timeSeriesData,
      dateRange: analytics.dateRange,
    };
  }

  /**
   * Calculate workspace health score
   */
  private async calculateWorkspaceHealth(workspaceId: string) {
    const issues: string[] = [];
    let score = 100;

    // Check for connected social accounts
    // This would query the actual database
    const socialAccountsCount = 0; // Placeholder
    if (socialAccountsCount === 0) {
      issues.push('No social accounts connected');
      score -= 30;
    }

    // Check for recent posts
    const recentPostsCount = 0; // Placeholder
    if (recentPostsCount === 0) {
      issues.push('No posts in the last 7 days');
      score -= 20;
    }

    // Check for token expiry issues
    const expiredTokens = 0; // Placeholder
    if (expiredTokens > 0) {
      issues.push(`${expiredTokens} social account(s) need re-authentication`);
      score -= 15;
    }

    // Check for pending approvals
    const pendingApprovals = 0; // Placeholder
    if (pendingApprovals > 5) {
      issues.push(`${pendingApprovals} posts pending approval`);
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Get recent activity across workspaces
   */
  private async getRecentCrossWorkspaceActivity(
    workspaceIds: string[],
    limit: number = 10,
  ) {
    // This would query recent posts, comments, approvals, etc.
    // For now, returning placeholder structure
    return [];
  }

  /**
   * Calculate revenue metrics for agency
   */
  private async calculateRevenueMetrics(workspaceIds: string[]) {
    // This would calculate revenue based on workspace plans
    // For now, returning placeholder data
    return {
      monthlyRecurringRevenue: 0,
      averageRevenuePerWorkspace: 0,
      totalRevenue: 0,
    };
  }
}
