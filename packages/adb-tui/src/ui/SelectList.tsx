import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { UI_COLORS } from './theme';

export interface SelectItem<T> {
  label: string;
  value: T;
  hint?: string;
  color?: 'cyan' | 'green' | 'yellow' | 'red' | 'gray';
  shortcut?: string;
}

interface SelectListProps<T> {
  items: ReadonlyArray<SelectItem<T>>;
  onSelect: (value: T) => void;
  emptyText?: string;
}

function getItemColor<T>(item: SelectItem<T>, focused: boolean): string {
  if (focused) {
    return UI_COLORS.primaryStrong;
  }

  if (item.color === 'green') {
    return UI_COLORS.success;
  }
  if (item.color === 'yellow') {
    return UI_COLORS.warning;
  }
  if (item.color === 'red') {
    return UI_COLORS.error;
  }
  if (item.color === 'gray') {
    return UI_COLORS.muted;
  }
  if (item.color === 'cyan') {
    return UI_COLORS.primary;
  }

  return UI_COLORS.text;
}

export function SelectList<T>({
  items,
  onSelect,
  emptyText = '暂无可选项',
}: SelectListProps<T>) {
  const [index, setIndex] = useState(0);

  useInput((_input, key) => {
    if (items.length === 0) {
      return;
    }

    if (key.upArrow) {
      setIndex(prev => (prev - 1 + items.length) % items.length);
    } else if (key.downArrow) {
      setIndex(prev => (prev + 1) % items.length);
    } else if (key.return) {
      const item = items[index];
      if (item) {
        onSelect(item.value);
      }
    }
  });

  if (items.length === 0) {
    return <Text color={UI_COLORS.muted}>{emptyText}</Text>;
  }

  return (
    <Box flexDirection="column">
      {items.map((item, i) => {
        const focused = i === index;

        return (
          <Box key={i} gap={1}>
            <Text
              color={focused ? UI_COLORS.primaryStrong : UI_COLORS.muted}
              bold={focused}
            >
              {focused ? '›' : ' '}
            </Text>
            <Text
              color={focused ? UI_COLORS.primaryStrong : UI_COLORS.muted}
              bold={focused}
            >
              {focused ? '●' : '○'}
            </Text>
            <Text color={getItemColor(item, focused)} bold={focused}>
              {item.label}
            </Text>
            {item.shortcut ? (
              <Text color={focused ? UI_COLORS.primaryStrong : UI_COLORS.muted}>
                {item.shortcut}
              </Text>
            ) : null}
            {item.hint ? (
              <Text color={UI_COLORS.muted}>{item.hint}</Text>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
