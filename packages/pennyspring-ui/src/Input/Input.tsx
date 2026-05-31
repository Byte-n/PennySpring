import React, { useEffect, useState } from 'react';
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
import { renderTextNode } from '../shares/node';
import { useControllableValue } from '../_hooks';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../shares/types';
import type {
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type {
  InputProps,
  InputSearchProps,
} from './types';

const AnimatedText = createAnimatedComponent(Text);
const AnimatedView = createAnimatedComponent(View);

interface InputStyleOptions {
  size: ComponentSize;
  disabled: boolean;
  isError: boolean;
}

interface SearchInputStyleOptions {
  size: ComponentSize;
}

interface SizeConfig {
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
  small: {
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.paddingXS,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeightLG,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    minHeight: token => token.controlHeightLG + token.paddingSM,
    paddingHorizontal: token => token.padding,
    gap: token => token.sizeSM,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

function hasNode(node: React.ReactNode | null | undefined): boolean {
  return node !== undefined && node !== null;
}

function resolveLabel({
  label,
  labelText,
}: Pick<InputProps, 'label' | 'labelText'>): React.ReactNode | null {
  if (label === null) {
    return null;
  }

  return label ?? labelText ?? null;
}

const useStyles = createUseSheetStyle(
  (token, { disabled, isError, size }: InputStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];
    const activeUnderlineColor = isError ? token.colorError : token.colorPrimary;

    return {
      root: {
        gap: token.sizeXXS,
      },
      field: {
        minHeight: sizeConfig.minHeight(token),
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorFillTertiary,
        borderTopLeftRadius: token.borderRadiusSM,
        borderTopRightRadius: token.borderRadiusSM,
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizeConfig.gap(token),
        overflow: 'hidden',
        position: 'relative',
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
        minHeight: sizeConfig.minHeight(token),
        justifyContent: 'flex-end',
        position: 'relative',
      },
      inputWrapperMultiline: {
        justifyContent: 'flex-start',
      } as ViewStyle,
      label: {
        position: 'absolute',
        left: 0,
        right: 0,
        color: isError ? token.colorError : token.colorTextPlaceholder,
        fontFamily: token.fontFamily,
        zIndex: token.zIndexBase,
      } as TextStyle,
      labelActive: {
        color: activeUnderlineColor,
      },
      input: {
        flex: 1,
        minWidth: 0,
        padding: 0,
        margin: 0,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        color: disabled ? token.colorTextDisabled : token.colorText,
      } as TextStyle,
      inputWithLabel: {
        paddingTop: token.padding + token.paddingXS,
        paddingBottom: 0,
      } as TextStyle,
      inputWithoutLabel: {
        paddingTop: token.paddingXS,
        paddingBottom: 0,
      } as TextStyle,
      inputMultiline: {
        flex: 0,
        textAlignVertical: 'top',
      } as TextStyle,
      underline: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: token.lineWidthBold,
        backgroundColor: disabled ? token.colorBorderDisabled : token.colorBorder,
      } as ViewStyle,
      underlineActive: {
        backgroundColor: activeUnderlineColor,
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
      helper: {},
      error: {},
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
  disabled = false,
  error,
  errorText,
  helper,
  helperText,
  label,
  labelText,
  loading,
  multiline = false,
  onBlur,
  onChange,
  onClear,
  onFocus,
  placeholder,
  prefix,
  readonly = false,
  required,
  size,
  status = 'default',
  style,
  styles,
  suffix,
  value,
  ...rest
}: InputProps) {
  const resolvedSize = resolveSize(size);
  const { token } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [mergedValue = '', setMergedValue] = useControllableValue(
    defaultValue ?? '',
    value,
    onChange,
  );
  const errorMessage = error !== undefined ? error : errorText;
  const helperMessage = helper !== undefined ? helper : helperText;
  const isError = status === 'error' || hasNode(errorMessage);
  const message = hasNode(errorMessage) ? errorMessage : helperMessage;
  const tokenStyles = useStyles({
    disabled,
    isError,
    size: resolvedSize,
  });
  const isEditable = !disabled && !readonly;
  const labelNode = resolveLabel({ label, labelText });
  const hasFloatingLabel = hasNode(labelNode);
  const hasPrefix = hasNode(prefix);
  const hasSuffix = hasNode(suffix);
  const isActive = isFocused || Boolean(mergedValue);
  const shouldShowClearButton =
    clearable === true && Boolean(mergedValue) && isEditable && loading !== true;
  const progress = useSharedValue(isActive ? 1 : 0);
  const underlineProgress = useSharedValue(isFocused || isError ? 1 : 0);
  const sizeConfig = SIZE_MAP[resolvedSize];
  const bodyFontSize = sizeConfig.fontSize(token);
  const labelFontSize = token.fontSizeSM;
  const labelLineHeight = token.lineHeightSM;
  const controlHeight = sizeConfig.minHeight(token);
  const inactiveLabelTop = controlHeight / 2 - labelLineHeight / 2;
  const activeLabelTop = token.paddingXXS;
  const underlineInactiveScale = token.lineWidth / token.lineWidthBold;
  const underlineActiveScale = token.lineWidthBold / token.lineWidth;
  const placeholderTextColor = hasFloatingLabel && !isFocused
    ? 'transparent'
    : token.colorTextPlaceholder;

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [isActive, progress, token.motionDurationMid, token.motionEaseInOut]);

  useEffect(() => {
    underlineProgress.value = withTiming(isFocused || isError ? 1 : 0, {
      duration: token.motionDurationFast,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [isError, isFocused, token.motionDurationFast, token.motionEaseInOut, underlineProgress]);

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const top = interpolate(
      progress.value,
      [0, 1],
      [inactiveLabelTop, activeLabelTop],
    );
    const fontSize = interpolate(
      progress.value,
      [0, 1],
      [bodyFontSize, labelFontSize],
    );

    return {
      top,
      fontSize,
      lineHeight: labelLineHeight,
      opacity: interpolate(progress.value, [0, 1], [1, 1]),
    };
  });

  const underlineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleY: interpolate(
          underlineProgress.value,
          [0, 1],
          [underlineInactiveScale, underlineActiveScale],
        ),
      },
    ],
  }));

  function handleClear(): void {
    setMergedValue('');
    onClear?.();
  }

  function handleChangeText(text: string): void {
    if (!isEditable) {
      return;
    }

    setMergedValue(text);
  }

  function handleFocus(
    event: Parameters<NonNullable<TextInputProps['onFocus']>>[0],
  ): void {
    if (!isEditable) {
      return;
    }

    setIsFocused(true);
    onFocus?.(event as NativeSyntheticEvent<TextInputFocusEventData>);
  }

  function handleBlur(
    event: Parameters<NonNullable<TextInputProps['onBlur']>>[0],
  ): void {
    setIsFocused(false);
    onBlur?.(event as NativeSyntheticEvent<TextInputFocusEventData>);
  }

  const labelContent = required === true && typeof labelNode === 'string'
    ? `${labelNode} *`
    : labelNode;

  return (
    <Column style={[tokenStyles.root, style]}>
      <Row style={[tokenStyles.field, styles?.field]}>
        <AnimatedView
          pointerEvents="none"
          style={[
            tokenStyles.underline,
            isFocused || isError ? tokenStyles.underlineActive : null,
            underlineAnimatedStyle,
          ]}
          testID="input-underline"
        />
        {hasPrefix ? (
          <Row style={[tokenStyles.prefix, styles?.prefix]}>
            {renderTextNode(prefix, (text) => (
              <Text>{text}</Text>
            ))}
          </Row>
        ) : null}
        <View style={[tokenStyles.inputWrapper, multiline ? tokenStyles.inputWrapperMultiline : null]}>
          {hasFloatingLabel ? (
            <AnimatedText
              color={isFocused || isError ? undefined : 'placeholder'}
              style={[
                tokenStyles.label,
                isFocused ? tokenStyles.labelActive : null,
                styles?.labelText,
                labelAnimatedStyle,
              ]}
              testID="input-floating-label"
            >
              {labelContent}
            </AnimatedText>
          ) : null}
          <TextInput
            {...rest}
            cursorColor={isError ? token.colorError : token.colorPrimary}
            editable={isEditable}
            multiline={multiline}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            selectionColor={isError ? token.colorError : token.colorPrimary}
            style={[
              tokenStyles.input,
              hasFloatingLabel ? tokenStyles.inputWithLabel : tokenStyles.inputWithoutLabel,
              multiline ? tokenStyles.inputMultiline : null,
              styles?.input,
            ]}
            underlineColorAndroid="transparent"
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
          <Row style={[tokenStyles.suffix, styles?.suffix]}>
            {renderTextNode(suffix, (text) => (
              <Text>{text}</Text>
            ))}
          </Row>
        ) : null}
      </Row>
      {hasNode(message) ? (
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
    setMergedValue('');
    onClear?.();
  }

  function handleSearch(): void {
    if (!canSearch) {
      return;
    }

    onSearch?.(mergedValue);
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
      onChange={handleChangeText}
      onClear={handleClear}
      onSubmitEditing={handleSubmitEditing}
      readonly={readonly}
      returnKeyType={rest.returnKeyType ?? 'search'}
      size={resolvedSize}
      suffix={
        <Pressable
          disabled={!canSearch}
          hitSlop={token.sizeXS}
          onPress={handleSearch}
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
