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
import { FIELD_SIZE_MAP, resolveFieldSize } from '../shares/fieldMetrics';
import { isPrimitiveContent, renderTextNode } from '../shares/node';
import { useControllableValue } from '../_hooks';
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
import { useFieldProps } from '../Form/hooks/useFieldProps.ts';

const AnimatedText = createAnimatedComponent(Text);
const AnimatedView = createAnimatedComponent(View);

interface InputStyleOptions {
  size: ComponentSize;
  disabled: boolean;
  isError: boolean;
  hasLabel: boolean;
}

interface SearchInputStyleOptions {
  size: ComponentSize;
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
  (token, { disabled, hasLabel, isError, size }: InputStyleOptions) => {
    const metrics = FIELD_SIZE_MAP[size];
    const height = metrics.height(token);
    const valueFontSize = metrics.valueFontSize(token);
    const valueLineHeight = metrics.valueLineHeight(token);
    const valuePaddingBottom = metrics.valuePaddingBottom;
    const activeUnderlineColor = isError ? token.colorError : token.colorPrimary;
    const labelColor = disabled
      ? token.colorTextDisabled
      : isError
      ? token.colorError
      : token.colorTextPlaceholder;

    return {
      root: {
        gap: token.sizeXXS,
      },
      // 下划线字段不提供填充背景，控件边界只由底部框线表达
      field: {
        minHeight: height,
        paddingHorizontal: metrics.paddingHorizontal(token),
        flexDirection: 'row',
        alignItems: 'center',
        gap: metrics.gap(token),
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
        minHeight: height,
        justifyContent: 'flex-end',
        position: 'relative',
      },
      inputWrapperMultiline: {
        justifyContent: 'flex-start',
      } as ViewStyle,
      labelContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: token.zIndexBase,
      } as ViewStyle,
      label: {
        color: labelColor,
        fontFamily: token.fontFamily,
      } as TextStyle,
      // 标签浮起后承担“字段名”职责，用 tertiary 保证小字号可读性
      labelFilled: {
        color: disabled
          ? token.colorTextDisabled
          : isError
          ? token.colorError
          : token.colorTextTertiary,
      },
      labelActive: {
        color: activeUnderlineColor,
      },
      input: {
        flex: 1,
        minWidth: 0,
        padding: 0,
        margin: 0,
        fontFamily: token.fontFamily,
        fontSize: valueFontSize,
        lineHeight: valueLineHeight,
        color: disabled ? token.colorTextDisabled : token.colorText,
      } as TextStyle,
      // 有标签时文本贴底并对下划线留白；无标签时文本在控件内垂直居中
      inputPadding: (hasLabel
        ? {
            paddingTop: height - valueLineHeight - valuePaddingBottom,
            paddingBottom: valuePaddingBottom,
          }
        : {
            paddingTop: (height - valueLineHeight) / 2,
            paddingBottom: (height - valueLineHeight) / 2,
          }) as TextStyle,
      // 多行文本从标签下方开始排版，控件随行数向下生长
      inputPaddingMultiline: (hasLabel
        ? {
            paddingTop:
              metrics.labelTop +
              metrics.labelLineHeight(token) +
              valuePaddingBottom,
            paddingBottom: valuePaddingBottom,
          }
        : {
            paddingTop: valuePaddingBottom,
            paddingBottom: valuePaddingBottom,
          }) as TextStyle,
      inputMultiline: {
        flex: 0,
        textAlignVertical: 'top',
      } as TextStyle,
      // 下划线始终 1px，激活态只换颜色，避免边框在聚焦时变粗
      underline: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: token.lineWidth,
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
      loading: {
        flexShrink: 0,
      },
    };
  },
);

const useSearchStyles = createUseSheetStyle(
  (token, { size }: SearchInputStyleOptions) => {
    const metrics = FIELD_SIZE_MAP[size];

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
        fontSize: metrics.valueFontSize(token),
      },
    };
  },
);

function InputView({
  clearable,
  defaultValue,
  disabled = false,
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
  size,
  status = 'default',
  style,
  styles,
  suffix,
  value,
  ...rest
}: InputProps) {
  const resolvedSize = resolveFieldSize(size);
  const { token } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [mergedValue = '', setMergedValue] = useControllableValue(
    defaultValue ?? '',
    value,
    onChange,
  );
  const isError = status === 'error';
  const labelNode = resolveLabel({ label, labelText });
  const hasFloatingLabel = hasNode(labelNode);
  const tokenStyles = useStyles({
    disabled,
    hasLabel: hasFloatingLabel,
    isError,
    size: resolvedSize,
  });
  const isEditable = !disabled && !readonly;
  const hasPrefix = hasNode(prefix);
  const hasSuffix = hasNode(suffix);
  const isActive = isFocused || Boolean(mergedValue);
  const shouldShowClearButton =
    clearable === true && Boolean(mergedValue) && isEditable && loading !== true;
  const progress = useSharedValue(isActive ? 1 : 0);
  const metrics = FIELD_SIZE_MAP[resolvedSize];
  const bodyFontSize = metrics.valueFontSize(token);
  const bodyLineHeight = metrics.valueLineHeight(token);
  const labelFontSize = metrics.labelFontSize(token);
  const labelLineHeight = metrics.labelLineHeight(token);
  const controlHeight = metrics.height(token);
  const inactiveLabelTop = controlHeight / 2 - bodyLineHeight / 2;
  const labelOffsetX = metrics.labelOffsetX(token);
  // 激活态标签收起字号并向控件左上角收拢，为输入文本让出视觉空间
  const activeLabelTop = metrics.labelTop;
  const placeholderTextColor = hasFloatingLabel && !isFocused
    ? 'transparent'
    : token.colorTextPlaceholder;

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [isActive, progress, token.motionDurationMid, token.motionEaseInOut]);

  const labelPositionAnimatedStyle = useAnimatedStyle(() => ({
    top: interpolate(
      progress.value,
      [0, 1],
      [inactiveLabelTop, activeLabelTop],
    ),
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, -labelOffsetX]),
      },
    ],
  }));

  const labelTextAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      progress.value,
      [0, 1],
      [bodyFontSize, labelFontSize],
    ),
    lineHeight: interpolate(
      progress.value,
      [0, 1],
      [bodyLineHeight, labelLineHeight],
    ),
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

  const labelContent = labelNode;
  const isTextLabel = isPrimitiveContent(labelContent);

  return (
    <Column style={[tokenStyles.root, style]}>
      <Row style={[tokenStyles.field, styles?.field]} testID="input-field">
        <View
          pointerEvents="none"
          style={[
            tokenStyles.underline,
            isFocused || isError ? tokenStyles.underlineActive : null,
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
          {hasFloatingLabel && isTextLabel ? (
            <AnimatedText
              style={[
                tokenStyles.labelContainer,
                tokenStyles.label,
                isFocused
                  ? tokenStyles.labelActive
                  : isActive
                  ? tokenStyles.labelFilled
                  : null,
                styles?.labelText,
                labelPositionAnimatedStyle,
                labelTextAnimatedStyle,
              ]}
              testID="input-floating-label"
            >
              {labelContent}
            </AnimatedText>
          ) : hasFloatingLabel ? (
            <AnimatedView
              style={[
                tokenStyles.labelContainer,
                labelPositionAnimatedStyle,
              ]}
              testID="input-floating-label"
            >
              {labelContent}
            </AnimatedView>
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
              multiline ? tokenStyles.inputPaddingMultiline : tokenStyles.inputPadding,
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
    </Column>
  );
}

type InputBlurEvent = Parameters<NonNullable<TextInputProps['onBlur']>>[0];

function useBoundInputProps(props: InputProps | InputSearchProps) {
  return useFieldProps<string, InputBlurEvent>({
    value: props.value,
    onChange: props.onChange,
    onBlur: props.onBlur,
    label: props.label,
    labelText: props.labelText,
    disabled: props.disabled,
    readonly: props.readonly,
    status: props.status,
  });
}

function InputRoot(rawProps: InputProps) {
  const field = useBoundInputProps(rawProps);

  return <InputView {...rawProps} {...field} />;
}

function SearchInput(rawProps: InputSearchProps) {
  const field = useBoundInputProps(rawProps);
  const {
    defaultValue,
    loading,
    onClear,
    onSearch,
    onSubmitEditing,
    searchIcon,
    size,
    ...rest
  } = rawProps;
  const resolvedSize = resolveFieldSize(size);
  const tokenStyles = useSearchStyles({ size: resolvedSize });
  const { token } = useTheme();
  const [mergedValue = '', setMergedValue] = useControllableValue(
    defaultValue ?? '',
    field.value,
    field.onChange,
  );
  const canSearch = field.disabled !== true && field.readonly !== true && loading !== true;

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
    <InputView
      {...rest}
      {...field}
      defaultValue={defaultValue}
      disabled={field.disabled === true}
      loading={loading}
      onChange={handleChangeText}
      onClear={handleClear}
      onSubmitEditing={handleSubmitEditing}
      readonly={field.readonly === true}
      returnKeyType={rawProps.returnKeyType ?? 'search'}
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
