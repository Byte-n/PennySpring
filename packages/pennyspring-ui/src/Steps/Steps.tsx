import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import { useControllableValue } from '../_hooks';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type { TextSize, TextWeight } from '../Text/types';
import type { TextColor } from '../Text/types';
import type { StyleProp, TextStyle } from 'react-native';
import type {
  StepsItem,
  StepsProps,
  StepsStatus,
} from './types';
import { useStyles } from './style';

function resolveSizeMap(size: ComponentSize): TextSize {
  if (size === 'small') return 'sm';
  if (size === 'large') return 'lg';
  return 'md';
}

function renderTitleContent(
  node: ReactNode,
  text: string | undefined,
  size: TextSize,
  weight: TextWeight,
  color: TextColor,
  style?: StyleProp<TextStyle>,
) {
  if (node !== undefined) {
    return node === null ? null : node;
  }

  if (text === undefined || text === null || text === '') {
    return null;
  }

  return (
    <Text size={size} weight={weight} color={color} style={style}>
      {text}
    </Text>
  );
}

function renderDescriptionContent(
  node: ReactNode,
  text: string | undefined,
  size: TextSize,
  weight: TextWeight,
  color: TextColor,
  style?: StyleProp<TextStyle>,
) {
  if (node !== undefined) {
    return node === null ? null : node;
  }

  if (text === undefined || text === null || text === '') {
    return null;
  }

  return (
    <Text size={size} weight={weight} color={color} style={style}>
      {text}
    </Text>
  );
}

function resolveItemStatus(
  item: StepsItem,
  index: number,
  activeIndex: number,
  baseStatus: StepsStatus,
): StepsStatus {
  if (item.status !== undefined) {
    return item.status;
  }

  if (index < activeIndex) {
    return 'finish';
  }

  if (index === activeIndex) {
    return baseStatus;
  }

  return 'wait';
}

export function Steps({
  items,
  value,
  defaultValue = 0,
  onChange,
  disabled = false,
  readonly = false,
  size = 'normal',
  status = 'process',
  style,
  styles,
  onPress,
  ...rest
}: StepsProps) {
  const tokenStyles = useStyles({ size });
  const textSize = resolveSizeMap(size);
  const normalizedItems = useMemo(() => [...items], [items]);
  const [selectedIndex, setSelectedIndex] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );

  const safeSelectedIndex = Math.min(
    Math.max(selectedIndex ?? 0, 0),
    Math.max(normalizedItems.length - 1, 0),
  );
  const isRootDisabled = disabled || readonly;

  return (
    <Column align="start" style={[tokenStyles.root, style]} testID="steps-root">
      {normalizedItems.map((item, index) => {
        const itemDisabled = isRootDisabled || item.disabled === true;
        const isSelected = index === safeSelectedIndex;
        const itemStatus = resolveItemStatus(item, index, safeSelectedIndex, status);
        const isLast = index === normalizedItems.length - 1;
        const indicatorText = String(index + 1);
        const indicatorStatusStyle =
          itemStatus === 'finish'
            ? tokenStyles.indicatorFinish
            : itemStatus === 'error'
              ? tokenStyles.indicatorError
              : itemStatus === 'wait'
                ? tokenStyles.indicatorWait
                : tokenStyles.indicatorProcess;
        const indicatorTextColor =
          itemStatus === 'wait' ? 'secondary' : 'lightSolid';
        const titleColor = itemDisabled ? 'disabled' : 'default';
        const descriptionColor = itemDisabled ? 'disabled' : 'secondary';

        return (
          <Pressable
            {...rest}
            key={item.key ?? `${String(index)}-${item.titleText ?? ''}`}
            testID={`steps-item-${String(index)}`}
            disabled={itemDisabled}
            onPress={event => {
              if (itemDisabled || isSelected) {
                return;
              }

              onPress?.(event, index, item);
              setSelectedIndex(index);
            }}
            style={({ pressed }) => [
              tokenStyles.item,
              styles?.item,
              itemDisabled ? tokenStyles.itemDisabled : null,
              pressed && !itemDisabled ? tokenStyles.itemPressed : null,
            ]}
          >
            <Row align="start" gap={size}>
              <Column align="center" style={[tokenStyles.stepHeader, styles?.stepHeader]}>
                <Row
                  align="center"
                  justify="center"
                  style={[tokenStyles.indicator, indicatorStatusStyle, styles?.indicator]}
                >
                  <Text
                    size={textSize}
                    weight="strong"
                    color={indicatorTextColor}
                    style={styles?.indicatorText}
                  >
                    {indicatorText}
                  </Text>
                </Row>
                {isLast ? null : (
                  <Column
                    style={[
                      tokenStyles.connector,
                      itemStatus === 'finish' ? tokenStyles.connectorFinish : null,
                      styles?.connector,
                    ]}
                  />
                )}
              </Column>
              <Column
                style={[tokenStyles.content, isLast ? tokenStyles.contentLast : null, styles?.content]}
                testID="steps-content"
              >
                {renderTitleContent(
                  item.title,
                  item.titleText,
                  textSize,
                  'strong',
                  titleColor,
                  styles?.titleText,
                )}
                {renderDescriptionContent(
                  item.description,
                  item.descriptionText,
                  textSize,
                  'regular',
                  descriptionColor,
                  styles?.descriptionText,
                )}
              </Column>
            </Row>
          </Pressable>
        );
      })}
    </Column>
  );
}
