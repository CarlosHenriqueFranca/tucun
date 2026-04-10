import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const REQUIRED_TIER_KEY = 'requiredTier';

export type SubscriptionTier = 'free' | 'basic' | 'premium';

const tierRank: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: string;
  trialUsedAt?: string;
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.getAllAndOverride<SubscriptionTier>(
      REQUIRED_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no tier is required, allow access
    if (!requiredTier) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const userTier = user.subscriptionTier || 'free';
    const userRank = tierRank[userTier as SubscriptionTier] ?? 0;
    const requiredRank = tierRank[requiredTier] ?? 0;

    // Check if subscription is still valid (not expired)
    if (userTier !== 'free' && user.subscriptionExpiresAt) {
      const expiresAt = new Date(user.subscriptionExpiresAt);
      if (expiresAt < new Date()) {
        throw new ForbiddenException(
          'Your subscription has expired. Please renew to access this feature.',
        );
      }
    }

    // Check trial period (7-day trial = treated as premium access)
    if (userTier === 'free' && user.trialUsedAt) {
      const trialStart = new Date(user.trialUsedAt);
      const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (new Date() <= trialEnd) {
        // Trial is active — grant access as if premium
        return true;
      }
    }

    if (userRank < requiredRank) {
      throw new ForbiddenException(
        `This feature requires a ${requiredTier} subscription or higher.`,
      );
    }

    return true;
  }
}
