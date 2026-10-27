import React from 'react';
import { Pressable } from 'react-native';
import { Row } from '../Row';
import { Text } from '../Text';
import type { GestureResponderEvent, StyleProp, TextStyle } from 'react-native';
import type { TagProps } from './types';
import { SIZE_STYLE_MAP, useStyles } from './style';

function renderContent(
  children: TagProps['children'],
  size: TagProps['size'],
  contentStyle: StyleProp<TextStyle>,
  externalContentStyle: StyleProp<TextStyle>,
) {
  if (typeof children === 'string' || typeof children === 'number') {
    return (
      <Text
        numberOfLines={1}
        size={SIZE_STYLE_MAP[size ?? 'normal'].textSize}
        weight="regular"
        style={[contentStyle, externalContentStyle]}
      >
        {children}
      </Text>
    );
  }

  return children;
}

export function Tag({
  children,
  color = 'default',
  disabled = false,
  onPress,
  prefix,
  size = 'normal',
  style,
  styles,
  variant = 'filled',
  ...rest
}: TagProps) {
  const tokenStyles = useStyles({
    color,
    hasPrefix: prefix !== undefined,
    size,
    variant,
  });
  const isInteractive = Boolean(onPress) && !disabled;
  const shouldUsePressable = Boolean(onPress);
  const contentNode = renderContent(
    children,
    size,
    [tokenStyles.content, disabled ? tokenStyles.contentDisabled : null],
    styles?.content,
  );

  function handlePress(event: GestureResponderEvent): void {
    if (!isInteractive) {
      return;
    }

    onPress?.(event);
  }

  if (shouldUsePressable) {
    return (
      <Pressable
        {...rest}
        disabled={!isInteractive}
        onPress={handlePress}
        style={({ pressed }) => [
          tokenStyles.root,
          styles?.root,
          pressed && isInteractive ? tokenStyles.rootPressed : null,
          disabled ? tokenStyles.rootDisabled : null,
          style,
        ]}
      >
        {prefix}
        {contentNode}
      </Pressable>
    );
  }

  return (
    <Row
      align="center"
      justify="center"
      testID={rest.testID}
      style={[
        tokenStyles.root,
        styles?.root,
        disabled ? tokenStyles.rootDisabled : null,
        style,
      ]}
    >
      {prefix}
      {contentNode}
    </Row>
  );
}
