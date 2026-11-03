import React from 'react';
import { Pressable } from 'react-native';
import { Column, Row, Text, createUseSheetStyle } from '@pennyspring/ui';

const KEY_ROWS: Array<Array<{ label: string; value: string }>> = [
  ['1', '2', '3'].map(value => ({ label: value, value })),
  ['4', '5', '6'].map(value => ({ label: value, value })),
  ['7', '8', '9'].map(value => ({ label: value, value })),
  [
    { label: '清空', value: 'clear' },
    { label: '0', value: '0' },
    { label: '删除', value: 'delete' },
  ],
];

interface LanKeypadProps {
  onPress: (value: string) => void;
}

const useStyles = createUseSheetStyle(token => ({
  key: {
    flex: 1,
    height: token.controlHeight,
    borderRadius: token.borderRadius,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: token.colorFillQuaternary,
  },
  pressed: {
    backgroundColor: token.colorFillTertiary,
  },
  functionKey: {
    backgroundColor: token.colorFillSecondary,
  },
}));

export function LanKeypad({ onPress }: LanKeypadProps) {
  const styles = useStyles();

  return (
    <Column gap="small">
      {KEY_ROWS.map((row, rowIndex) => (
        <Row gap="small" key={rowIndex}>
          {row.map(key => {
            const isFunction = key.value === 'clear' || key.value === 'delete';
            return (
              <Pressable
                key={key.value}
                onPress={() => onPress(key.value)}
                style={({ pressed }) => [
                  styles.key,
                  isFunction ? styles.functionKey : undefined,
                  pressed ? styles.pressed : undefined,
                ]}
              >
                <Text
                  size={isFunction ? 'xs' : 'lg'}
                  weight={isFunction ? 'medium' : 'regular'}
                >
                  {key.label}
                </Text>
              </Pressable>
            );
          })}
        </Row>
      ))}
    </Column>
  );
}
