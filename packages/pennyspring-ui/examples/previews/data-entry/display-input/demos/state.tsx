import React from 'react';
import { Column, DisplayInput } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const displayInputStateDemoTitle = 'State';

export function DisplayInputStateDemo() {
  const styles = useStyles();

  return (
    <Column style={styles.stack}>
      <DisplayInput disabled labelText="Disabled">
        禁用态
      </DisplayInput>
      <DisplayInput readonly labelText="Readonly" valueText="只读态" />
      <DisplayInput
        labelText="Warning"
        status="warning"
        valueText="待确认状态"
      />
      <DisplayInput
        labelText="Success"
        status="success"
        valueText="已确认状态"
      />
      <DisplayInput
        labelText="Error"
        status="error"
        valueText="异常状态"
      />
    </Column>
  );
}

export default DisplayInputStateDemo;
