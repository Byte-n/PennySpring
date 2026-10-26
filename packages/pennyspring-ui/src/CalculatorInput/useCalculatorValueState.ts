import { useCallback, useState } from 'react';
import { useControllableValue } from '../_hooks';
import type { CalculatorInputOkParams } from './types';

const EMPTY_VALUE = '';

export interface UseCalculatorValueStateOptions {
  /**
   * 每次打开弹层时回填到表达式的初始值。
   */
  initialValue?: string;

  /**
   * 非受控模式下弹层的初始展开状态。
   */
  defaultOpen?: boolean;

  /**
   * 受控模式下弹层的展开状态。
   */
  open?: boolean;

  /**
   * 弹层展开状态变化回调。
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * 表达式变化回调。
   */
  onChange?: (value: string) => void;

  /**
   * 按确认键且表达式可计算时触发。
   */
  onOk?: (params: CalculatorInputOkParams) => void;
}

export interface CalculatorValueState {
  /**
   * 弹层是否展开。
   */
  isOpen: boolean;

  /**
   * 当前表达式。
   */
  value: string;

  /**
   * 展开弹层，并把表达式重置为 initialValue。
   */
  open: () => void;

  /**
   * 收起弹层。
   */
  close: () => void;

  /**
   * 同步弹层展开状态，供 CalculatorInput.Popup 的 onOpenChange 使用。
   */
  setOpen: (open: boolean) => void;

  /**
   * 更新表达式，供 CalculatorInput.Popup 的 onChange 使用。
   */
  setValue: (value: string) => void;

  /**
   * 处理确认，供 CalculatorInput.Popup 的 onOk 使用。
   */
  handleOk: (params: CalculatorInputOkParams) => void;
}

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
