import React from 'react';
import { Column, Row, Skeleton, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    gap: token.marginSM,
    padding: token.paddingSM,
  },
  column: {
    flex: 1,
    gap: token.marginXS,
  },
  w40: {
    width: '40%',
  },
  w60: {
    width: '60%',
  },
  w80: {
    width: '80%',
  },
}));

export const skeletonDarkDemoTitle = '深色对照';

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column style={styles.surface}>
      <Skeleton />
      <Skeleton style={styles.w80} />
      <Row gap="small">
        <Skeleton shape="circle" />
        <Column style={styles.column}>
          <Skeleton style={styles.w60} />
          <Skeleton size="small" style={styles.w40} />
        </Column>
      </Row>
    </Column>
  );
}

export function SkeletonDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="xs">
        深色底色 8% 白，高光 5% 白，只做轻微流动
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default SkeletonDarkDemo;
