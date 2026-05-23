import React from 'react';
import { Column, DisplayInput } from '@pennyspring/ui';
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

export const displayInputValueTextDemoTitle = 'Value text';

export function DisplayInputValueTextDemo() {
  const styles = useStyles();
  const [_pressedValue, setPressedValue] = React.useState('未点击');

  return (
    <>
      <Column style={styles.stack}>
        <DisplayInput
          label="valueText"
          onPress={() => setPressedValue('点击了 valueText')}
          placeholder="请选择"
          valueText="通过 valueText 展示文本值"
        />
        <DisplayInput
          label="placeholder fallback"
          onPress={() => setPressedValue('点击了 placeholder fallback')}
          placeholder="当未提供 value/valueText 时显示我"
        />
      </Column>
    </>
  );
}

export default DisplayInputValueTextDemo;
