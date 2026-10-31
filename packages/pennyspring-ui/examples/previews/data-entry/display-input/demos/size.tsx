import React from 'react';
import { Column, DisplayInput } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function DisplayInputSizeDemo() {
  const styles = useStyles();

  return (
    <Column style={styles.stack}>
      <DisplayInput labelText="Small" size="small" valueText="小尺寸展示值" />
      <DisplayInput labelText="Small" size="small" />
      <DisplayInput
        labelText="Normal (default)"
        size="normal"
        valueText="默认尺寸展示值"
      />
      <DisplayInput labelText="Normal (default)" size="normal" />
      <DisplayInput labelText="Large" size="large" valueText="大尺寸展示值" />
      <DisplayInput labelText="Large" size="large" />
    </Column>
  );
}

export default DisplayInputSizeDemo;
