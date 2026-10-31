import React from 'react';
import { Column, List, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

import { getPhosphorIconComponent } from '../../../../../constants/typeIconTree';
import { formatMoney } from '../analysisData';
import type { TopExpenseView } from '../analysisData';

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const ICON_BOX_SIZE = 32;
const ICON_SIZE = 18;

interface TopExpenseListProps {
  items: readonly TopExpenseView[];
}

const useStyles = createUseSheetStyle(token => ({
  list: {
    gap: token.marginSM,
  },
  date: {
    width: token.sizeXXL,
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorFillQuaternary,
  },
  main: {
    flex: 1,
  },
}));

export function TopExpenseList({ items }: TopExpenseListProps) {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <List
      data={items}
      keyExtractor={item => String(item.record.id)}
      scrollEnabled={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const date = new Date(item.record.recordTime);
        const IconComponent = item.typeIcon
          ? getPhosphorIconComponent(item.typeIcon)
          : null;
        return (
          <Row gap="small" align="center">
            <Column style={styles.date} align="start">
              <Text size="xs" weight="medium" color="secondary" numberOfLines={1}>
                {`${date.getMonth() + 1}/${date.getDate()}`}
              </Text>
              <Text size="xs" color="tertiary">
                {WEEKDAY_LABELS[date.getDay()]}
              </Text>
            </Column>
            <Column style={styles.iconBox} align="center" justify="center">
              {IconComponent ? (
                <IconComponent color={token.colorTextSecondary} size={ICON_SIZE} />
              ) : null}
            </Column>
            <Column style={styles.main} gap={token.marginXXS}>
              <Text size="sm" numberOfLines={1}>
                {item.title}
              </Text>
              <Text size="xs" color="tertiary" numberOfLines={1}>
                {item.assetName
                  ? `${item.typeName} · ${item.assetName}`
                  : item.typeName}
              </Text>
            </Column>
            <Column align="end">
              <Text size="sm" weight="medium" color="error">
                {`−${formatMoney(item.amount)}`}
              </Text>
            </Column>
          </Row>
        );
      }}
    />
  );
}
