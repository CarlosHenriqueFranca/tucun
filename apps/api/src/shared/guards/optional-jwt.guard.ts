import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT guard — does not throw if no token is provided.
 * Useful for routes that behave differently for authenticated vs anonymous users.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // Override to never throw — simply set user to null if token is missing/invalid
  handleRequest<TUser>(
    _err: Error | null,
    user: TUser,
  ): TUser {
    return user || (null as unknown as TUser);
  }
}
