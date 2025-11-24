import { IsString, IsNumber, IsArray, IsEmail, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetAlertDto {
  @ApiProperty({ description: 'Alert type (e.g., budget_threshold, daily_limit)' })
  @IsString()
  alertType: string;

  @ApiProperty({ description: 'Threshold value (percentage or amount)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  threshold: number;

  @ApiProperty({ description: 'Email addresses to notify', type: [String] })
  @IsArray()
  @IsEmail({}, { each: true })
  recipients: string[];
}
