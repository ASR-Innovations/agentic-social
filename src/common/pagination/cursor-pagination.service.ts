import { Injectable, BadRequestException } from '@nestjs/common';
import { DecodedCursor, CursorPaginationResponse } from './cursor-pagination.dto';

/**
 * Service for handling cursor-based pagination
 * Provides efficient pagination for large datasets without offset/limit issues
 */
@Injectable()
export class CursorPaginationService {
  /**
   * Decode a base64-encoded cursor
   */
  decodeCursor(cursor: string): DecodedCursor {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      
      if (!parsed.id || !parsed.createdAt) {
        throw new Error('Invalid cursor format');
      }
      
      return parsed;
    } catch (error) {
      throw new BadRequestException('Invalid cursor format');
    }
  }

  /**
   * Encode cursor data to base64
   */
  encodeCursor(id: string, createdAt: Date | string): string {
    const cursorData = {
      id,
      createdAt: typeof createdAt === 'string' ? createdAt : createdAt.toISOString(),
    };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  /**
   * Build Prisma where clause for cursor pagination
   */
  buildWhereClause(
    cursor: string | undefined,
    direction: 'forward' | 'backward',
    additionalWhere?: any,
  ): any {
    const where: any = { ...additionalWhere };

    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      
      if (direction === 'forward') {
        // Get items after this cursor
        where.OR = [
          {
            createdAt: {
              lt: new Date(decoded.createdAt),
            },
          },
          {
            createdAt: new Date(decoded.createdAt),
            id: {
              lt: decoded.id,
            },
          },
        ];
      } else {
        // Get items before this cursor
        where.OR = [
          {
            createdAt: {
              gt: new Date(decoded.createdAt),
            },
          },
          {
            createdAt: new Date(decoded.createdAt),
            id: {
              gt: decoded.id,
            },
          },
        ];
      }
    }

    return where;
  }

  /**
   * Create a paginated response with cursor information
   */
  createResponse<T extends { id: string; createdAt: Date }>(
    items: T[],
    limit: number,
    direction: 'forward' | 'backward',
    totalCount?: number,
  ): CursorPaginationResponse<T> {
    // Check if there are more items
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;

    const hasNextPage = direction === 'forward' ? hasMore : false;
    const hasPreviousPage = direction === 'backward' ? hasMore : false;

    return new CursorPaginationResponse(data, hasNextPage, hasPreviousPage, totalCount);
  }

  /**
   * Build complete pagination query for Prisma
   */
  buildPaginationQuery(
    cursor: string | undefined,
    limit: number,
    direction: 'forward' | 'backward',
    additionalWhere?: any,
  ): {
    where: any;
    take: number;
    orderBy: any;
  } {
    return {
      where: this.buildWhereClause(cursor, direction, additionalWhere),
      take: limit + 1, // Fetch one extra to check if there are more
      orderBy: direction === 'forward' 
        ? [{ createdAt: 'desc' }, { id: 'desc' }]
        : [{ createdAt: 'asc' }, { id: 'asc' }],
    };
  }
}
