import { IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePresenceDto {
  @ApiProperty({
    description: 'User status',
    enum: ['online', 'away', 'offline'],
  })
  @IsEnum(['online', 'away', 'offline'])
  status: 'online' | 'away' | 'offline';

  @ApiProperty({
    description: 'Current page user is viewing',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentPage?: string;
}

export class PresenceResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Workspace ID' })
  workspaceId: string;

  @ApiProperty({
    description: 'User status',
    enum: ['online', 'away', 'offline'],
  })
  status: 'online' | 'away' | 'offline';

  @ApiProperty({ description: 'Last seen timestamp' })
  lastSeen: Date;

  @ApiProperty({ description: 'Current page', required: false })
  currentPage?: string;

  @ApiProperty({ description: 'Socket ID' })
  socketId: string;
}

export class WorkspacePresenceDto {
  @ApiProperty({ description: 'Workspace ID' })
  workspaceId: string;

  @ApiProperty({
    description: 'List of online users',
    type: [PresenceResponseDto],
  })
  onlineUsers: PresenceResponseDto[];

  @ApiProperty({ description: 'Total online count' })
  onlineCount: number;
}
