import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { TextColor, TextSize, TextWeight } from '../Text/types';
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
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { renderTextNode } from '../shares/node';
import {
  RADIO_TRANSITION_DURATION,
  SIZE_CONFIG,
  useGroupStyles,
  useStyles,
} from './style';
import type {
  RadioDisplayType,
  RadioGroupOption,
  RadioGroupProps,
  RadioGroupStyles,
  RadioGroupValue,
  RadioProps,
  RadioStyles,
} from './types';
import { useFieldProps } from '../Form/hooks/useFieldProps.ts';

function toSlotTestID(base: string, slot: string): string {
  return base === 'radio' ? `radio-${slot}` : `${base}-${slot}`;
}

function getOptionLabel(option: RadioGroupOption): ReactNode {
  if (option.label !== undefined) {
    return option.label;
  }

  if (option.labelText !== undefined) {
    return option.labelText;
  }

  return option.value;
}

interface LabelColorOptions {
  disabled: boolean;
  displayType: RadioDisplayType;
  readonly: boolean;
  selected: boolean;
}

function getLabelColor({
  disabled,
  displayType,
  readonly,
  selected,
}: LabelColorOptions): TextColor {
  if (displayType === 'button') {
    if (disabled) {
      return 'quaternary';
    }

    return selected ? 'primary' : 'secondary';
  }

  if (disabled) {
    return 'tertiary';
  }

  return readonly ? 'secondary' : 'default';
}

interface RadioControlProps extends Omit<RadioProps, 'style' | 'styles'> {
  block: boolean;
  controlStyle?: RadioGroupStyles['option'];
  rootStyle?: RadioProps['style'];
  selected: boolean;
  slotStyles?: RadioStyles;
  testID: string;
  onSelect: () => void;
}

function RadioControl({
  block,
  children,
  controlStyle,
  disabled = false,
  displayType = 'default',
  readonly = false,
  rootStyle,
  selected,
  size = 'normal',
  slotStyles,
  testID,
  onSelect,
  ...rest
}: RadioControlProps) {
  const { token } = useTheme();
  const tokenStyles = useStyles({ block, displayType, size });
  const sizeConfig = SIZE_CONFIG[size];
  const isButton = displayType === 'button';
  const isDisabled = disabled || readonly;
  const progress = useSharedValue(selected ? 1 : 0);
  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, {
      duration: RADIO_TRANSITION_DURATION,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [progress, selected, token.motionEaseInOut]);

  const labelColor = getLabelColor({ disabled, displayType, readonly, selected });
  const labelWeight: TextWeight = isButton && selected ? 'semibold' : 'regular';
  const labelSize: TextSize = isButton ? 'sm' : sizeConfig.labelSize;
  const labelStyle: StyleProp<TextStyle> = [tokenStyles.label, slotStyles?.label];
  const label = renderTextNode(children, text => (
    <Text
      color={labelColor}
      size={labelSize}
      style={labelStyle}
      testID={toSlotTestID(testID, 'label')}
      weight={labelWeight}
    >
      {text}
    </Text>
  ));

  function handlePress(): void {
    if (isDisabled || selected) {
      return;
    }

    onSelect();
  }

  const ringStyle: StyleProp<ViewStyle> = [
    tokenStyles.control,
    selected ? tokenStyles.controlSelected : null,
    disabled ? tokenStyles.controlDisabled : null,
    slotStyles?.control,
  ];

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      testID={testID}
      onPress={handlePress}
      style={({ pressed }) => [
        tokenStyles.option,
        pressed && !isDisabled ? tokenStyles.optionPressed : null,
        selected ? tokenStyles.optionSelected : null,
        isDisabled ? tokenStyles.optionDisabled : null,
        controlStyle,
        rootStyle,
      ]}
    >
      <Row style={[tokenStyles.content, slotStyles?.content]}>
        {isButton ? null : (
          <View style={ringStyle} testID={toSlotTestID(testID, 'control')}>
            <Animated.View
              style={[
                tokenStyles.indicator,
                disabled ? tokenStyles.indicatorDisabled : null,
                slotStyles?.indicator,
                indicatorAnimatedStyle,
              ]}
              testID={toSlotTestID(testID, 'indicator')}
            />
          </View>
        )}
        {label}
      </Row>
    </Pressable>
  );
}

function BaseRadio(rawProps: RadioProps) {
  const {
    value,
    defaultValue = false,
    onChange,
    disabled,
    readonly,
    children,
    size = 'normal',
    displayType = 'default',
    style,
    styles,
    ...rest
  } = rawProps;
  const field = useFieldProps<boolean>({
    value,
    onChange,
    disabled,
    readonly,
  });
  const resolvedDisabled = field.disabled === true;
  const resolvedReadonly = field.readonly === true;
  const [selectedValue, setSelectedValue] = useControllableValue(
    defaultValue,
    field.value,
    field.onChange,
  );

  function handleSelect(): void {
    setSelectedValue(true);
  }

  return (
    <RadioControl
      {...rest}
      block={false}
      disabled={resolvedDisabled}
      displayType={displayType}
      readonly={resolvedReadonly}
      rootStyle={style}
      selected={Boolean(selectedValue)}
      size={size}
      slotStyles={styles}
      testID="radio"
      onSelect={handleSelect}
    >
      {children ?? null}
    </RadioControl>
  );
}

export function RadioGroup(rawProps: RadioGroupProps) {
  const {
    value,
    defaultValue,
    onChange,
    options = [],
    disabled,
    readonly,
    displayType = 'default',
    size = 'normal',
    block = false,
    direction = 'horizontal',
    style,
    styles,
    ...rest
  } = rawProps;
  const field = useFieldProps<RadioGroupValue>({
    value,
    onChange,
    disabled,
    readonly,
  });
  const resolvedDisabled = field.disabled === true;
  const resolvedReadonly = field.readonly === true;
  const [selectedValue, setSelectedValue] = useControllableValue(
    defaultValue,
    field.value,
    field.onChange,
  );
  const isHorizontal = direction === 'horizontal';
  const isBlockGrid = block && isHorizontal && displayType === 'button';
  const groupStyles = useGroupStyles({ block, direction, isBlockGrid });
  const optionSlotStyles = React.useMemo<RadioStyles>(
    () => ({
      content: styles?.content,
      control: styles?.control,
      indicator: styles?.indicator,
      label: styles?.label,
    }),
    [styles],
  );

  const items = options.map(option => {
    const optionTestID = `radio-group-option-${String(option.value)}`;
    const control = (
      <RadioControl
        {...rest}
        key={optionTestID}
        block={block}
        controlStyle={styles?.option}
        disabled={resolvedDisabled || option.disabled === true}
        displayType={displayType}
        readonly={resolvedReadonly}
        selected={option.value === selectedValue}
        size={size}
        slotStyles={optionSlotStyles}
        testID={optionTestID}
        onSelect={() => {
          setSelectedValue(option.value);
        }}
      >
        {getOptionLabel(option)}
      </RadioControl>
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
    <Row testID="radio-group-root" wrap style={[groupStyles.root, style]}>
      {items}
    </Row>
  ) : (
    <Column testID="radio-group-root" style={[groupStyles.root, style]}>
      {items}
    </Column>
  );
}

type RadioComponent = typeof BaseRadio & {
  Group: typeof RadioGroup;
};

export const Radio = BaseRadio as RadioComponent;
Radio.Group = RadioGroup;
