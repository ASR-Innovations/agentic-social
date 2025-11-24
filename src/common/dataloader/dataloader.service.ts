import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';
import { DataLoaderFactory } from './dataloader.factory';

/**
 * Service providing DataLoader instances for common entities
 * Scoped to REQUEST to ensure fresh loaders per request
 */
@Injectable({ scope: Scope.REQUEST })
export class DataLoaderService {
  private loaders: Map<string, DataLoader<any, any>> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create a DataLoader for users
   */
  getUserLoader(): DataLoader<string, any | null> {
    if (!this.loaders.has('user')) {
      const loader = DataLoaderFactory.createByIdLoader(async (ids) => {
        return this.prisma.user.findMany({
          where: { id: { in: [...ids] } },
        });
      });
      this.loaders.set('user', loader);
    }
    return this.loaders.get('user')!;
  }

  /**
   * Get or create a DataLoader for workspaces
   */
  getWorkspaceLoader(): DataLoader<string, any | null> {
    if (!this.loaders.has('workspace')) {
      const loader = DataLoaderFactory.createByIdLoader(async (ids) => {
        return this.prisma.workspace.findMany({
          where: { id: { in: [...ids] } },
        });
      });
      this.loaders.set('workspace', loader);
    }
    return this.loaders.get('workspace')!;
  }

  /**
   * Get or create a DataLoader for social accounts
   */
  getSocialAccountLoader(): DataLoader<string, any | null> {
    if (!this.loaders.has('socialAccount')) {
      const loader = DataLoaderFactory.createByIdLoader(async (ids) => {
        return this.prisma.socialAccount.findMany({
          where: { id: { in: [...ids] } },
        });
      });
      this.loaders.set('socialAccount', loader);
    }
    return this.loaders.get('socialAccount')!;
  }

  /**
   * Get or create a DataLoader for posts
   */
  getPostLoader(): DataLoader<string, any | null> {
    if (!this.loaders.has('post')) {
      const loader = DataLoaderFactory.createByIdLoader(async (ids) => {
        return this.prisma.post.findMany({
          where: { id: { in: [...ids] } },
        });
      });
      this.loaders.set('post', loader);
    }
    return this.loaders.get('post')!;
  }

  /**
   * Get or create a DataLoader for posts by workspace (one-to-many)
   */
  getPostsByWorkspaceLoader(): DataLoader<string, any[]> {
    if (!this.loaders.has('postsByWorkspace')) {
      const loader = DataLoaderFactory.createOneToManyLoader(async (workspaceIds) => {
        const posts = await this.prisma.post.findMany({
          where: { workspaceId: { in: [...workspaceIds] as string[] } },
          orderBy: { createdAt: 'desc' },
        });

        // Group posts by workspaceId
        const postsByWorkspace = new Map<string, any[]>();
        workspaceIds.forEach((id) => postsByWorkspace.set(id as string, []));
        
        posts.forEach((post) => {
          const workspacePosts = postsByWorkspace.get(post.workspaceId) || [];
          workspacePosts.push(post);
          postsByWorkspace.set(post.workspaceId, workspacePosts);
        });

        return workspaceIds.map((id) => postsByWorkspace.get(id as string) || []);
      });
      this.loaders.set('postsByWorkspace', loader);
    }
    return this.loaders.get('postsByWorkspace')!;
  }

  /**
   * Get or create a DataLoader for media assets
   */
  getMediaAssetLoader(): DataLoader<string, any | null> {
    if (!this.loaders.has('mediaAsset')) {
      const loader = DataLoaderFactory.createByIdLoader(async (ids) => {
        return this.prisma.mediaAsset.findMany({
          where: { id: { in: [...ids] } },
        });
      });
      this.loaders.set('mediaAsset', loader);
    }
    return this.loaders.get('mediaAsset')!;
  }

  /**
   * Get or create a DataLoader for campaigns
   */
  getCampaignLoader(): DataLoader<string, any | null> {
    if (!this.loaders.has('campaign')) {
      const loader = DataLoaderFactory.createByIdLoader(async (ids) => {
        return this.prisma.campaign.findMany({
          where: { id: { in: [...ids] } },
        });
      });
      this.loaders.set('campaign', loader);
    }
    return this.loaders.get('campaign')!;
  }

  /**
   * Clear all loaders (useful for testing)
   */
  clearAll(): void {
    this.loaders.clear();
  }
}
