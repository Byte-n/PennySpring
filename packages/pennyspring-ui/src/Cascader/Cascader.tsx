import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../Icon';
import { Popup } from '../Popup';
import { Text } from '../Text';
import { TagValueDisplay } from '../_internal/TagValueDisplay';
import type { TagValueItem } from '../_internal/TagValueDisplay';
import { useControllableValue } from '../_hooks';
import {
  CASCADER_DEFAULT_PLACEHOLDER,
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

function getSelectedTagItems<TData>(
  options: CascaderProps<TData>['options'],
  value: CascaderValue[] | undefined,
): TagValueItem[] {
  return getPathOptions(options, value)
    .filter(item => item.labelText !== undefined)
    .map(item => ({ label: item.labelText!, value: item.value }));
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
  placeholder = CASCADER_DEFAULT_PLACEHOLDER,
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
      setMergedValue(nextValue);
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
            <Icon
              color="icon"
              icon="caret-down"
              size={tokenStyles.suffix.fontSize}
            />
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
