import React, { type ReactNode } from 'react';
import { Column, Row } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const GAP_DIVISOR = 2;

interface AddRecordFieldFlexProps {
  children?: ReactNode;
}

interface AddRecordFieldFlexItemProps {
  children?: ReactNode;
}

const useStyles = createUseSheetStyle(token => ({
  root: {
    marginHorizontal: -token.marginSM / GAP_DIVISOR,
    marginVertical: -token.marginMD / GAP_DIVISOR,
  },
  item: {
    paddingHorizontal: token.marginSM / GAP_DIVISOR,
    paddingVertical: token.marginMD / GAP_DIVISOR,
    width: '50%',
  },
}));

function AddRecordFieldFlexRoot({ children }: AddRecordFieldFlexProps) {
  const styles = useStyles();

  return (
    <Row align="start" wrap style={styles.root}>
      {children}
    </Row>
  );
}

function AddRecordFieldFlexItem({ children }: AddRecordFieldFlexItemProps) {
  const styles = useStyles();

  return (
    <Column style={styles.item}>
      {children}
    </Column>
  );
}

export const AddRecordFieldFlex = Object.assign(AddRecordFieldFlexRoot, {
  Item: AddRecordFieldFlexItem,
});
