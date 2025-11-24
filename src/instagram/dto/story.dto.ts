import { IsString, IsArray, IsOptional, IsEnum, IsObject, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StoryStickerType {
  POLL = 'poll',
  QUESTION = 'question',
  COUNTDOWN = 'countdown',
  QUIZ = 'quiz',
  SLIDER = 'slider',
  LINK = 'link',
  MENTION = 'mention',
  HASHTAG = 'hashtag',
  LOCATION = 'location',
}

export class StoryPollStickerDto {
  @ApiProperty({ description: 'Poll question' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Poll options (2 options)' })
  @IsArray()
  @IsString({ each: true })
  options: [string, string];

  @ApiProperty({ description: 'X position (0-1)' })
  @IsOptional()
  @Min(0)
  @Max(1)
  x?: number;

  @ApiProperty({ description: 'Y position (0-1)' })
  @IsOptional()
  @Min(0)
  @Max(1)
  y?: number;
}

export class StoryQuestionStickerDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Background color' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiProperty({ description: 'X position (0-1)' })
  @IsOptional()
  @Min(0)
  @Max(1)
  x?: number;

  @ApiProperty({ description: 'Y position (0-1)' })
  @IsOptional()
  @Min(0)
  @Max(1)
  y?: number;
}

export class StoryCountdownStickerDto {
  @ApiProperty({ description: 'Countdown name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'End time' })
  @IsString()
  endTime: string;

  @ApiProperty({ description: 'X position (0-1)' })
  @IsOptional()
  @Min(0)
  @Max(1)
  x?: number;

  @ApiProperty({ description: 'Y position (0-1)' })
  @IsOptional()
  @Min(0)
  @Max(1)
  y?: number;
}

export class StoryLinkStickerDto {
  @ApiProperty({ description: 'Link URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Link text' })
  @IsOptional()
  @IsString()
  text?: string;
}

export class StoryMentionDto {
  @ApiProperty({ description: 'Username to mention' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'X position (0-1)' })
  @IsOptional()
  @Min(0)
  @Max(1)
  x?: number;

  @ApiProperty({ description: 'Y position (0-1)' })
  @IsOptional()
  @Min(0)
  @Max(1)
  y?: number;
}

export class CreateStoryDto {
  @ApiProperty({ description: 'Instagram account ID' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Media URL (image or video)' })
  @IsString()
  mediaUrl: string;

  @ApiProperty({ description: 'Media type' })
  @IsEnum(['image', 'video'])
  mediaType: 'image' | 'video';

  @ApiProperty({ description: 'Poll sticker', required: false })
  @IsOptional()
  @IsObject()
  pollSticker?: StoryPollStickerDto;

  @ApiProperty({ description: 'Question sticker', required: false })
  @IsOptional()
  @IsObject()
  questionSticker?: StoryQuestionStickerDto;

  @ApiProperty({ description: 'Countdown sticker', required: false })
  @IsOptional()
  @IsObject()
  countdownSticker?: StoryCountdownStickerDto;

  @ApiProperty({ description: 'Link sticker', required: false })
  @IsOptional()
  @IsObject()
  linkSticker?: StoryLinkStickerDto;

  @ApiProperty({ description: 'Mentions', required: false })
  @IsOptional()
  @IsArray()
  mentions?: StoryMentionDto[];

  @ApiProperty({ description: 'Hashtags', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiProperty({ description: 'Schedule time (optional)', required: false })
  @IsOptional()
  scheduledAt?: Date;
}

export class ScheduleStoryDto extends CreateStoryDto {
  @ApiProperty({ description: 'Schedule time' })
  scheduledAt: Date;
}
