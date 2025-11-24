import { IsString } from 'class-validator';

export class AddInfluencerNoteDto {
  @IsString()
  content: string;
}
