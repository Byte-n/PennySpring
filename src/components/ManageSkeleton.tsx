import React from 'react';
import { Column, Row, Skeleton } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

const DEFAULT_ROW_COUNT = 3;

export interface ManageSkeletonProps {
  rows?: number;
  showHero?: boolean;
}

const useStyles = createUseSheetStyle(token => ({
  hero: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    padding: token.padding,
  },
  heroSplitItem: {
    flex: 1,
  },
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    overflow: 'hidden',
  },
  row: {
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  rowDivider: {
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
  },
  main: {
    flex: 1,
  },
}));

export function ManageSkeleton({
  rows = DEFAULT_ROW_COUNT,
  showHero = false,
}: ManageSkeletonProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const items = Array.from({ length: rows }, (_, index) => index);

  return (
    <Column gap={token.marginMD}>
      {showHero ? (
        <Column style={styles.hero} gap="normal">
          <Skeleton
            borderRadius={token.borderRadiusXS}
            height={token.paddingXS}
            width="35%"
          />
          <Skeleton
            borderRadius={token.borderRadiusXS}
            height={token.fontSizeHeading2}
            width="55%"
          />
          <Row gap={token.marginMD}>
            <Skeleton
              borderRadius={token.borderRadiusXS}
              height={token.paddingXS}
              style={styles.heroSplitItem}
            />
            <Skeleton
              borderRadius={token.borderRadiusXS}
              height={token.paddingXS}
              style={styles.heroSplitItem}
            />
            <Skeleton
              borderRadius={token.borderRadiusXS}
              height={token.paddingXS}
              style={styles.heroSplitItem}
            />
          </Row>
        </Column>
      ) : null}
      <Column style={styles.card}>
        {items.map(index => (
          <Row
            key={index}
            style={[styles.row, index > 0 && styles.rowDivider]} gap={token.marginMD} align="center"
          >
            <Skeleton
              borderRadius={token.borderRadiusSM}
              height={token.controlHeightSM}
              shape="rect"
              width={token.controlHeightSM}
            />
            <Column style={styles.main} gap="small">
              <Skeleton
                borderRadius={token.borderRadiusXS}
                height={token.paddingXS}
                width="58%"
              />
              <Skeleton
                borderRadius={token.borderRadiusXS}
                height={token.paddingXXS}
                width="38%"
              />
            </Column>
            <Skeleton
              borderRadius={token.borderRadiusXS}
              height={token.paddingXS}
              width={token.controlHeightSM}
            />
          </Row>
        ))}
      </Column>
    </Column>
  );
}
