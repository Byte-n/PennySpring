import React from 'react';
import { Column, Row, Skeleton, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  card: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    gap: token.marginSM,
    padding: token.padding,
  },
  row: {
    alignItems: 'center',
    gap: token.marginSM,
  },
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
  amount: {
    width: '20%',
  },
  statValue: {
    borderRadius: token.borderRadiusSM,
    height: token.lineHeightLG,
    width: '46%',
  },
  half: {
    flex: 1,
  },
}));

export const skeletonCompositionDemoTitle = '组合用法';

export function SkeletonCompositionDemo() {
  const styles = useStyles();

  return (
    <Column gap="large">
      <Column gap="small">
        <Text color="tertiary" size="xs">列表行：行高 64，与 List 行一致，加载完不跳</Text>
        <Column style={styles.card}>
          <Row style={styles.row}>
            <Skeleton shape="circle" />
            <Column style={styles.column}>
              <Skeleton style={styles.w60} />
              <Skeleton size="small" style={styles.w40} />
            </Column>
            <Skeleton size="small" style={styles.amount} />
          </Row>
          <Row style={styles.row}>
            <Skeleton shape="circle" />
            <Column style={styles.column}>
              <Skeleton style={styles.w80} />
              <Skeleton size="small" style={styles.w40} />
            </Column>
            <Skeleton size="small" style={styles.amount} />
          </Row>
        </Column>
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">卡片：标题、图表、正文、说明四层</Text>
        <Column style={styles.card}>
          <Row style={styles.row}>
            <Skeleton shape="circle" size="small" />
            <Skeleton style={styles.w40} />
          </Row>
          <Skeleton shape="rect" size="small" />
          <Skeleton />
          <Skeleton size="small" style={styles.w60} />
        </Column>
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">统计块：大数字用 28 高、8 圆角，与金额排印对齐</Text>
        <Row gap="small">
          <Skeleton style={styles.statValue} />
          <Skeleton size="small" style={styles.w30} />
        </Row>
        <Skeleton size="small" style={styles.w80} />
        <Row gap="small">
          <Skeleton shape="rect" size="small" style={styles.half} />
          <Skeleton shape="rect" size="small" style={styles.half} />
        </Row>
      </Column>
    </Column>
  );
}

export default SkeletonCompositionDemo;
