import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Popup } from '../Popup';
import { Text } from '../Text';
import {
  CASCADER_DEFAULT_PLACEHOLDER,
  CASCADER_TRIGGER_SUFFIX,
  useCascaderStyles,
} from './style';
import { CascaderView } from './CascaderView';
import type {
  CascaderChangeParams,
  CascaderProps,
  CascaderValue,
} from './types';
import { getPathOptions, normalizeValue } from './utils';

function resolveSize(size: CascaderProps['size']) {
  return size ?? 'normal';
}

function getSelectedLabel<TData>(
  options: CascaderProps<TData>['options'],
  value: CascaderValue[] | undefined,
): string {
  return getPathOptions(options, value)
    .map(item => item.labelText)
    .filter((item): item is string => Boolean(item))
    .join(' / ');
}

function CascaderRoot<TData = unknown>({
  afterOpenChange,
  animation,
  animationDuration,
  children,
  closeOnMaskClick,
  closeOnSelectLeaf = true,
  defaultOpen,
  defaultPanelValue,
  defaultValue,
  disabled,
  mask,
  maxHeight,
  minHeight,
  mountPoint,
  onCancel,
  onChange,
  onOpenChange,
  onPanelChange,
  open,
  options,
  panelStyle,
  panelValue,
  placeholder = CASCADER_DEFAULT_PLACEHOLDER,
  position,
  readonly,
  size,
  style,
  styles,
  value,
  ...viewProps
}: CascaderProps<TData>) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useCascaderStyles({ size: resolvedSize });
  const [internalOpen, setInternalOpen] = useState(defaultOpen === true);
  const isOpenControlled = open !== undefined;
  const mergedOpen = isOpenControlled ? open : internalOpen;
  const [internalValue, setInternalValue] = useState(
    normalizeValue(options, defaultValue),
  );
  const isValueControlled = value !== undefined;
  const mergedValue = isValueControlled
    ? normalizeValue(options, value)
    : internalValue;
  const isInteractive = !disabled && !readonly;
  const selectedLabel = useMemo(
    () => getSelectedLabel(options, mergedValue),
    [mergedValue, options],
  );

  function setOpen(nextOpen: boolean, reason: 'trigger' | 'select'): void {
    if (!isOpenControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen, { reason });
  }

  function handleTriggerPress(): void {
    if (!isInteractive) {
      return;
    }

    setOpen(true, 'trigger');
  }

  function handleCancel(params: { reason: 'mask' | 'back' }): void {
    onCancel?.(params);
  }

  function handleOpenChange(
    nextOpen: boolean,
    params: { reason: 'mask' | 'back' },
  ): void {
    if (!isOpenControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen, params);
  }

  function handleChange(
    nextValue: CascaderValue[],
    params: CascaderChangeParams<TData>,
  ): void {
    if (!isValueControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue, params);

    if (params.isLeaf && closeOnSelectLeaf) {
      setOpen(false, 'select');
    }
  }

  return (
    <View style={style} testID="cascader-root">
      <Pressable
        disabled={!isInteractive}
        onPress={handleTriggerPress}
        style={({ pressed }) => [
          tokenStyles.trigger,
          styles?.trigger,
          pressed && isInteractive ? tokenStyles.triggerPressed : null,
          mergedOpen ? tokenStyles.triggerOpen : null,
          !isInteractive ? tokenStyles.triggerDisabled : null,
        ]}
        testID="cascader-trigger"
      >
        {children ?? (
          <>
            <View style={tokenStyles.valueArea}>
              {selectedLabel.length > 0 ? (
                <Text
                  numberOfLines={1}
                  style={[tokenStyles.valueText, styles?.valueText]}
                >
                  {selectedLabel}
                </Text>
              ) : (
                <Text
                  numberOfLines={1}
                  style={[tokenStyles.placeholder, styles?.placeholder]}
                >
                  {placeholder}
                </Text>
              )}
            </View>
            <Text style={tokenStyles.suffix}>{CASCADER_TRIGGER_SUFFIX}</Text>
          </>
        )}
      </Pressable>
      <Popup.FloatingPanel
        afterOpenChange={afterOpenChange}
        animation={animation}
        animationDuration={animationDuration}
        closeOnMaskClick={closeOnMaskClick}
        defaultOpen={defaultOpen}
        defaultValue={defaultPanelValue}
        mask={mask}
        maxHeight={maxHeight}
        minHeight={minHeight}
        mountPoint={mountPoint}
        onCancel={handleCancel}
        onChange={onPanelChange}
        onOpenChange={handleOpenChange}
        open={mergedOpen}
        position={position}
        size={resolvedSize}
        style={panelStyle}
        styles={{
          ...styles?.floatingPanel,
          content: [
            tokenStyles.floatingPanelContent,
            styles?.floatingPanel?.content,
          ],
        }}
        value={panelValue}
      >
        <CascaderView
          {...viewProps}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={handleChange}
          options={options}
          readonly={readonly}
          size={resolvedSize}
          styles={styles}
          value={mergedValue}
        />
      </Popup.FloatingPanel>
    </View>
  );
}

export const Cascader = Object.assign(CascaderRoot, {
  View: CascaderView,
});
