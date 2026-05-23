import React from 'react';
import { Column, DisplayInput, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  overflowVisible: {
    overflow: 'visible',
  },
  customValue: {
    color: token.colorSuccessText,
  },
}));

export const displayInputCustomValueNodeDemoTitle = 'Custom value node';

export function DisplayInputCustomValueNodeDemo() {
  const styles = useStyles();
  const [_pressedValue, setPressedValue] = React.useState('未点击');

  return (
    <>
      <Column style={styles.stack}>
        <DisplayInput
          label="value (ReactNode)"
          onPress={() => setPressedValue('点击了 自定义节点')}
          placeholder="这个占位不会显示"
        >
          <Text style={styles.customValue}>自定义节点值</Text>
        </DisplayInput>
        <DisplayInput
          display="inline"
          label="inline custom node"
          onPress={() => setPressedValue('点击了 行内自定义节点')}
        >
          <Text color="description" size="sm">
            行内节点值（可放图标+文本组合）
          </Text>
        </DisplayInput>
      </Column>
    </>
  );
}

export default DisplayInputCustomValueNodeDemo;
