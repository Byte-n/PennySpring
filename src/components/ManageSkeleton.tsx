import React from 'react';
import { Column, Row, Skeleton } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const DEFAULT_ROW_COUNT = 3;

export interface ManageSkeletonProps {
  rows?: number;
  showHero?: boolean;
}

const useStyles = createUseSheetStyle(token => ({
  content: {
    gap: token.marginMD,
  },
  hero: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    gap: token.marginSM,
    padding: token.padding,
  },
  heroLabel: {
    borderRadius: token.borderRadiusXS,
    height: token.paddingXS,
    width: '35%',
  },
  heroAmount: {
    borderRadius: token.borderRadiusXS,
    height: token.fontSizeHeading2,
    width: '55%',
  },
  heroSplit: {
    gap: token.marginMD,
  },
  heroSplitItem: {
    borderRadius: token.borderRadiusXS,
    flex: 1,
    height: token.paddingXS,
  },
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginMD,
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  rowDivider: {
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
  },
  tile: {
    borderRadius: token.borderRadiusSM,
    height: token.controlHeightSM,
    width: token.controlHeightSM,
  },
  main: {
    flex: 1,
    gap: token.marginXS,
  },
  titleLine: {
    borderRadius: token.borderRadiusXS,
    height: token.paddingXS,
    width: '58%',
  },
  subtitleLine: {
    borderRadius: token.borderRadiusXS,
    height: token.paddingXXS,
    width: '38%',
  },
  amount: {
    borderRadius: token.borderRadiusXS,
    height: token.paddingXS,
    width: token.controlHeightSM,
  },
}));

export function ManageSkeleton({
  rows = DEFAULT_ROW_COUNT,
  showHero = false,
}: ManageSkeletonProps) {
  const styles = useStyles();
  const items = Array.from({ length: rows }, (_, index) => index);

  return (
    <Column style={styles.content}>
      {showHero ? (
        <Column style={styles.hero}>
          <Skeleton style={styles.heroLabel} />
          <Skeleton style={styles.heroAmount} />
          <Row style={styles.heroSplit}>
            <Skeleton style={styles.heroSplitItem} />
            <Skeleton style={styles.heroSplitItem} />
            <Skeleton style={styles.heroSplitItem} />
          </Row>
        </Column>
      ) : null}
      <Column style={styles.card}>
        {items.map(index => (
          <Row
            key={index}
            style={[styles.row, index > 0 && styles.rowDivider]}
          >
            <Skeleton shape="rect" style={styles.tile} />
            <Column style={styles.main}>
              <Skeleton style={styles.titleLine} />
              <Skeleton style={styles.subtitleLine} />
            </Column>
            <Skeleton style={styles.amount} />
          </Row>
        ))}
      </Column>
    </Column>
  );
}
