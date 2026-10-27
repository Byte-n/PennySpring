import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { TextColor, TextWeight } from '../Text/types';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { renderTextNode } from '../shares/node';
import { MARK_TRANSITION_DURATION, SIZE_CONFIG, useGroupStyles, useStyles } from './style';
import type {
  CheckboxDisplayType,
  CheckboxGroupOption,
  CheckboxGroupProps,
  CheckboxGroupStyles,
  CheckboxProps,
  CheckboxStyles,
  CheckboxValue,
} from './types';

/**
 * 设计稿勾/半选笔画为 2.4px；Phosphor 图标按权重出笔画（bold 在 14 档约 1.3px），
 * 无法逐像素指定线宽，取 bold 为最接近档位。
 */
const MARK_ICON_WEIGHT = 'bold';

function toSlotTestID(base: string, slot: string): string {
  return base === 'checkbox-control' ? `checkbox-${slot}` : `${base}-${slot}`;
}

function includesValue(
  values: readonly CheckboxValue[],
  optionValue: CheckboxValue,
): boolean {
  return values.includes(optionValue);
}

function getOptionLabel(option: CheckboxGroupOption): ReactNode {
  if (option.label !== undefined) {
    return option.label;
  }

  if (option.labelText !== undefined) {
    return option.labelText;
  }

  return option.value;
}

interface LabelColorOptions {
  checked: boolean;
  disabled: boolean;
  displayType: CheckboxDisplayType;
  readonly: boolean;
}

function getLabelColor({
  checked,
  disabled,
  displayType,
  readonly,
}: LabelColorOptions): TextColor {
  if (displayType === 'button') {
    if (disabled) {
      return 'quaternary';
    }

    return checked ? 'primary' : 'secondary';
  }

  if (disabled) {
    return 'tertiary';
  }

  return readonly ? 'secondary' : 'default';
}

interface CheckboxControlProps extends Omit<CheckboxProps, 'style' | 'styles'> {
  block: boolean;
  checked: boolean;
  controlStyle?: CheckboxGroupStyles['option'];
  rootStyle?: CheckboxProps['style'];
  slotStyles?: CheckboxStyles;
  testID: string;
  onToggle: () => void;
}

function CheckboxControl({
  block,
  checked,
  children,
  controlStyle,
  disabled = false,
  displayType = 'default',
  indeterminate = false,
  readonly = false,
  rootStyle,
  size = 'normal',
  slotStyles,
  testID,
  onToggle,
  ...rest
}: CheckboxControlProps) {
  const { token } = useTheme();
  const tokenStyles = useStyles({ block, displayType, size });
  const sizeConfig = SIZE_CONFIG[size];
  const isButton = displayType === 'button';
  const isDisabled = disabled || readonly;
  const isVisualChecked = checked || indeterminate;
  const progress = useSharedValue(isVisualChecked ? 1 : 0);
  const markAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  useEffect(() => {
    progress.value = withTiming(isVisualChecked ? 1 : 0, {
      duration: MARK_TRANSITION_DURATION,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [isVisualChecked, progress, token.motionEaseInOut]);

  const labelColor = getLabelColor({ checked, disabled, displayType, readonly });
  const labelWeight: TextWeight = isButton && checked ? 'semibold' : 'regular';
  const labelStyle: StyleProp<TextStyle> = [tokenStyles.label, slotStyles?.label];
  const markColor: TextColor = isButton
    ? disabled
      ? 'quaternary'
      : 'primary'
    : disabled
      ? 'tertiary'
      : 'lightSolid';
  const label = renderTextNode(children, text => (
    <Text
      color={labelColor}
      size={isButton ? 'sm' : sizeConfig.labelSize}
      style={labelStyle}
      testID={toSlotTestID(testID, 'label')}
      weight={labelWeight}
    >
      {text}
    </Text>
  ));
  const markNode = (
    <Animated.View
      style={[tokenStyles.mark, slotStyles?.mark, markAnimatedStyle]}
      testID={toSlotTestID(testID, 'mark')}
    >
      {isVisualChecked ? (
        <Icon
          color={markColor}
          icon={indeterminate ? 'minus' : 'check'}
          size={sizeConfig.markSize}
          testID={toSlotTestID(testID, indeterminate ? 'mark-minus' : 'mark-check')}
          weight={MARK_ICON_WEIGHT}
        />
      ) : null}
    </Animated.View>
  );
  const indicatorStyle: StyleProp<ViewStyle> = [
    tokenStyles.indicator,
    isVisualChecked ? tokenStyles.indicatorChecked : null,
    disabled
      ? checked
        ? tokenStyles.indicatorDisabledChecked
        : tokenStyles.indicatorDisabled
      : null,
    slotStyles?.indicator,
  ];

  function handlePress(): void {
    if (isDisabled) {
      return;
    }

    onToggle();
  }

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      testID={testID}
      onPress={handlePress}
      style={({ pressed }) => [
        tokenStyles.control,
        pressed && !isDisabled ? tokenStyles.controlPressed : null,
        checked ? tokenStyles.controlChecked : null,
        isDisabled ? tokenStyles.controlDisabled : null,
        controlStyle,
        rootStyle,
      ]}
    >
      <Row style={[tokenStyles.content, slotStyles?.content]}>
        {isButton ? null : (
          <View style={indicatorStyle} testID={toSlotTestID(testID, 'indicator')}>
            {markNode}
          </View>
        )}
        {isButton && checked ? markNode : null}
        {label}
      </Row>
    </Pressable>
  );
}

function BaseCheckbox({
  value,
  defaultValue = false,
  onChange,
  disabled = false,
  readonly = false,
  indeterminate = false,
  children,
  size = 'normal',
  displayType = 'default',
  style,
  styles,
  ...rest
}: CheckboxProps) {
  const [checked, setChecked] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );

  function handleToggle(): void {
    setChecked(!checked);
  }

  return (
    <CheckboxControl
      {...rest}
      block={false}
      checked={Boolean(checked)}
      disabled={disabled}
      displayType={displayType}
      indeterminate={indeterminate}
      readonly={readonly}
      rootStyle={style}
      size={size}
      slotStyles={styles}
      testID="checkbox-control"
      onToggle={handleToggle}
    >
      {children ?? null}
    </CheckboxControl>
  );
}

function CheckboxGroup({
  value,
  defaultValue = [],
  onChange,
  options = [],
  disabled = false,
  readonly = false,
  displayType = 'default',
  size = 'normal',
  block = false,
  direction = 'horizontal',
  style,
  styles,
  ...rest
}: CheckboxGroupProps) {
  const [selectedValues, setSelectedValues] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const isHorizontal = direction === 'horizontal';
  const isBlockGrid = block && isHorizontal && displayType === 'button';
  const groupStyles = useGroupStyles({ block, direction, isBlockGrid });
  const safeSelectedValues = React.useMemo(
    () => selectedValues ?? [],
    [selectedValues],
  );
  const optionSlotStyles = React.useMemo<CheckboxStyles>(
    () => ({
      content: styles?.content,
      indicator: styles?.indicator,
      label: styles?.label,
      mark: styles?.mark,
    }),
    [styles],
  );

  function toggleOption(option: CheckboxGroupOption): void {
    if (disabled || readonly || option.disabled === true) {
      return;
    }

    const isSelected = includesValue(safeSelectedValues, option.value);
    const nextValue = isSelected
      ? safeSelectedValues.filter(item => item !== option.value)
      : [...safeSelectedValues, option.value];

    setSelectedValues(nextValue);
  }

  const items = options.map(option => {
    const isSelected = includesValue(safeSelectedValues, option.value);
    const optionTestID = `checkbox-group-option-${String(option.value)}`;
    const control = (
      <CheckboxControl
        {...rest}
        key={optionTestID}
        block={block}
        checked={isSelected}
        controlStyle={styles?.option}
        disabled={disabled || option.disabled === true}
        displayType={displayType}
        readonly={readonly}
        size={size}
        slotStyles={optionSlotStyles}
        testID={optionTestID}
        onToggle={() => {
          toggleOption(option);
        }}
      >
        {getOptionLabel(option)}
      </CheckboxControl>
    );

    return isBlockGrid ? (
      <View key={optionTestID} style={groupStyles.blockCell}>
        {control}
      </View>
    ) : (
      control
    );
  });

  return isHorizontal ? (
    <Row testID="checkbox-group-root" wrap style={[groupStyles.root, style]}>
      {items}
    </Row>
  ) : (
    <Column testID="checkbox-group-root" style={[groupStyles.root, style]}>
      {items}
    </Column>
  );
}

type CheckboxComponent = typeof BaseCheckbox & {
  Group: typeof CheckboxGroup;
};

export const Checkbox = BaseCheckbox as CheckboxComponent;
Checkbox.Group = CheckboxGroup;
