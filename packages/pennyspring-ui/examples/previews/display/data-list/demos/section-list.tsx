import React from 'react';
import { View } from 'react-native';
import { DataList, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { DataListSection } from '@pennyspring/ui';

interface DemoItem {
  id: string;
  title: string;
  amount: string;
}

interface DemoSection extends DataListSection<DemoItem> {
  title: string;
}

const SECTION_DATA: DemoSection[] = [
  {
    key: 'today',
    title: 'Today',
    data: [
      { id: 'today-1', title: 'Coffee', amount: '-18.00' },
      { id: 'today-2', title: 'Lunch', amount: '-42.00' },
    ],
  },
  {
    key: 'yesterday',
    title: 'Yesterday',
    data: [{ id: 'yesterday-1', title: 'Book', amount: '-69.00' }],
  },
];

const useStyles = createUseSheetStyle(token => ({
  card: {
    borderColor: token.colorSplit,
    borderWidth: token.lineWidth,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    overflow: 'hidden',
    minHeight: token.controlHeightLG * 4,
    maxHeight: token.controlHeightLG * 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
    borderBottomColor: token.colorSplit,
    borderBottomWidth: token.lineWidth,
  },
  sectionHeader: {
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
    backgroundColor: token.colorFillAlter,
  },
}));

export const dataListSectionListDemoTitle = 'Section list';

export function DataListSectionListDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.card}>
        <DataList.Section
          sections={SECTION_DATA}
          keyExtractor={item => item.id}
          hasMore={false}
          completeText="No more sections"
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text color="secondary" size="sm" weight="medium">
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text>{item.title}</Text>
              <Text weight="strong">{item.amount}</Text>
            </View>
          )}
        />
      </View>
    </>
  );
}

export default DataListSectionListDemo;
