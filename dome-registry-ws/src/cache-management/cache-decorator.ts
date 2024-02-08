import { Inject } from '@nestjs/common';
import { from, merge, of } from 'rxjs';
import { catchError, filter, first, map, tap } from 'rxjs/operators';
import { ReviewService } from 'src/review/review.service';

export function Cache({ key }: { key?: string }) {
  const redisInjection = Inject(ReviewService);
  return function (target: Record<string, any>, _, descriptor: PropertyDescriptor) {
    redisInjection(target, 'reviewService');
    const method = descriptor.value;
    descriptor.value = function (...args: Array<any>) {
      const entryKey = `${key}[${args.map((res) => JSON.stringify(res)).join(',')}]`;
      const { reviewService } = this;
      const cacheCall$ = from(reviewService.get(entryKey)).pipe(
        map((cacheData: Array<string> | string | object) => {
          return cacheData ?? [];
        }),
        catchError((e) => {
          return of(null);
        }),
      );
      const originCall$ = method.apply(this, args).pipe(
        tap((originValue) => {
          reviewService.set(entryKey, originValue);
        }),
        catchError((e) => {
          return of(null);
        }),
      );
      const originWithUpdate$ = from(originCall$.toPromise());
      return merge(cacheCall$, originWithUpdate$).pipe(filter(Boolean), first());
    };
  };
}