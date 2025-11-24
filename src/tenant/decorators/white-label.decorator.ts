import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract workspace ID from custom domain
 */
export const CustomDomainWorkspace = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.customDomainWorkspaceId;
  },
);

/**
 * Decorator to check if request is from custom domain
 */
export const IsCustomDomain = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): boolean => {
    const request = ctx.switchToHttp().getRequest();
    return !!request.customDomainWorkspaceId;
  },
);
