import React from 'react';
import { Column, DisplayInput, Row } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const displayInputBasicDemoTitle = 'Basic';

export function DisplayInputBasicDemo() {
  const styles = useStyles();

  return (
    <>
      <Column style={styles.stack}>
        <DisplayInput
          display="block"
          labelText="Block (default)"
          valueText="现金账户"
        />
        <DisplayInput display="inline" labelText="Inline" valueText="短值" />
        <DisplayInput display="inline" labelText="Empty value" />
      </Column>
      <Row wrap style={styles.stack}>
        <DisplayInput
          display="block"
          labelText="Inline 1"
          valueText="现金账户"
        />
        <DisplayInput display="inline" labelText="Inline 2" valueText="短值" />
        <DisplayInput display="inline" labelText="Empty value" />
      </Row>
    </>
  );
}

export default DisplayInputBasicDemo;
