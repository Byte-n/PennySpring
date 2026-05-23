import React from 'react';
import { View } from 'react-native';
import { Avatar, List, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  listBorder: {
    borderTopWidth: token.lineWidth,
    borderBottomWidth: token.lineWidth,
    borderColor: token.colorSplit,
  },
  rowText: {
    alignItems: 'flex-end',
  },
}));

export const listStatesDemoTitle = 'States';

export function ListStatesDemo() {
  const styles = useStyles();
  const items = [
    {
      left: <Avatar size="small" text="FD" />,
      titleText: 'Food',
      descriptionText: 'Today 12:30',
      right: (
        <View style={styles.rowText}>
          <Text weight="strong">-24.00</Text>
          <Text color="description" size="sm">
            Done
          </Text>
        </View>
      ),
      selected: true,
    },
    {
      left: <Avatar size="small" text="TR" />,
      titleText: 'Transport',
      descriptionText: 'Today 08:10',
      right: <Text weight="strong">-6.00</Text>,
    },
    {
      disabled: true,
      titleText: 'Disabled item',
      descriptionText: 'Unavailable action',
    },
  ];

  return (
    <>
      <View style={styles.stack}>
        <List
          empty={<Text color="description">No records</Text>}
          style={styles.listBorder}
        />
        <List loading loadingText="Loading records" style={styles.listBorder} />
        <List
          loading
          loadingContent={
            <Text color="secondary">Loading content by custom node</Text>
          }
          style={styles.listBorder}
        />
        <List
          header={<Text weight="strong">Render item</Text>}
          footer={<Text color="description">Custom footer</Text>}
          items={items}
          renderItem={(item, index) => (
            <View style={styles.rowText}>
              <Text weight="strong">
                {item.titleText ?? `Item ${index + 1}`}
              </Text>
              <Text color="description" size="sm">
                custom row #{index + 1}
              </Text>
            </View>
          )}
          style={styles.listBorder}
        />
      </View>
    </>
  );
}

export default ListStatesDemo;
