import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
import { defer, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

export const integerFixedLength = (int: number, width: number) => {
  let str = int.toFixed(0);
  while (str.length < width) {
    str = '0' + str;
  }
  return str;
};

export const timeString = (date: Date) =>
  integerFixedLength(date.getUTCFullYear(), 4) + '-' +
  integerFixedLength(date.getUTCMonth() + 1, 2) + '-' +
  integerFixedLength(date.getUTCDate(), 2);

/**
 * Emits values from 0 to 1 for the given duration
 * @param ms How long will it takes to get from 0 to 1
 * @param scheduler The scheduled used to produce values, defaults to animationFrame
 */
export const duration = (ms: number, scheduler = animationFrame) => {
  return defer(() => {
    const start = scheduler.now();
    return interval(0, scheduler).pipe(
      map(() => scheduler.now() - start),
      map(ems => ems / ms),
      takeWhile(t => t <= 1)
    );
  });
};
