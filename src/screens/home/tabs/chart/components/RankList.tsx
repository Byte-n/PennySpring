import React from 'react';
import { Pressable } from 'react-native';
import { Column, Icon, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

import {
  formatMoney,
  formatPercent,
  formatSignedMoney,
} from '../analysisData';
import { ColorDot } from './ColorDot';

export interface RankItem {
  key: string;
  name: string;
  amount: number;
  percent: number;
  count: number;
  delta: number | null;
  color: string;
  drillable: boolean;
}

interface RankListProps {
  items: readonly RankItem[];
  nameHeader?: string;
  showDelta?: boolean;
  showCount?: boolean;
  showHeader?: boolean;
  onPressItem?: (key: string) => void;
}

const useStyles = createUseSheetStyle(token => ({
  row: {
    minHeight: token.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXS,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
    paddingHorizontal: token.paddingXXS,
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  rowPressed: {
    backgroundColor: token.colorFillQuaternary,
  },
  name: {
    flex: 1,
    minWidth: 0,
    gap: token.marginXXS,
  },
  nameText: {
    flexShrink: 1,
  },
  percent: {
    width: token.sizeXL,
    alignItems: 'flex-end',
  },
  delta: {
    width: token.sizeXXL,
    alignItems: 'flex-end',
  },
  amount: {
    alignItems: 'flex-end',
  },
  chevron: {
    width: token.sizeMD,
    alignItems: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXS,
    paddingHorizontal: token.paddingXXS,
    paddingBottom: token.paddingXS,
  },
  headerDot: {
    width: token.sizeXS,
  },
  headerName: {
    flex: 1,
  },
  headerAmount: {
    alignItems: 'flex-end',
  },
}));

export function RankList({
  items,
  nameHeader = '分类',
  showDelta = true,
  showCount = true,
  showHeader = false,
  onPressItem,
}: RankListProps) {
  const styles = useStyles();

  return (
    <Column>
      {showHeader ? (
        <Row style={styles.header}>
          <Column style={styles.headerDot} />
          <Column style={styles.headerName}>
            <Text size="xs" color="tertiary">
              {nameHeader}
            </Text>
          </Column>
          <Column style={styles.percent}>
            <Text size="xs" color="tertiary">
              占比
            </Text>
          </Column>
          {showDelta ? (
            <Column style={styles.delta}>
              <Text size="xs" color="tertiary">
                较上月
              </Text>
            </Column>
          ) : null}
          <Column style={styles.headerAmount}>
            <Text size="xs" color="tertiary">
              金额
            </Text>
          </Column>
          <Column style={styles.chevron} />
        </Row>
      ) : null}
      {items.map((item, index) => {
        const deltaColor =
          item.delta === null
            ? 'tertiary'
            : item.delta > 0
              ? 'error'
              : item.delta < 0
                ? 'success'
                : 'tertiary';
        return (
          <Pressable
            key={item.key}
            disabled={!item.drillable}
            onPress={
              item.drillable && onPressItem
                ? () => onPressItem(item.key)
                : undefined
            }
            style={({ pressed }) => [
              styles.row,
              index === 0 ? styles.rowFirst : null,
              pressed && item.drillable ? styles.rowPressed : null,
            ]}
          >
            <ColorDot color={item.color} />
            <Row align="center" gap="small" style={styles.name}>
              <Text size="sm" numberOfLines={1} style={styles.nameText}>
                {item.name}
              </Text>
              {showCount ? (
                <Text size="xs" color="tertiary">
                  {item.count} 笔
                </Text>
              ) : null}
            </Row>
            <Column style={styles.percent}>
              <Text size="xs" color="tertiary">
                {formatPercent(item.percent)}
              </Text>
            </Column>
            {showDelta ? (
              <Column style={styles.delta}>
                <Text size="xs" weight="medium" color={deltaColor}>
                  {item.delta === null ? '—' : formatSignedMoney(item.delta)}
                </Text>
              </Column>
            ) : null}
            <Column style={styles.amount}>
              <Text size="sm" weight="medium">
                {formatMoney(item.amount)}
              </Text>
            </Column>
            <Column style={styles.chevron}>
              {item.drillable ? (
                <Icon icon="caret-right" size="small" color="tertiary" />
              ) : null}
            </Column>
          </Pressable>
        );
      })}
    </Column>
  );
}
