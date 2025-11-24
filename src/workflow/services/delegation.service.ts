import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDelegationDto } from '../dto';

@Injectable()
export class DelegationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new delegation
   */
  async createDelegation(workspaceId: string, fromUserId: string, dto: CreateDelegationDto) {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check if users exist in workspace
    const [fromUser, toUser] = await Promise.all([
      this.prisma.user.findFirst({
        where: { id: fromUserId, workspaceId },
      }),
      this.prisma.user.findFirst({
        where: { id: dto.toUserId, workspaceId },
      }),
    ]);

    if (!fromUser) {
      throw new NotFoundException('From user not found in workspace');
    }

    if (!toUser) {
      throw new NotFoundException('To user not found in workspace');
    }

    // Check for overlapping delegations
    const overlapping = await this.prisma.workflowDelegation.findFirst({
      where: {
        workspaceId,
        fromUserId,
        isActive: true,
        OR: [
          {
            AND: [{ startDate: { lte: startDate } }, { endDate: { gte: startDate } }],
          },
          {
            AND: [{ startDate: { lte: endDate } }, { endDate: { gte: endDate } }],
          },
          {
            AND: [{ startDate: { gte: startDate } }, { endDate: { lte: endDate } }],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Delegation period overlaps with existing delegation');
    }

    // Create delegation
    const delegation = await this.prisma.workflowDelegation.create({
      data: {
        workspaceId,
        fromUserId,
        toUserId: dto.toUserId,
        startDate,
        endDate,
        reason: dto.reason,
        isActive: true,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return delegation;
  }

  /**
   * Get delegation by ID
   */
  async getDelegation(workspaceId: string, delegationId: string) {
    const delegation = await this.prisma.workflowDelegation.findFirst({
      where: {
        id: delegationId,
        workspaceId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!delegation) {
      throw new NotFoundException('Delegation not found');
    }

    return delegation;
  }

  /**
   * List delegations for a user
   */
  async listDelegations(workspaceId: string, userId: string) {
    const delegations = await this.prisma.workflowDelegation.findMany({
      where: {
        workspaceId,
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return delegations;
  }

  /**
   * List active delegations for a user
   */
  async listActiveDelegations(workspaceId: string, userId: string) {
    const now = new Date();

    const delegations = await this.prisma.workflowDelegation.findMany({
      where: {
        workspaceId,
        OR: [{ fromUserId: userId }, { toUserId: userId }],
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return delegations;
  }

  /**
   * Cancel a delegation
   */
  async cancelDelegation(workspaceId: string, delegationId: string, userId: string) {
    const delegation = await this.getDelegation(workspaceId, delegationId);

    // Only the person who created the delegation can cancel it
    if (delegation.fromUserId !== userId) {
      throw new BadRequestException('Only the delegator can cancel the delegation');
    }

    await this.prisma.workflowDelegation.update({
      where: { id: delegationId },
      data: { isActive: false },
    });

    return { success: true };
  }

  /**
   * Update delegation
   */
  async updateDelegation(
    workspaceId: string,
    delegationId: string,
    userId: string,
    dto: Partial<CreateDelegationDto>,
  ) {
    const delegation = await this.getDelegation(workspaceId, delegationId);

    // Only the person who created the delegation can update it
    if (delegation.fromUserId !== userId) {
      throw new BadRequestException('Only the delegator can update the delegation');
    }

    const updateData: any = {};

    if (dto.startDate) {
      updateData.startDate = new Date(dto.startDate);
    }

    if (dto.endDate) {
      updateData.endDate = new Date(dto.endDate);
    }

    if (dto.reason !== undefined) {
      updateData.reason = dto.reason;
    }

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate) {
      if (updateData.startDate >= updateData.endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updated = await this.prisma.workflowDelegation.update({
      where: { id: delegationId },
      data: updateData,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return updated;
  }
}
