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

export const listItemsDemoTitle = 'Items';

export function ListItemsDemo() {
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
      <List
        footer={<Text color="description">End</Text>}
        header={<Text weight="strong">Recent</Text>}
        items={items}
        style={styles.listBorder}
      />
    </>
  );
}

export default ListItemsDemo;
