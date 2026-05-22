import React from 'react';
import { View } from 'react-native';
import { BriefcaseIcon, ForkKnifeIcon, HouseIcon, WalletIcon } from 'phosphor-react-native';
import { Grid, Icon, Tabs, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { IconComponent } from '@pennyspring/ui';

interface IconCellItem {
  key: string;
  label: string;
  icon: IconComponent;
}

interface IconGridTabItem {
  value: string;
  label: string;
  items: readonly IconCellItem[];
}

const GRID_COLUMNS = 2;

const ICON_GRID_TABS: readonly IconGridTabItem[] = [
  {
    value: 'asset-classification',
    label: '资产分类',
    items: [
      { key: 'cash', label: '现金账户', icon: WalletIcon },
      { key: 'investment', label: '投资账户', icon: BriefcaseIcon },
    ],
  },
  {
    value: 'expense-type',
    label: '支出类型',
    items: [
      { key: 'dining', label: '餐饮', icon: ForkKnifeIcon },
      { key: 'housing', label: '住房', icon: HouseIcon },
    ],
  },
];

const ICON_GRID_TAB_ITEMS = ICON_GRID_TABS.map(({ label, value }) => ({
  label,
  value,
}));

const ICON_GRID_TAB_ITEM_MAP = new Map(
  ICON_GRID_TABS.map(tab => [tab.value, tab] as const),
);

const useStyles = createUseSheetStyle(token => ({
  cell: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusSM,
    borderWidth: token.lineWidth,
    gap: token.marginXXS,
    justifyContent: 'center',
    minHeight: token.controlHeightLG + token.controlHeight,
    paddingHorizontal: token.paddingSM,
  },
  gridFrame: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
  },
  valueText: {
    textAlign: 'center',
  },
}));

export function ClassificationAndIconsPreview() {
  const styles = useStyles();
  const { token } = useTheme();
  const defaultTabValue = ICON_GRID_TABS[0]?.value;

  return (
    <PreviewScaffold>
      <PreviewSection title="分类与图标（Web 文档预览）">
        <Tabs
          defaultValue={defaultTabValue}
          layout="scroll"
          items={ICON_GRID_TAB_ITEMS}
          renderContent={item => {
            const currentTab = ICON_GRID_TAB_ITEM_MAP.get(String(item.value));

            if (!currentTab) {
              return null;
            }

            return (
              <Grid columns={GRID_COLUMNS} gap="small" style={styles.gridFrame}>
                {currentTab.items.map(iconItem => (
                  <Grid.Item key={iconItem.key}>
                    <View style={styles.cell}>
                      <Icon
                        color={token.colorIcon}
                        icon={iconItem.icon}
                        size="large"
                      />
                      <Text
                        color="heading"
                        size="sm"
                        weight="medium"
                        style={styles.valueText}
                      >
                        {iconItem.label}
                      </Text>
                    </View>
                  </Grid.Item>
                ))}
              </Grid>
            );
          }}
        />
      </PreviewSection>
    </PreviewScaffold>
  );
}
