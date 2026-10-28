import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import { useControllableValue } from '../_hooks';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { renderTextNode } from '../shares/node';
import type { ReactNode } from 'react';
import type { TextColor, TextSize } from '../Text/types';
import type { StyleProp, TextStyle } from 'react-native';
import type {
  StepsItem,
  StepsProps,
  StepsStatus,
} from './types';
import { SIZE_STYLE_MAP, useStyles } from './style';

function renderContent(
  node: ReactNode,
  text: string | undefined,
  color: TextColor,
  size: TextSize,
  weight: 'semibold' | 'regular',
  style?: StyleProp<TextStyle>,
) {
  return renderTextNode(node === undefined ? text : node, (value) => (
    <Text size={size} weight={weight} color={color} style={style}>
      {value}
    </Text>
  ));
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
  const sizeConfig = SIZE_STYLE_MAP[size];
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

  return (
    <Column align="start" style={[tokenStyles.root, style]} testID="steps-root">
      {normalizedItems.map((item, index) => {
        const isBlocked = disabled || readonly || item.disabled === true;
        const isDimmed = disabled || item.disabled === true;
        const isSelected = index === safeSelectedIndex;
        const itemStatus = resolveItemStatus(item, index, safeSelectedIndex, status);
        const isLast = index === normalizedItems.length - 1;
        const isMarked = itemStatus === 'finish' || itemStatus === 'error';
        const indicatorStatusStyle =
          itemStatus === 'finish'
            ? tokenStyles.indicatorFinish
            : itemStatus === 'error'
              ? tokenStyles.indicatorError
              : itemStatus === 'wait'
                ? tokenStyles.indicatorWait
                : tokenStyles.indicatorProcess;
        const titleColor: TextColor = isDimmed
          ? 'disabled'
          : itemStatus === 'error'
            ? 'error'
            : itemStatus === 'wait'
              ? 'secondary'
              : 'default';
        const descriptionColor: TextColor = isDimmed ? 'disabled' : 'tertiary';

        return (
          <Pressable
            {...rest}
            key={item.key ?? `${String(index)}-${item.titleText ?? ''}`}
            testID={`steps-item-${String(index)}`}
            disabled={isBlocked}
            onPress={event => {
              if (isBlocked || isSelected) {
                return;
              }

              onPress?.(event, index, item);
              setSelectedIndex(index);
            }}
            style={({ pressed }) => [
              tokenStyles.item,
              styles?.item,
              isDimmed ? tokenStyles.itemDisabled : null,
              pressed && !isBlocked ? tokenStyles.itemPressed : null,
            ]}
          >
            <Row align="stretch" gap="large">
              <Column align="center" style={[tokenStyles.stepHeader, styles?.stepHeader]}>
                <Column
                  style={[
                    tokenStyles.indicatorRing,
                    itemStatus === 'process' ? tokenStyles.indicatorRingProcess : null,
                  ]}
                >
                  <Row
                    align="center"
                    justify="center"
                    style={[tokenStyles.indicator, indicatorStatusStyle, styles?.indicator]}
                  >
                    {isMarked ? (
                      <Icon
                        color="lightSolid"
                        icon={itemStatus === 'finish' ? 'check' : 'close'}
                        size={sizeConfig.indicatorIconSize}
                      />
                    ) : (
                      <Text
                        size={sizeConfig.indicatorTextSize}
                        weight="semibold"
                        color={itemStatus === 'wait' ? 'secondary' : 'lightSolid'}
                        style={styles?.indicatorText}
                      >
                        {String(index + 1)}
                      </Text>
                    )}
                  </Row>
                </Column>
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
                {renderContent(
                  item.title,
                  item.titleText,
                  titleColor,
                  sizeConfig.titleSize,
                  'semibold',
                  styles?.titleText,
                )}
                {renderContent(
                  item.description,
                  item.descriptionText,
                  descriptionColor,
                  sizeConfig.descriptionSize,
                  'regular',
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
