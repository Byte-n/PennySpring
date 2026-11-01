import { useMemo, useRef } from 'react';

type AnyFunction = (this: unknown, ...args: never[]) => unknown;
type MemoizedFunction<T extends AnyFunction> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

export function useMemoizedFn<T extends AnyFunction>(
  fn: T,
): MemoizedFunction<T> {
  const fnRef = useRef<T>(fn);
  fnRef.current = useMemo(() => fn, [fn]);

  const memoizedFnRef = useRef<MemoizedFunction<T>>(function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    return fnRef.current.apply(this, args) as ReturnType<T>;
  });

  return memoizedFnRef.current;
}
