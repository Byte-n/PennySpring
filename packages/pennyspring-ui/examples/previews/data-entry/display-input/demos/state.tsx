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

export const displayInputStateDemoTitle = 'State';

export function DisplayInputStateDemo() {
  const styles = useStyles();

  return (
    <>
      <Column style={styles.stack}>
        <DisplayInput labelText="Required" required placeholder="必填展示输入" />
        <DisplayInput disabled labelText="Disabled">
          禁用态
        </DisplayInput>
        <DisplayInput readonly labelText="Readonly" valueText="只读态" />
        <DisplayInput
          helperText="请确认展示值"
          labelText="Warning"
          status="warning"
          valueText="待确认状态"
        />
        <DisplayInput
          helperText="状态正常"
          labelText="Success"
          status="success"
          valueText="已确认状态"
        />
        <DisplayInput
          errorText="请选择有效值"
          labelText="Error"
          status="error"
          valueText="异常状态"
        />
      </Column>
    </>
  );
}

export default DisplayInputStateDemo;
