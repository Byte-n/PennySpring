import React from 'react';
import { Popup } from '../Popup';
import { useControllableValue } from '../_hooks';
import { CalculatorInput } from './CalculatorInput';
import type { CalculatorInputOkParams, CalculatorInputPopupProps } from './types';

export function CalculatorInputPopup({
  defaultOpen = false,
  defaultValue,
  disabled,
  onChange,
  onCancel,
  onOk,
  onOpenChange,
  open,
  placeholder,
  readonly,
  style,
  styles,
  value,
}: CalculatorInputPopupProps) {
  const [isOpen, setIsOpen] = useControllableValue(defaultOpen, open, onOpenChange);

  function handleOk(params: CalculatorInputOkParams): void {
    onOk?.(params);
    setIsOpen(false);
  }

  return (
    <Popup
      open={isOpen}
      position="bottom"
      onCancel={onCancel}
      onOpenChange={(nextOpen, openChangeParams) => {
        setIsOpen(nextOpen);
        if (!nextOpen) {
          onCancel?.(openChangeParams);
        }
      }}
    >
      <CalculatorInput
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange}
        onOk={handleOk}
        placeholder={placeholder}
        readonly={readonly}
        style={style}
        styles={styles}
        value={value}
      />
    </Popup>
  );
}
