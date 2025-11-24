import { IsNumber, Min } from 'class-validator';

export class VideoTrimDto {
  @IsNumber()
  @Min(0)
  startTime: number;

  @IsNumber()
  @Min(0)
  endTime: number;
}
