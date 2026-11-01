import React from 'react';
import { Column, DisplayInput } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function DisplayInputValueTextDemo() {
  const styles = useStyles();

  return (
    <Column style={styles.stack}>
      <DisplayInput
        labelText="With valueText"
        valueText="通过 valueText 展示文本值"
      />
      <DisplayInput labelText="Empty valueText" valueText="" />
      <DisplayInput labelText="Number as child">{12345}</DisplayInput>
      <DisplayInput labelText="String as child">
        字符串作为 children
      </DisplayInput>
    </Column>
  );
}

export default DisplayInputValueTextDemo;
