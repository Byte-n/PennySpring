import { useCallback, useState } from 'react';
import { useControllableValue } from '../_hooks';
import type { CalculatorInputOkParams, CalculatorValueState, UseCalculatorValueStateOptions } from './types';

const EMPTY_VALUE = '';

/**
 * CalculatorInput.Popup 的便捷受控状态：统一管理弹层开关与表达式，
 * 打开时回填初始值，确认时先触发 onOk 再收起弹层。
 */
export function useCalculatorValueState(
  options: UseCalculatorValueStateOptions = {},
): CalculatorValueState {
  const {
    defaultOpen = false,
    initialValue = EMPTY_VALUE,
    onChange,
    onOk,
    onOpenChange,
    open: controlledOpen,
  } = options;
  const [isOpen, setOpen] = useControllableValue(
    defaultOpen,
    controlledOpen,
    onOpenChange,
  );
  const [value, setInternalValue] = useState(EMPTY_VALUE);

  const setValue = useCallback(
    (nextValue: string) => {
      setInternalValue(nextValue);
      onChange?.(nextValue);
    },
    [onChange],
  );

  const open = useCallback(() => {
    setInternalValue(initialValue);
    setOpen(true);
  }, [initialValue, setOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleOk = useCallback(
    (params: CalculatorInputOkParams) => {
      onOk?.(params);
      setOpen(false);
    },
    [onOk, setOpen],
  );

  return {
    isOpen: isOpen === true,
    value,
    open,
    close,
    setOpen,
    setValue,
    handleOk,
  };
}
