import { IsString, IsArray, IsOptional } from 'class-validator';
import { TagProductDto } from './tag-product.dto';

export class CreateShoppablePostDto {
  @IsString()
  postId: string;

  @IsArray()
  productTags: TagProductDto[];

  @IsOptional()
  @IsString()
  catalogId?: string; // Platform catalog ID
}
