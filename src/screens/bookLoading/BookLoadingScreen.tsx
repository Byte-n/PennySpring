import React from 'react';
import { Column, Loading, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
    justifyContent: 'center',
    alignItems: 'center',
    gap: token.marginLG,
  },
  text: {
    fontSize: token.fontSizeLG,
    color: token.colorTextSecondary,
  },
}));

export function BookLoadingScreen() {
  const styles = useStyles();

  return (
    <Column style={styles.container}>
      <Loading size="large" />
      <Text style={styles.text}>正在加载账本数据...</Text>
    </Column>
  );
}
