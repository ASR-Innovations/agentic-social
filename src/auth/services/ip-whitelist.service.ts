import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIPWhitelistDto, UpdateIPWhitelistDto } from '../dto/ip-whitelist.dto';
import * as ipaddr from 'ipaddr.js';

@Injectable()
export class IPWhitelistService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, userId: string, dto: CreateIPWhitelistDto) {
    // Validate IP address format
    try {
      if (dto.ipAddress.includes('/')) {
        // CIDR notation
        const [ip, prefix] = dto.ipAddress.split('/');
        ipaddr.parse(ip);
        const prefixNum = parseInt(prefix, 10);
        if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 128) {
          throw new Error('Invalid CIDR prefix');
        }
      } else {
        ipaddr.parse(dto.ipAddress);
      }
    } catch (error) {
      throw new BadRequestException('Invalid IP address format');
    }

    // Check if IP already exists for this workspace
    const existing = await this.prisma.iPWhitelist.findFirst({
      where: {
        workspaceId,
        ipAddress: dto.ipAddress,
      },
    });

    if (existing) {
      throw new BadRequestException('IP address already whitelisted');
    }

    return this.prisma.iPWhitelist.create({
      data: {
        workspaceId,
        createdBy: userId,
        ipAddress: dto.ipAddress,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.iPWhitelist.findMany({
      where: { workspaceId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const whitelist = await this.prisma.iPWhitelist.findFirst({
      where: { id, workspaceId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!whitelist) {
      throw new NotFoundException('IP whitelist entry not found');
    }

    return whitelist;
  }

  async update(id: string, workspaceId: string, dto: UpdateIPWhitelistDto) {
    await this.findOne(id, workspaceId);

    return this.prisma.iPWhitelist.update({
      where: { id },
      data: {
        description: dto.description,
        isActive: dto.isActive,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    return this.prisma.iPWhitelist.delete({
      where: { id },
    });
  }

  async isIPWhitelisted(workspaceId: string, ipAddress: string): Promise<boolean> {
    const whitelists = await this.prisma.iPWhitelist.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
    });

    if (whitelists.length === 0) {
      // No whitelist configured, allow all
      return true;
    }

    const parsedIP = ipaddr.parse(ipAddress);

    for (const whitelist of whitelists) {
      try {
        if (whitelist.ipAddress.includes('/')) {
          // CIDR notation
          const [ip, prefix] = whitelist.ipAddress.split('/');
          const range = ipaddr.parseCIDR(`${ip}/${prefix}`);
          if (parsedIP.match(range)) {
            return true;
          }
        } else {
          // Exact match
          if (whitelist.ipAddress === ipAddress) {
            return true;
          }
        }
      } catch (error) {
        // Skip invalid entries
        continue;
      }
    }

    return false;
  }
}
