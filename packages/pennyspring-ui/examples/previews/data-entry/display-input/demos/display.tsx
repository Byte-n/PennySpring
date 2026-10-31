import React from 'react';
import { Column, DisplayInput, Row } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  row: {
    gap: token.paddingSM,
  },
}));

export function DisplayInputDisplayDemo() {
  const styles = useStyles();

  return (
    <Column style={styles.stack}>
      <DisplayInput
        display="block"
        labelText="Block display"
        valueText="Block 模式占据整行宽度"
      />
      <Row style={styles.row}>
        <DisplayInput
          display="inline"
          labelText="Inline 1"
          valueText="短值"
        />
        <DisplayInput
          display="inline"
          labelText="Inline 2"
          valueText="中等长度值"
        />
      </Row>
    </Column>
  );
}

export default DisplayInputDisplayDemo;
