import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddInfluencerNoteDto } from '../dto/add-influencer-note.dto';

@Injectable()
export class InfluencerRelationshipService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a note to an influencer
   */
  async addNote(
    workspaceId: string,
    influencerId: string,
    authorId: string,
    dto: AddInfluencerNoteDto,
  ) {
    // Verify influencer exists and belongs to workspace
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        workspaceId,
      },
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    const note = await this.prisma.influencerNote.create({
      data: {
        influencerId,
        authorId,
        content: dto.content,
      },
    });

    return note;
  }

  /**
   * Get all notes for an influencer
   */
  async getNotes(workspaceId: string, influencerId: string) {
    // Verify influencer exists and belongs to workspace
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        workspaceId,
      },
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    const notes = await this.prisma.influencerNote.findMany({
      where: {
        influencerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notes;
  }

  /**
   * Update a note
   */
  async updateNote(
    workspaceId: string,
    influencerId: string,
    noteId: string,
    content: string,
  ) {
    // Verify influencer exists and belongs to workspace
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        workspaceId,
      },
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    // Verify note exists and belongs to influencer
    const existingNote = await this.prisma.influencerNote.findFirst({
      where: {
        id: noteId,
        influencerId,
      },
    });

    if (!existingNote) {
      throw new NotFoundException('Note not found');
    }

    const note = await this.prisma.influencerNote.update({
      where: { id: noteId },
      data: { content },
    });

    return note;
  }

  /**
   * Delete a note
   */
  async deleteNote(workspaceId: string, influencerId: string, noteId: string) {
    // Verify influencer exists and belongs to workspace
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        workspaceId,
      },
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    // Verify note exists and belongs to influencer
    const existingNote = await this.prisma.influencerNote.findFirst({
      where: {
        id: noteId,
        influencerId,
      },
    });

    if (!existingNote) {
      throw new NotFoundException('Note not found');
    }

    await this.prisma.influencerNote.delete({
      where: { id: noteId },
    });

    return { success: true };
  }

  /**
   * Get influencer relationship history
   */
  async getRelationshipHistory(workspaceId: string, influencerId: string) {
    // Verify influencer exists and belongs to workspace
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        workspaceId,
      },
      include: {
        accounts: true,
      },
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    // Get all collaborations
    const collaborations = await this.prisma.influencerCollaboration.findMany({
      where: {
        influencerId,
        workspaceId,
      },
      include: {
        campaign: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get all notes
    const notes = await this.prisma.influencerNote.findMany({
      where: {
        influencerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate relationship metrics
    const totalCollaborations = collaborations.length;
    const completedCollaborations = collaborations.filter(
      (c) => c.status === 'COMPLETED',
    ).length;
    const totalSpent = collaborations.reduce(
      (sum, c) => sum + (c.compensation || 0),
      0,
    );

    // Calculate total performance metrics
    let totalReach = 0;
    let totalEngagement = 0;
    let totalConversions = 0;

    collaborations.forEach((collab) => {
      const metrics = (collab.performanceMetrics as any) || {};
      totalReach += metrics.reach || 0;
      totalEngagement += metrics.engagement || 0;
      totalConversions += metrics.conversions || 0;
    });

    return {
      influencer: {
        id: influencer.id,
        name: influencer.name,
        avatar: influencer.avatar,
        status: influencer.status,
        niche: influencer.niche,
        overallScore: influencer.overallScore,
        totalFollowers: influencer.totalFollowers,
        avgEngagementRate: influencer.avgEngagementRate,
        accounts: influencer.accounts,
      },
      relationshipMetrics: {
        totalCollaborations,
        completedCollaborations,
        successRate:
          totalCollaborations > 0
            ? (completedCollaborations / totalCollaborations) * 100
            : 0,
        totalSpent,
        totalReach,
        totalEngagement,
        totalConversions,
        avgEngagementRate: totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0,
      },
      collaborations: collaborations.map((c) => ({
        id: c.id,
        type: c.type,
        status: c.status,
        campaign: c.campaign
          ? {
              id: c.campaign.id,
              name: c.campaign.name,
            }
          : null,
        deliverables: c.deliverables,
        actualDeliverables: c.actualDeliverables,
        compensation: c.compensation,
        startDate: c.startDate,
        endDate: c.endDate,
        performanceMetrics: c.performanceMetrics,
        createdAt: c.createdAt,
      })),
      notes: notes.map((n) => ({
        id: n.id,
        content: n.content,
        authorId: n.authorId,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
    };
  }

  /**
   * Get influencer payment summary
   */
  async getPaymentSummary(workspaceId: string, influencerId: string) {
    // Verify influencer exists and belongs to workspace
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        workspaceId,
      },
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    // Get all collaborations with compensation
    const collaborations = await this.prisma.influencerCollaboration.findMany({
      where: {
        influencerId,
        workspaceId,
        compensation: {
          not: null,
        },
      },
      include: {
        campaign: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalPaid = collaborations
      .filter((c) => c.status === 'COMPLETED')
      .reduce((sum, c) => sum + (c.compensation || 0), 0);

    const totalPending = collaborations
      .filter((c) => ['ACCEPTED', 'IN_PROGRESS'].includes(c.status))
      .reduce((sum, c) => sum + (c.compensation || 0), 0);

    const totalCancelled = collaborations
      .filter((c) => c.status === 'CANCELLED')
      .reduce((sum, c) => sum + (c.compensation || 0), 0);

    return {
      influencer: {
        id: influencer.id,
        name: influencer.name,
        email: influencer.email,
      },
      summary: {
        totalPaid,
        totalPending,
        totalCancelled,
        totalCommitted: totalPaid + totalPending,
      },
      payments: collaborations.map((c) => ({
        collaborationId: c.id,
        type: c.type,
        status: c.status,
        amount: c.compensation,
        campaign: c.campaign
          ? {
              id: c.campaign.id,
              name: c.campaign.name,
            }
          : null,
        startDate: c.startDate,
        endDate: c.endDate,
        createdAt: c.createdAt,
      })),
    };
  }
}
