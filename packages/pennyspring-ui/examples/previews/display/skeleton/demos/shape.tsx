import React from 'react';
import { Column, Row, Skeleton, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  column: {
    flex: 1,
    gap: token.marginXS,
  },
  w30: {
    width: '30%',
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

export const skeletonShapeDemoTitle = '形状与尺寸';

export function SkeletonShapeDemo() {
  const styles = useStyles();

  return (
    <Column gap="large">
      <Column gap="small">
        <Text color="tertiary" size="xs">line · 12 / 16 / 20，圆角 4 / 6 / 8</Text>
        <Skeleton size="small" />
        <Skeleton />
        <Skeleton size="large" />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">circle · 32 / 40 / 48，只用于头像位</Text>
        <Row gap="small">
          <Skeleton shape="circle" size="small" />
          <Column style={styles.column}>
            <Skeleton size="small" />
            <Skeleton size="small" style={styles.w60} />
          </Column>
        </Row>
        <Row gap="small">
          <Skeleton shape="circle" />
          <Column style={styles.column}>
            <Skeleton />
            <Skeleton size="small" style={styles.w40} />
          </Column>
        </Row>
        <Row gap="small">
          <Skeleton shape="circle" size="large" />
          <Column style={styles.column}>
            <Skeleton />
            <Skeleton size="small" style={styles.w30} />
          </Column>
        </Row>
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">rect · 48 / 64 / 80，圆角 12 与 Card 对齐</Text>
        <Skeleton shape="rect" size="small" />
        <Skeleton shape="rect" />
        <Skeleton shape="rect" size="large" />
      </Column>
      <Text color="tertiary" size="xs">
        宽度百分比取 30 / 40 / 60 / 80 / 100；骨架高度必须等于真实行高
      </Text>
      <Skeleton style={styles.w80} />
    </Column>
  );
}

export default SkeletonShapeDemo;
