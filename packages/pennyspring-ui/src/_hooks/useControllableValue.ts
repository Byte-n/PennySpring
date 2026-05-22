import { useCallback, useState } from 'react';

type ChangeHandler<T> = (value: T) => void;

export function useControllableValue<T>(
  defaultValue: T | undefined,
  value: T | undefined,
  onChange?: ChangeHandler<T>,
): readonly [T | undefined, ChangeHandler<T>, boolean] {
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;

  const handleChange = useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  return [isControlled ? value : internalValue, handleChange, isControlled];
}
