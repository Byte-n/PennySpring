import React from 'react';
import { View } from 'react-native';
import { DataList, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

interface DemoItem {
  id: string;
  title: string;
  amount: string;
}

const FLAT_DATA: DemoItem[] = [
  { id: 'flat-1', title: 'Food', amount: '-26.00' },
  { id: 'flat-2', title: 'Transport', amount: '-8.00' },
  { id: 'flat-3', title: 'Salary', amount: '+5800.00' },
  { id: 'flat-4', title: 'Rent', amount: '-2000.00' },
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

export const dataListFlatListAndLoadStatesDemoTitle =
  'Flat list and load states';

export function DataListFlatListAndLoadStatesDemo() {
  const styles = useStyles();

  return (
    <>
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
    </>
  );
}

export default DataListFlatListAndLoadStatesDemo;
