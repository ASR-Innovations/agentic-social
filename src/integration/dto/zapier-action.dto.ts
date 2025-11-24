import { IsString, IsOptional, IsArray, IsBoolean, IsDateString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostActionDto {
  @ApiProperty({
    description: 'The content/text of the post',
    example: 'Check out our new product! 🚀',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Array of platforms to post to',
    example: ['INSTAGRAM', 'FACEBOOK', 'TWITTER'],
  })
  @IsArray()
  @IsString({ each: true })
  platforms: string[];

  @ApiPropertyOptional({
    description: 'Hashtags to include (without # symbol)',
    example: ['marketing', 'socialmedia', 'ai'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({
    description: 'User mentions to include (without @ symbol)',
    example: ['johndoe', 'janedoe'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @ApiPropertyOptional({
    description: 'Link to include in the post',
    example: 'https://example.com/product',
  })
  @IsOptional()
  @IsUrl()
  link?: string;

  @ApiPropertyOptional({
    description: 'First comment for Instagram posts',
    example: 'Link in bio! 👆',
  })
  @IsOptional()
  @IsString()
  firstComment?: string;

  @ApiPropertyOptional({
    description: 'Array of media URLs to attach',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({
    description: 'Tags to categorize the post',
    example: ['product-launch', 'q1-2024'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether to publish immediately',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  publishNow?: boolean;

  @ApiPropertyOptional({
    description: 'Scheduled date/time for the post (ISO 8601 format)',
    example: '2024-12-31T12:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Map of platform to account ID',
    example: { INSTAGRAM: 'account_123', FACEBOOK: 'account_456' },
  })
  @IsOptional()
  accountIds?: Record<string, string>;
}

export class SchedulePostActionDto extends CreatePostActionDto {
  @ApiProperty({
    description: 'Scheduled date/time for the post (ISO 8601 format)',
    example: '2024-12-31T12:00:00Z',
  })
  @IsDateString()
  scheduledAt: string;
}
