import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DataLoaderService } from '../dataloader/dataloader.service';

/**
 * Parameter decorator to inject DataLoaderService into route handlers
 * Usage: @UseDataLoader() loaders: DataLoaderService
 */
export const UseDataLoader = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DataLoaderService => {
    const request = ctx.switchToHttp().getRequest();
    
    // DataLoaderService should be available in request scope
    // This is injected by NestJS dependency injection
    return request.dataLoaderService;
  },
);
