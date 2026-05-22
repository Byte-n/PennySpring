import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type {
  AliasToken } from '@pennyspring/theme';
import type { ReactNode } from 'react';
import type { StyleProp,
  TextStyle } from 'react-native';
import type {
  CheckboxDisplayType,
  CheckboxGroupOption,
  CheckboxGroupProps,
  CheckboxGroupStyles,
  CheckboxProps,
  CheckboxValue,
} from './types';

interface CheckboxStyleOptions {
  block: boolean;
  direction: 'horizontal' | 'vertical';
  displayType: CheckboxDisplayType;
  size: ComponentSize;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  indicatorSize: (token: AliasToken) => number;
  markSize: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    indicatorSize: token => token.fontSizeSM,
    markSize: token => token.sizeXXS,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.paddingXXS,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeight,
    indicatorSize: token => token.fontSize,
    markSize: token => token.sizeXS,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.paddingXS,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    indicatorSize: token => token.fontSizeXL,
    markSize: token => token.sizeSM,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingSM,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

const TRANSPARENT = 'transparent';

function renderLabel(label: ReactNode, style: StyleProp<TextStyle>) {
  if (label === undefined || label === null || label === false) {
    return null;
  }

  if (typeof label === 'string' || typeof label === 'number') {
    return <Text style={style}>{label}</Text>;
  }

  return label;
}

function includesValue(
  values: readonly CheckboxValue[],
  optionValue: CheckboxValue,
): boolean {
  return values.includes(optionValue);
}

const useStyles = createUseSheetStyle(
  (
    token,
    { block, direction, displayType, size }: CheckboxStyleOptions,
  ) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const isButton = displayType === 'button';

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      groupRoot: {
        alignSelf: block ? 'stretch' : 'flex-start',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        flexWrap: direction === 'horizontal' ? 'wrap' : undefined,
        gap: sizeConfig.gap(token),
        width: block ? '100%' : undefined,
      },
      control: {
        alignItems: 'center',
        alignSelf: block ? 'stretch' : 'flex-start',
        backgroundColor: isButton ? token.colorBgContainer : TRANSPARENT,
        borderColor: isButton ? token.colorBorder : TRANSPARENT,
        borderRadius: token.borderRadius,
        borderWidth: token.lineWidth,
        flex: block && isButton ? 1 : undefined,
        flexDirection: 'row',
        justifyContent: isButton ? 'center' : 'flex-start',
        minHeight: sizeConfig.minHeight(token),
        paddingHorizontal: isButton ? sizeConfig.paddingHorizontal(token) : 0,
        paddingVertical: isButton ? sizeConfig.paddingVertical(token) : 0,
      },
      controlChecked: {
        backgroundColor: isButton ? token.colorPrimaryBg : TRANSPARENT,
        borderColor: isButton ? token.colorPrimaryBorder : TRANSPARENT,
      },
      controlPressed: {
        backgroundColor: isButton
          ? token.controlItemBgActive
          : token.colorBgTextActive,
      },
      controlDisabled: {
        backgroundColor: isButton ? token.colorBgContainerDisabled : TRANSPARENT,
        borderColor: isButton ? token.colorBorderDisabled : TRANSPARENT,
      },
      content: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: sizeConfig.gap(token),
        justifyContent: isButton ? 'center' : 'flex-start',
      },
      indicator: {
        alignItems: 'center',
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        borderRadius: token.borderRadiusXS,
        borderWidth: token.lineWidth,
        height: sizeConfig.indicatorSize(token),
        justifyContent: 'center',
        width: sizeConfig.indicatorSize(token),
      },
      indicatorChecked: {
        backgroundColor: token.colorPrimary,
        borderColor: token.colorPrimary,
      },
      indicatorDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
        borderColor: token.colorBorderDisabled,
      },
      indicatorReadonly: {
        borderColor: token.colorBorderSecondary,
      },
      mark: {
        backgroundColor: token.colorTextLightSolid,
        borderRadius: token.borderRadiusXS,
        height: sizeConfig.markSize(token),
        width: sizeConfig.markSize(token),
      },
      markIndeterminate: {
        height: token.lineWidthBold,
        width: sizeConfig.markSize(token),
      },
      label: {
        color: token.colorText,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        fontWeight: String(token.fontWeightRegular) as TextStyle['fontWeight'],
        lineHeight: sizeConfig.lineHeight(token),
      },
      labelChecked: {
        color: isButton ? token.colorPrimaryText : token.colorText,
      },
      labelDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);

interface CheckboxControlProps
  extends Omit<CheckboxProps, 'style' | 'styles'> {
  block?: boolean;
  checked: boolean;
  controlStyle?: CheckboxGroupStyles['option'];
  optionStyle?: CheckboxGroupProps['styles'];
  rootStyle?: CheckboxProps['style'];
  testID: string;
  onToggle: () => void;
}

function CheckboxControl({
  block = false,
  checked,
  children,
  controlStyle,
  disabled = false,
  displayType = 'default',
  indeterminate = false,
  optionStyle,
  readonly = false,
  rootStyle,
  size = 'normal',
  testID,
  onToggle,
  ...rest
}: CheckboxControlProps) {
  const tokenStyles = useStyles({
    block,
    direction: 'horizontal',
    displayType,
    size,
  });
  const isDisabled = disabled || readonly;
  const isVisuallyChecked = checked || indeterminate;
  const shouldRenderIndicator = displayType !== 'button';
  const label = renderLabel(children, [
    tokenStyles.label,
    optionStyle?.label,
    checked ? tokenStyles.labelChecked : null,
    isDisabled ? tokenStyles.labelDisabled : null,
  ]);

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
        controlStyle,
        checked ? tokenStyles.controlChecked : null,
        pressed && !isDisabled ? tokenStyles.controlPressed : null,
        isDisabled ? tokenStyles.controlDisabled : null,
        rootStyle,
      ]}
    >
      <View style={[tokenStyles.content, optionStyle?.content]}>
        {shouldRenderIndicator ? (
          <View
            testID={
              testID === 'checkbox-control'
                ? 'checkbox-indicator'
                : `${testID}-indicator`
            }
            style={[
              tokenStyles.indicator,
              optionStyle?.indicator,
              isVisuallyChecked ? tokenStyles.indicatorChecked : null,
              readonly ? tokenStyles.indicatorReadonly : null,
              disabled ? tokenStyles.indicatorDisabled : null,
            ]}
          >
            {isVisuallyChecked ? (
              <View
                testID={
                  testID === 'checkbox-control'
                    ? 'checkbox-mark'
                    : `${testID}-mark`
                }
                style={[
                  tokenStyles.mark,
                  optionStyle?.mark,
                  indeterminate ? tokenStyles.markIndeterminate : null,
                ]}
              />
            ) : null}
          </View>
        ) : null}
        {label}
      </View>
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
      checked={Boolean(checked)}
      disabled={disabled}
      displayType={displayType}
      indeterminate={indeterminate}
      optionStyle={styles}
      readonly={readonly}
      rootStyle={style}
      size={size}
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
  const tokenStyles = useStyles({
    block,
    direction,
    displayType,
    size,
  });
  const [selectedValues, setSelectedValues] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const safeSelectedValues = useMemo(
    () => selectedValues ?? [],
    [selectedValues],
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

  return (
    <View testID="checkbox-group-root" style={[tokenStyles.groupRoot, style]}>
      {options.map(option => {
        const isSelected = includesValue(safeSelectedValues, option.value);

        return (
          <CheckboxControl
            {...rest}
            key={String(option.value)}
            block={block}
            checked={isSelected}
            controlStyle={styles?.option}
            disabled={disabled || option.disabled === true}
            displayType={displayType}
            optionStyle={styles}
            readonly={readonly}
            size={size}
            testID={`checkbox-group-option-${String(option.value)}`}
            onToggle={() => {
              toggleOption(option);
            }}
          >
            {option.label ?? option.value}
          </CheckboxControl>
        );
      })}
    </View>
  );
}

type CheckboxComponent = typeof BaseCheckbox & {
  Group: typeof CheckboxGroup;
};

export const Checkbox = BaseCheckbox as CheckboxComponent;
Checkbox.Group = CheckboxGroup;
