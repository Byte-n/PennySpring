import React, { useRef } from 'react';
import { useField } from '@tanstack/react-form';
import { useFormContext } from './FormContext.ts';
import type {
  FormListField,
  FormListOperations,
  FormListProps,
  FormValues,
} from './types';
import type { DeepKeys } from '@tanstack/react-form';

interface RuntimeArrayField {
  state: { value: unknown };
  pushValue: (value: unknown) => void;
  insertValue: (index: number, value: unknown) => void;
  removeValue: (index: number) => void;
  moveValue: (from: number, to: number) => void;
}

function syncKeys(
  keys: number[],
  length: number,
  nextKey: { current: number },
): number[] {
  if (keys.length === length) {
    return keys;
  }

  if (keys.length > length) {
    return keys.slice(0, length);
  }

  const addedKeys = Array.from(
    { length: length - keys.length },
    () => nextKey.current++,
  );

  return [...keys, ...addedKeys];
}

export function FormList<
  TValues extends object = FormValues,
  TName extends DeepKeys<TValues> = DeepKeys<TValues>,
>({ name, children }: FormListProps<TValues, TName>) {
  const formContext = useFormContext<TValues>();
  const field = useField({
    form: formContext.form as never,
    name: name as never,
  }) as unknown as RuntimeArrayField;
  const keysRef = useRef<number[]>([]);
  const nextKeyRef = useRef(0);
  const items = Array.isArray(field.state.value) ? field.state.value : [];
  const keys = syncKeys(keysRef.current, items.length, nextKeyRef);

  keysRef.current = keys;

  const fields: FormListField<TValues>[] = items.map((_item, index) => ({
    key: keys[index],
    index,
    name: (subName: string) =>
      `${String(name)}[${index}]${subName === '' ? '' : `.${subName}`}` as DeepKeys<TValues>,
  }));

  const operations: FormListOperations<TValues, TName> = {
    add: (value, index) => {
      const insertIndex = index ?? items.length;

      keysRef.current = [
        ...keys.slice(0, insertIndex),
        nextKeyRef.current++,
        ...keys.slice(insertIndex),
      ];

      if (insertIndex >= items.length) {
        field.pushValue(value);
        return;
      }

      field.insertValue(insertIndex, value);
    },
    remove: index => {
      keysRef.current = keys.filter((_key, keyIndex) => keyIndex !== index);
      field.removeValue(index);
    },
    move: (from, to) => {
      const nextKeys = [...keys];
      const [movedKey] = nextKeys.splice(from, 1);

      nextKeys.splice(to, 0, movedKey);
      keysRef.current = nextKeys;
      field.moveValue(from, to);
    },
  };

  return <>{children(fields, operations)}</>;
}
