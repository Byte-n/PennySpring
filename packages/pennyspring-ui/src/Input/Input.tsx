import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import {
  Easing,
  createAnimatedComponent,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';

const AnimatedLabel = createAnimatedComponent(Text);
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../shares/types';
import type {
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
} from 'react-native';
import type {
  InputProps,
  InputSearchProps,
} from './types';

interface InputStyleOptions {
  size: ComponentSize;
}

interface SearchInputStyleOptions {
  size: ComponentSize;
}

interface SizeConfig {
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    paddingHorizontal: token => token.paddingXS,
    paddingVertical: token => token.paddingXS / 2,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.controlPaddingHorizontalSM / 2,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    paddingHorizontal: token => token.padding,
    paddingVertical: token => token.padding / 2,
    gap: token => token.sizeSM,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

const useStyles = createUseSheetStyle(
  (token, { size }: InputStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      root: {
        gap: token.sizeXXS,
      },
      field: {
        minHeight: sizeConfig.minHeight(token),
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        paddingTop: sizeConfig.paddingVertical(token),
        paddingBottom: sizeConfig.paddingVertical(token),
        borderBottomWidth: token.lineWidth,
        borderBottomColor: token.colorBorder,
        backgroundColor: token.colorBgContainer,
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizeConfig.gap(token),
      },
      fieldFocused: {
        borderBottomColor: token.colorPrimary,
      },
      fieldDisabled: {
        borderBottomColor: token.colorBorderDisabled,
        backgroundColor: token.colorBgContainerDisabled,
      },
      prefix: {
        flexShrink: 0,
      },
      suffix: {
        flexShrink: 0,
      },
      inputWrapper: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
      },
      floatingLabel: {
        position: 'absolute',
        left: 0,
        pointerEvents: 'none',
      },
      input: {
        flex: 1,
        minWidth: 0,
        padding: 0,
        margin: 0,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        color: token.colorText,
      } as TextStyle,
      inputDisabled: {
        color: token.colorTextDisabled,
      },
      clearButton: {
        minHeight: token.controlHeightSM,
        minWidth: token.controlHeightSM,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: token.borderRadiusSM,
      },
      clearButtonPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      helper: {
      },
      error: {
      },
      loading: {
        flexShrink: 0,
      },
    };
  },
);

const useSearchStyles = createUseSheetStyle(
  (token, { size }: SearchInputStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      searchButton: {
        minHeight: token.controlHeightSM,
        minWidth: token.controlHeightSM,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: token.borderRadiusSM,
      },
      searchButtonPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      searchIcon: {
        color: token.colorTextTertiary,
        fontSize: sizeConfig.fontSize(token),
      },
    };
  },
);

function InputRoot({
  clearable,
  defaultValue,
  disabled,
  error,
  errorText,
  helper,
  helperText,
  label: _label,
  labelText,
  loading,
  onBlur,
  onChange,
  onClear,
  onFocus,
  placeholder,
  prefix,
  readonly,
  required,
  size,
  style,
  styles,
  suffix,
  value,
  ...rest
}: InputProps) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useStyles({ size: resolvedSize });
  const { token } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [mergedValue = '', setMergedValue] = useControllableValue(
    defaultValue ?? '',
    value,
    onChange,
  );
  const isEditable = !disabled && !readonly;
  const shouldShowClearButton =
    clearable === true && Boolean(mergedValue) && isEditable && loading !== true;
  const errorMessage = error !== undefined ? error : errorText;
  const helperMessage = helper !== undefined ? helper : helperText;
  const isError = false;
  const message = errorMessage !== undefined
    ? errorMessage
    : helperMessage;
  const hasPrefix = prefix !== undefined && prefix !== null;
  const hasSuffix = suffix !== undefined && suffix !== null;

  const isActive = isFocused || Boolean(mergedValue);
  const floatAnim = useSharedValue(isActive ? 1 : 0);

  const sizeConfig = SIZE_MAP[resolvedSize];
  const bodyFontSize = sizeConfig.fontSize(token);
  const labelFontSize = token.fontSizeSM;
  const bodyLineHeight = sizeConfig.lineHeight(token);

  const floatingLabelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnim.value, [0, 1], [0, -(bodyLineHeight / 2 + labelFontSize / 2 + token.sizeXXS)]);
    const fontSize = interpolate(floatAnim.value, [0, 1], [bodyFontSize, labelFontSize]);

    return {
      transform: [{ translateY }],
      fontSize,
      lineHeight: fontSize * 1.4,
    };
  });

  function handleClear(): void {
    if (onClear !== undefined) {
      setMergedValue('');
      onClear();
      return;
    }

    setMergedValue('');
  }

  function handleChangeText(text: string): void {
    setMergedValue(text);
  }

  function handleFocus(
    event: Parameters<NonNullable<TextInputProps['onFocus']>>[0],
  ): void {
    setIsFocused(true);
    floatAnim.value = withTiming(1, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseOut),
    });
    onFocus?.(event as NativeSyntheticEvent<TextInputFocusEventData>);
  }

  function handleBlur(
    event: Parameters<NonNullable<TextInputProps['onBlur']>>[0],
  ): void {
    setIsFocused(false);
    if (!mergedValue) {
      floatAnim.value = withTiming(0, {
        duration: token.motionDurationMid,
        easing: Easing.bezier(...token.motionEaseOut),
      });
    }
    onBlur?.(event as NativeSyntheticEvent<TextInputFocusEventData>);
  }

  const hasLabelText = labelText !== undefined && labelText !== '';
  const inlinePlaceholder = hasLabelText && placeholder
    ? `${labelText}: ${placeholder}`
    : hasLabelText
      ? labelText
      : placeholder;

  return (
    <Column style={[tokenStyles.root, style]}>
      <Row
        style={[
          tokenStyles.field,
          styles?.field,
          isFocused ? tokenStyles.fieldFocused : null,
          disabled === true ? tokenStyles.fieldDisabled : null,
        ]}
      >
        {hasPrefix ? (
          <Row style={[tokenStyles.prefix, styles?.prefix]}>{prefix}</Row>
        ) : null}
        <View style={tokenStyles.inputWrapper}>
          {hasLabelText ? (
            <AnimatedLabel
              color={isFocused ? 'primary' : 'label'}
              style={[tokenStyles.floatingLabel, floatingLabelStyle]}
              testID="input-floating-label"
            >
              {required === true ? `${labelText} *` : labelText}
            </AnimatedLabel>
          ) : null}
          <TextInput
            {...rest}
            editable={isEditable}
            multiline={false}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            placeholder={isActive ? placeholder : inlinePlaceholder}
            placeholderTextColor={token.colorTextPlaceholder}
            style={[
              tokenStyles.input,
              styles?.input,
              disabled === true ? tokenStyles.inputDisabled : null,
            ]}
            value={mergedValue}
          />
        </View>
        {shouldShowClearButton ? (
          <Pressable
            hitSlop={token.sizeXS}
            onPress={handleClear}
            style={({ pressed }) => [
              tokenStyles.clearButton,
              pressed ? tokenStyles.clearButtonPressed : null,
              styles?.clearButton,
            ]}
            testID="input-clear-button"
          >
            <Icon
              color="icon"
              icon="close"
              size={resolvedSize}
            />
          </Pressable>
        ) : loading === true ? (
          <ActivityIndicator
            color={token.colorTextTertiary}
            style={tokenStyles.loading}
          />
        ) : hasSuffix ? (
          <Row style={[tokenStyles.suffix, styles?.suffix]}>{suffix}</Row>
        ) : null}
      </Row>
      {message !== undefined && message !== null ? (
        <Text
          color={isError ? 'error' : 'description'}
          style={[
            isError ? tokenStyles.error : tokenStyles.helper,
            isError ? styles?.error : styles?.helper,
          ]}
        >
          {message}
        </Text>
      ) : null}
    </Column>
  );
}

function SearchInput({
  defaultValue,
  disabled,
  loading,
  onClear,
  onChange,
  onSearch,
  onSubmitEditing,
  readonly,
  searchIcon,
  size,
  value,
  ...rest
}: InputSearchProps) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useSearchStyles({ size: resolvedSize });
  const { token } = useTheme();
  const [mergedValue = '', setMergedValue] = useControllableValue(
    defaultValue ?? '',
    value,
    onChange,
  );
  const canSearch = !disabled && !readonly && loading !== true;

  function handleChangeText(text: string): void {
    setMergedValue(text);
  }

  function handleClear(): void {
    if (onClear !== undefined) {
      setMergedValue('');
      onClear();
      return;
    }

    setMergedValue('');
  }

  function handleSearch(): void {
    if (!canSearch) {
      return;
    }

    onSearch?.(mergedValue);
  }

  function handleSearchPress(): void {
    handleSearch();
  }

  function handleSubmitEditing(
    event: Parameters<NonNullable<TextInputProps['onSubmitEditing']>>[0],
  ): void {
    handleSearch();
    onSubmitEditing?.(event);
  }

  const resolvedSearchIcon = searchIcon ?? (
    <Icon
      color={canSearch ? 'icon' : 'textDisabled'}
      icon="search"
      size={resolvedSize}
    />
  );

  return (
    <InputRoot
      {...rest}
      defaultValue={defaultValue}
      disabled={disabled}
      loading={loading}
      onClear={handleClear}
      onChange={handleChangeText}
      onSubmitEditing={handleSubmitEditing}
      readonly={readonly}
      returnKeyType={rest.returnKeyType ?? 'search'}
      size={resolvedSize}
      suffix={
        <Pressable
          disabled={!canSearch}
          hitSlop={token.sizeXS}
          onPress={handleSearchPress}
          style={({ pressed }) => [
            tokenStyles.searchButton,
            pressed && canSearch ? tokenStyles.searchButtonPressed : null,
          ]}
          testID="input-search-button"
        >
          {resolvedSearchIcon}
        </Pressable>
      }
      value={mergedValue}
    />
  );
}

export const Input = Object.assign(InputRoot, {
  Search: SearchInput,
});
