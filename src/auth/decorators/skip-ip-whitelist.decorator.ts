import { SetMetadata } from '@nestjs/common';

export const SkipIPWhitelist = () => SetMetadata('skipIPWhitelist', true);
