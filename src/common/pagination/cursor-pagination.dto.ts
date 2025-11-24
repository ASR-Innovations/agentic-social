import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for cursor-based pagination requests
 */
export class CursorPaginationDto {
  @ApiPropertyOptional({
    description: 'Cursor for the next page (opaque string)',
    example: 'eyJpZCI6IjEyMyIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDEifQ==',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of items to return',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Direction to paginate (forward or backward)',
    enum: ['forward', 'backward'],
    default: 'forward',
  })
  @IsOptional()
  @IsString()
  direction?: 'forward' | 'backward' = 'forward';
}

/**
 * Response structure for cursor-based pagination
 */
export class CursorPaginationResponse<T> {
  data: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
    totalCount?: number;
  };

  constructor(
    data: T[],
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    totalCount?: number,
  ) {
    this.data = data;
    this.pageInfo = {
      hasNextPage,
      hasPreviousPage,
      startCursor: data.length > 0 ? this.encodeCursor(data[0]) : null,
      endCursor: data.length > 0 ? this.encodeCursor(data[data.length - 1]) : null,
      totalCount,
    };
  }

  private encodeCursor(item: any): string {
    const cursorData = {
      id: item.id,
      createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
    };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }
}

/**
 * Decoded cursor data
 */
export interface DecodedCursor {
  id: string;
  createdAt: string;
}
