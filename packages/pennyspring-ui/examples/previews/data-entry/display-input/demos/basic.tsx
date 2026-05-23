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

export const displayInputBasicDemoTitle = 'Basic';

export function DisplayInputBasicDemo() {
  const styles = useStyles();
  const [pressedValue, setPressedValue] = React.useState('未点击');
  const inlineValues = React.useMemo(
    () => ['短文本', '中等长度文本示例', '这是一个更长一点的内联展示文本'],
    [],
  );
  const [inlineValueIndex, _setInlineValueIndex] = React.useState(0);

  return (
    <>
      <Column style={styles.stack}>
        <DisplayInput
          label="Block (default)"
          onPress={() => setPressedValue('点击了 Block')}
          placeholder="请选择账户"
          valueText="现金账户"
        />
        <DisplayInput
          display="inline"
          label="Inline"
          onPress={() => setPressedValue('点击了 Inline')}
          valueText={inlineValues[inlineValueIndex]}
        />
        <Text color="description" size="sm">
          最近一次点击: {pressedValue}
        </Text>
      </Column>
    </>
  );
}

export default DisplayInputBasicDemo;
