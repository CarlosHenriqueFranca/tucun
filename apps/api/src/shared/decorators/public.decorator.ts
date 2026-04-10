import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public (skip JWT auth guard).
 * Use in conjunction with JwtAuthGuard which checks for this metadata.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
