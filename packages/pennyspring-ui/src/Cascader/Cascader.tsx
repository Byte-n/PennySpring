import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../Icon';
import { Popup } from '../Popup';
import { Row } from '../Row';
import { Text } from '../Text';
import { TagValueDisplay } from '../_internal/TagValueDisplay';
import type { TagValueItem } from '../_internal/TagValueDisplay';
import { useControllableValue } from '../_hooks';
import {
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

function resolveTextSize(size: NonNullable<CascaderProps['size']>) {
  if (size === 'small') return 'md';
  if (size === 'large') return 'xl';
  return 'lg';
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

function getSelectedTagItems<TData>(
  options: CascaderProps<TData>['options'],
  value: CascaderValue[] | undefined,
): TagValueItem[] {
  return getPathOptions(options, value)
    .filter(item => item.labelText !== undefined)
    .map(item => ({ label: item.labelText!, value: item.value }));
}

function buildTagRemoveChangeParams<TData>(
  options: CascaderProps<TData>['options'],
  currentValue: CascaderValue[],
  nextValue: CascaderValue[],
  removedLevel: number,
): CascaderChangeParams<TData> | undefined {
  const currentPath = getPathOptions(options, currentValue);
  const removedOption = currentPath[removedLevel];

  if (!removedOption) {
    return undefined;
  }

  const nextPath = getPathOptions(options, nextValue);
  const siblingOptions = removedLevel === 0
    ? options
    : currentPath[removedLevel - 1]?.children ?? [];
  const optionIndex = siblingOptions.findIndex(item => item.value === removedOption.value);

  return {
    reason: 'remove',
    option: removedOption,
    value: removedOption.value,
    level: removedLevel,
    optionIndex: optionIndex >= 0 ? optionIndex : 0,
    path: nextPath,
    items: nextValue.map((_, index) => nextPath[index]),
    isLeaf: !(removedOption.children && removedOption.children.length > 0),
  };
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
  displayMode,
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
  panelValue,
  label,
  labelText,
  position,
  readonly,
  size,
  style,
  styles,
  tagProps,
  value,
  ...viewProps
}: CascaderProps<TData>) {
  const resolvedSize = resolveSize(size);
  const textSize = resolveTextSize(resolvedSize);
  const tokenStyles = useCascaderStyles({ size: resolvedSize });
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const mergedOpen = resolvedOpen === true;
  const normalizedControlledValue =
    value === undefined ? undefined : normalizeValue(options, value);
  const [mergedValue, setMergedValue] = useControllableValue(
    normalizeValue(options, defaultValue),
    normalizedControlledValue,
    undefined,
  );
  const isInteractive = !disabled && !readonly;
  const selectedLabel = useMemo(
    () => getSelectedLabel(options, mergedValue),
    [mergedValue, options],
  );
  const tagItems = useMemo(
    () => displayMode === 'tag' ? getSelectedTagItems(options, mergedValue) : [],
    [displayMode, mergedValue, options],
  );

  function setOpen(nextOpen: boolean, reason: 'trigger' | 'select'): void {
    setResolvedOpen(nextOpen);
    onOpenChange?.(nextOpen, { reason });
  }

  function handleTriggerPress(): void {
    if (!isInteractive) {
      return;
    }

    setOpen(true, 'trigger');
  }

  function handleTagRemove(removedValue: CascaderValue): void {
    if (!isInteractive || !mergedValue) return;
    const idx = mergedValue.indexOf(removedValue);
    if (idx >= 0) {
      const nextValue = mergedValue.slice(0, idx);
      const params = buildTagRemoveChangeParams(options, mergedValue, nextValue, idx);
      setMergedValue(nextValue);
      if (params) {
        onChange?.(nextValue, params);
      }
    }
  }

  function handleCancel(): void {
    onCancel?.();
  }

  function handleOpenChange(nextOpen: boolean): void {
    setResolvedOpen(nextOpen);
    onOpenChange?.(nextOpen, { reason: 'cancel' });
  }

  function handleChange(
    nextValue: CascaderValue[],
    params: CascaderChangeParams<TData>,
  ): void {
    setMergedValue(nextValue);
    onChange?.(nextValue, { ...params, reason: 'select' });

    if (params.isLeaf && closeOnSelectLeaf) {
      setOpen(false, 'select');
    }
  }

  return (
    <View style={style} testID="cascader-root">
      {(label !== undefined || labelText !== undefined) && (
        <Text color="label" size={textSize} testID="cascader-label">
          {label ?? labelText}
        </Text>
      )}
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
          <Row align="center" gap="small" style={tokenStyles.triggerRow} testID="cascader-trigger-row">
            <View style={tokenStyles.valueArea}>
              {displayMode === 'tag' && tagItems.length > 0 ? (
                <TagValueDisplay
                  items={tagItems}
                  size={resolvedSize}
                  tagProps={tagProps}
                  disabled={!isInteractive}
                  onRemove={handleTagRemove}
                />
              ) : selectedLabel.length > 0 ? (
                <Text
                  color="default"
                  numberOfLines={1}
                  size={textSize}
                  style={styles?.valueText}
                  testID="cascader-trigger-value"
                >
                  {selectedLabel}
                </Text>
              ) : null}
            </View>
            <Icon
              color="icon"
              icon="caret-down"
              size={resolvedSize}
            />
          </Row>
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
        styles={{
          ...styles?.floatingPanel,
          content: [
            tokenStyles.floatingPanelContent,
            styles?.floatingPanel?.content,
          ],
        }}
        value={panelValue}
        footer={null}
        header={null}
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
