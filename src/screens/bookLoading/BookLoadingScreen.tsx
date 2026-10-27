import React from 'react';
import { Column, Loading } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
    justifyContent: 'center',
    alignItems: 'center',
    gap: token.marginLG,
  },
}));

export function BookLoadingScreen() {
  const styles = useStyles();

  return (
    <Column style={styles.container}>
      <Loading
        variant="block"
        text="正在加载账本数据"
        description="首次打开账本可能需要几秒"
      />
    </Column>
  );
}
