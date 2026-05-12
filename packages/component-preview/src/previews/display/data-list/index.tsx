import React from 'react';
import { View } from 'react-native';
import { DataList, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { DataListSection } from '@pennyspring/component';

interface DemoItem {
  id: string;
  title: string;
  amount: string;
}

interface DemoSection extends DataListSection<DemoItem> {
  title: string;
}

const FLAT_DATA: DemoItem[] = [
  { id: 'flat-1', title: 'Food', amount: '-26.00' },
  { id: 'flat-2', title: 'Transport', amount: '-8.00' },
  { id: 'flat-3', title: 'Salary', amount: '+5800.00' },
  { id: 'flat-4', title: 'Rent', amount: '-2000.00' },
];
const EMPTY_DATA: DemoItem[] = [];

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

export function DataListPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Flat list and load states">
        <View style={styles.card}>
          <DataList
            data={FLAT_DATA}
            keyExtractor={item => item.id}
            hasMore={false}
            completeText="All loaded"
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Text>{item.title}</Text>
                <Text weight="strong">{item.amount}</Text>
              </View>
            )}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Section list">
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
      </PreviewSection>

      <PreviewSection title="Loading and empty footer">
        <View style={styles.card}>
          <DataList<DemoItem>
            data={EMPTY_DATA}
            keyExtractor={item => item.id}
            loadingMore
            loadingMoreText="Loading more records..."
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Text>{item.title}</Text>
                <Text weight="strong">{item.amount}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.itemRow}>
                <Text color="description">No records yet</Text>
              </View>
            }
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
