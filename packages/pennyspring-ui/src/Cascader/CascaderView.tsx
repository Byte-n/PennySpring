import React, { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { CircleIcon } from 'phosphor-react-native';
import { Icon } from '../Icon';
import { Tabs } from '../Tabs';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import {
  CASCADER_DEFAULT_EMPTY_TEXT,
  CASCADER_DEFAULT_TAB_PLACEHOLDER,
  useCascaderStyles,
} from './style';
import type { CascaderOption, CascaderViewProps } from './types';
import {
  buildChangeParams,
  clampLevel,
  getOptionsAtLevel,
  getPathOptions,
  getVisibleLevelCount,
  normalizeValue,
} from './utils';

function resolveSize(size: CascaderViewProps['size']) {
  return size ?? 'normal';
}

function renderOptionLabel<TData>(
  option: CascaderOption<TData>,
  level: number,
  optionIndex: number,
  customRenderOptionLabel?: CascaderViewProps<TData>['renderOptionLabel'],
) {
  return customRenderOptionLabel?.(option, level, optionIndex) ?? option.label ?? (
    <Text>{option.labelText}</Text>
  );
}

function renderOptionMarker(
  selected: boolean,
  disabled: boolean,
  tokenStyles: ReturnType<typeof useCascaderStyles>,
) {
  return (
    <Icon
      color={disabled ? 'colorTextDisabled' : selected ? 'colorPrimaryText' : 'colorTextQuaternary'}
      icon={selected ? 'check' : CircleIcon}
      size={tokenStyles.markerIcon.fontSize}
      testID={selected ? 'cascader-option-marker-selected' : 'cascader-option-marker-unselected'}
    />
  );
}

export function CascaderView<TData = unknown>({
  activeLevel,
  defaultActiveLevel,
  defaultValue,
  disabled,
  empty,
  emptyText = CASCADER_DEFAULT_EMPTY_TEXT,
  loading,
  onActiveLevelChange,
  onChange,
  options,
  readonly,
  renderOptionLabel: customRenderOptionLabel,
  size,
  style,
  styles,
  tabPlaceholderText = CASCADER_DEFAULT_TAB_PLACEHOLDER,
  value,
}: CascaderViewProps<TData>) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useCascaderStyles({ size: resolvedSize });
  const normalizedDefaultValue = useMemo(
    () => normalizeValue(options, defaultValue),
    [defaultValue, options],
  );
  const normalizedValue = useMemo(
    () => (value === undefined ? undefined : normalizeValue(options, value)),
    [options, value],
  );
  const [selectedValue, setSelectedValue] = useControllableValue(
    normalizedDefaultValue,
    normalizedValue,
    nextValue => {
      onChange?.(nextValue, pendingChangeParamsRef.current!);
    },
  );
  const selectedPath = useMemo(
    () => getPathOptions(options, selectedValue),
    [options, selectedValue],
  );
  const visibleLevelCount = getVisibleLevelCount(selectedPath);
  const [resolvedActiveLevel, setResolvedActiveLevel] = useControllableValue(
    defaultActiveLevel ?? clampLevel(selectedPath.length, visibleLevelCount),
    activeLevel,
    onActiveLevelChange,
  );
  const currentLevel = clampLevel(resolvedActiveLevel ?? 0, visibleLevelCount);
  const currentOptions = getOptionsAtLevel(options, selectedPath, currentLevel);
  const isInteractive = !disabled && !readonly && !loading;
  const pendingChangeParamsRef =
    React.useRef<ReturnType<typeof buildChangeParams<TData>> | undefined>(
      undefined,
    );

  const tabItems = Array.from({ length: visibleLevelCount }, (_, level) => {
    const option = selectedPath[level];

    return {
      value: level,
      label: option?.labelText ?? option?.label ?? tabPlaceholderText,
      disabled: disabled === true,
    };
  });

  function handleOptionPress(
    option: CascaderOption<TData>,
    optionIndex: number,
  ): void {
    if (!isInteractive || option.disabled === true) {
      return;
    }

    const nextValue = [
      ...(selectedValue ?? []).slice(0, currentLevel),
      option.value,
    ];
    const params = buildChangeParams(
      options,
      nextValue,
      option,
      currentLevel,
      optionIndex,
    );
    pendingChangeParamsRef.current = params;
    setSelectedValue(nextValue);

    if (!params.isLeaf) {
      setResolvedActiveLevel(currentLevel + 1);
    }
  }

  return (
    <View style={[tokenStyles.panel, style]} testID="cascader-view">
      <Tabs
        block
        items={tabItems}
        layout="scroll"
        onChange={nextLevel => setResolvedActiveLevel(Number(nextLevel))}
        size={resolvedSize}
        styles={styles?.tabs}
        value={currentLevel}
      />
      {loading === true ? (
        <View style={[tokenStyles.loading, styles?.loading]} testID="cascader-loading">
          <Text color="description">加载中...</Text>
        </View>
      ) : currentOptions.length > 0 ? (
        <FlatList
          contentContainerStyle={tokenStyles.listContent}
          data={currentOptions}
          keyExtractor={option => String(option.value)}
          nestedScrollEnabled
          renderItem={({ item: option, index: optionIndex }) => {
            const selected = selectedValue?.[currentLevel] === option.value;
            const optionDisabled = option.disabled === true || !isInteractive;
            const content = renderOptionLabel(
              option,
              currentLevel,
              optionIndex,
              customRenderOptionLabel,
            );

            return (
              <Pressable
                disabled={optionDisabled}
                onPress={() => handleOptionPress(option, optionIndex)}
                style={({ pressed }) => [
                  tokenStyles.option,
                  styles?.option,
                  pressed && !optionDisabled ? tokenStyles.optionPressed : null,
                  selected ? tokenStyles.optionSelected : null,
                  optionDisabled ? tokenStyles.optionDisabled : null,
                ]}
                testID={`cascader-option-${currentLevel}-${optionIndex}`}
              >
                <View
                  style={[
                    tokenStyles.marker,
                    optionDisabled ? tokenStyles.markerDisabled : null,
                  ]}
                >
                  {renderOptionMarker(selected, optionDisabled, tokenStyles)}
                </View>
                <View style={tokenStyles.optionContent}>
                  {typeof content === 'string' || typeof content === 'number' ? (
                    <Text
                      style={[
                        tokenStyles.optionLabel,
                        styles?.optionLabel,
                        selected ? tokenStyles.optionLabelSelected : null,
                        optionDisabled ? tokenStyles.optionLabelDisabled : null,
                      ]}
                    >
                      {content}
                    </Text>
                  ) : (
                    content
                  )}
                </View>
              </Pressable>
            );
          }}
          style={[tokenStyles.list, styles?.list]}
          testID="cascader-list"
        />
      ) : (
        <View style={[tokenStyles.empty, styles?.empty]} testID="cascader-empty">
          {empty ?? <Text color="description">{emptyText}</Text>}
        </View>
      )}
    </View>
  );
}
