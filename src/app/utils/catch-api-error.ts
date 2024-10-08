import { catchError } from 'rxjs/operators';
import { BehaviorSubject, of, OperatorFunction } from 'rxjs';

export const catchApiError = <T>(): OperatorFunction<T, T | null> =>
  catchError((err) => {
    return of(null);
  });

export const catchErrorInSubject = (error$: BehaviorSubject<any>) => {
  return catchError((err) => {
    error$.next(err);
    return of(null);
  });
};
