import React from 'react';
import { Column, List, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

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
  row: {
    gap: token.marginXS,
    alignItems: 'center',
  },
  date: {
    width: token.sizeXXL,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorFillQuaternary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    gap: token.marginXXS,
  },
  amount: {
    alignItems: 'flex-end',
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
          <Row style={styles.row}>
            <Column style={styles.date}>
              <Text size="xs" weight="medium" color="secondary" numberOfLines={1}>
                {`${date.getMonth() + 1}/${date.getDate()}`}
              </Text>
              <Text size="xs" color="tertiary">
                {WEEKDAY_LABELS[date.getDay()]}
              </Text>
            </Column>
            <Column style={styles.iconBox}>
              {IconComponent ? (
                <IconComponent color={token.colorTextSecondary} size={ICON_SIZE} />
              ) : null}
            </Column>
            <Column style={styles.main}>
              <Text size="sm" numberOfLines={1}>
                {item.title}
              </Text>
              <Text size="xs" color="tertiary" numberOfLines={1}>
                {item.assetName
                  ? `${item.typeName} · ${item.assetName}`
                  : item.typeName}
              </Text>
            </Column>
            <Column style={styles.amount}>
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
