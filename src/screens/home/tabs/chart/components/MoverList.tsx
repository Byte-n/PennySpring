import React from 'react';
import { Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

import { formatPercent, formatSignedMoney } from '../analysisData';
import type { CategoryMover } from '../analysisData';

interface BarProps {
  ratio: number;
  color: string;
}

const useStyles = createUseSheetStyle(token => ({
  list: {
    gap: token.marginSM,
  },
  row: {
    gap: token.marginXXS,
  },
  tag: {
    paddingHorizontal: token.paddingXXS,
    paddingVertical: token.paddingXXS / 2,
    borderRadius: token.borderRadiusXS,
    backgroundColor: token.colorFillQuaternary,
  },
  track: {
    height: token.sizeXS,
    borderRadius: token.borderRadiusXS,
    backgroundColor: token.colorFillQuaternary,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  half: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
  },
  halfEnd: {
    justifyContent: 'flex-end',
  },
  mid: {
    width: token.lineWidth,
    height: '100%',
    backgroundColor: token.colorSplit,
  },
}));

const useBarStyles = createUseSheetStyle(
  (token, { ratio, color }: BarProps) => ({
    bar: {
      width: `${ratio * 100}%`,
      height: '100%',
      borderRadius: token.borderRadiusXS,
      backgroundColor: color,
    },
  }),
);

function Bar({ ratio, color }: BarProps) {
  const styles = useBarStyles({ ratio, color });
  return <Column style={styles.bar} />;
}

interface MoverListProps {
  movers: readonly CategoryMover[];
}

export function MoverList({ movers }: MoverListProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const maxAbs = Math.max(
    ...movers.map(mover => Math.abs(mover.delta)),
    1,
  );

  return (
    <Column style={styles.list}>
      {movers.map(mover => {
        const isUp = mover.delta > 0;
        const ratio = Math.abs(mover.delta) / maxAbs;
        const percentText =
          mover.percent === null ? '新增' : formatPercent(mover.percent);
        return (
          <Column key={mover.key} style={styles.row}>
            <Row align="center" justify="between">
              <Row align="center" gap="small">
                <Text size="sm">{mover.name}</Text>
                <Column style={styles.tag}>
                  <Text size="xs" color="tertiary">
                    {percentText}
                  </Text>
                </Column>
              </Row>
              <Text
                size="sm"
                weight="medium"
                color={isUp ? 'error' : mover.delta < 0 ? 'success' : 'tertiary'}
              >
                {formatSignedMoney(mover.delta)}
              </Text>
            </Row>
            <Row style={styles.track}>
              <Row style={[styles.half, styles.halfEnd]}>
                {!isUp ? (
                  <Bar ratio={ratio} color={token.colorSuccess} />
                ) : null}
              </Row>
              <Column style={styles.mid} />
              <Row style={styles.half}>
                {isUp ? (
                  <Bar ratio={ratio} color={token.colorWarning} />
                ) : null}
              </Row>
            </Row>
          </Column>
        );
      })}
    </Column>
  );
}
