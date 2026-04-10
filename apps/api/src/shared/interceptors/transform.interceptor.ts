import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TransformedResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has a success field (manually structured), return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Extract meta if data has it
        let meta: Record<string, unknown> | undefined;
        let responseData = data;

        if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
          meta = data.meta as Record<string, unknown>;
          responseData = data.data;
        }

        const transformed: TransformedResponse<T> = {
          success: true,
          data: responseData,
          timestamp: new Date().toISOString(),
        };

        if (meta) {
          transformed.meta = meta;
        }

        return transformed;
      }),
    );
  }
}
