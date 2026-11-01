import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../../Icon';
import { Tag } from '../../Tag';
import { useTagValueDisplayStyles } from './style';
import type { TagValueDisplayProps } from './types';

export function TagValueDisplay({
  items,
  size = 'normal',
  tagProps,
  disabled,
  readonly,
  onRemove,
}: TagValueDisplayProps) {
  const wrap = tagProps?.wrap !== false;
  const closable = tagProps?.closable !== false && !disabled && !readonly;
  const maxCount = tagProps?.maxCount;
  const styles = useTagValueDisplayStyles({ size, wrap });

  const visibleItems =
    maxCount !== undefined ? items.slice(0, maxCount) : items;
  const overflowCount = maxCount !== undefined ? items.length - maxCount : 0;

  return (
    <View testID="tag-value-container" style={styles.container}>
      {visibleItems.map(item => (
        <View key={String(item.value)} style={styles.tagItem}>
          <Tag size="small" disabled={disabled}>
            {item.label === undefined ? item.labelText : item.label}
          </Tag>
          {closable ? (
            <Pressable
              testID="tag-close"
              onPress={() => onRemove?.(item.value)}
              hitSlop={4}
            >
              <Icon icon="close" size="small" color="textTertiary" />
            </Pressable>
          ) : null}
        </View>
      ))}
      {overflowCount > 0 ? (
        <Tag size="small" disabled={disabled}>
          {`+${overflowCount}`}
        </Tag>
      ) : null}
    </View>
  );
}
