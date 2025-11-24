import { PartialType } from '@nestjs/swagger';
import { CreateAdvocacyContentDto } from './create-advocacy-content.dto';

export class UpdateAdvocacyContentDto extends PartialType(CreateAdvocacyContentDto) {}
