import React from 'react';
import { View } from 'react-native';
import { Avatar, List, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

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

export function ListPreview() {
  const styles = useStyles();
  const items = [
    {
      left: <Avatar size="small" text="FD" />,
      titleText: 'Food',
      descriptionText: 'Today 12:30',
      right: (
        <View style={styles.rowText}>
          <Text weight="strong">-24.00</Text>
          <Text color="description" size="sm">Done</Text>
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
    <PreviewScaffold>
      <PreviewSection title="Items">
        <List
          footer={<Text color="description">End</Text>}
          header={<Text weight="strong">Recent</Text>}
          items={items}
          style={styles.listBorder}
        />
      </PreviewSection>

      <PreviewSection title="States">
        <View style={styles.stack}>
          <List empty={<Text color="description">No records</Text>} style={styles.listBorder} />
          <List loading loadingText="Loading records" style={styles.listBorder} />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
