import React from 'react';
import { View } from 'react-native';
import { DataList, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

interface DemoItem {
  id: string;
  title: string;
  amount: string;
}

const EMPTY_DATA: DemoItem[] = [];

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

export const dataListLoadingAndEmptyFooterDemoTitle =
  'Loading and empty footer';

export function DataListLoadingAndEmptyFooterDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.card}>
        <DataList<DemoItem>
          data={EMPTY_DATA}
          keyExtractor={item => item.id}
          isLoadingMore
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
    </>
  );
}

export default DataListLoadingAndEmptyFooterDemo;
