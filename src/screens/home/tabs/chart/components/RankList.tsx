import React from 'react';
import { Pressable } from 'react-native';
import { Column, Icon, List, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

import { formatMoney, formatPercent, formatSignedMoney } from '../analysisData';
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
  listHeader: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderBottomWidth: 0,
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
  },
  nameText: {
    flexShrink: 1,
  },
  percent: {
    width: token.sizeXL,
  },
  delta: {
    width: token.sizeXXL,
  },
  chevron: {
    width: token.sizeMD,
  },
  header: {
    paddingHorizontal: token.paddingXXS,
    paddingBottom: token.paddingXS,
  },
  headerDot: {
    width: token.sizeXS,
  },
  headerName: {
    flex: 1,
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
  const { token } = useTheme();
  const styles = useStyles();

  return (
    <List
      data={items}
      keyExtractor={item => item.key}
      scrollEnabled={false}
      header={
        showHeader ? (
          <Row style={styles.header} gap="small" align="center">
            <Column style={styles.headerDot} />
            <Column style={styles.headerName}>
              <Text size="xs" color="tertiary">
                {nameHeader}
              </Text>
            </Column>
            <Column style={styles.percent} align="end">
              <Text size="xs" color="tertiary">
                占比
              </Text>
            </Column>
            {showDelta ? (
              <Column style={styles.delta} align="end">
                <Text size="xs" color="tertiary">
                  较上月
                </Text>
              </Column>
            ) : null}
            <Column align="end">
              <Text size="xs" color="tertiary">
                金额
              </Text>
            </Column>
            <Column style={styles.chevron} align="end" />
          </Row>
        ) : undefined
      }
      styles={{ header: styles.listHeader }}
      renderItem={({ item, index }) => {
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
            <Row align="center" gap={token.marginXXS} style={styles.name}>
              <Text size="sm" numberOfLines={1} style={styles.nameText}>
                {item.name}
              </Text>
              {showCount ? (
                <Text size="xs" color="tertiary">
                  {item.count} 笔
                </Text>
              ) : null}
            </Row>
            <Column style={styles.percent} align="end">
              <Text size="xs" color="tertiary">
                {formatPercent(item.percent)}
              </Text>
            </Column>
            {showDelta ? (
              <Column style={styles.delta} align="end">
                <Text size="xs" weight="medium" color={deltaColor}>
                  {item.delta === null ? '—' : formatSignedMoney(item.delta)}
                </Text>
              </Column>
            ) : null}
            <Column align="end">
              <Text size="sm" weight="medium">
                {formatMoney(item.amount)}
              </Text>
            </Column>
            <Column style={styles.chevron} align="end">
              {item.drillable ? (
                <Icon icon="caret-right" size="small" color="tertiary" />
              ) : null}
            </Column>
          </Pressable>
        );
      }}
    />
  );
}
