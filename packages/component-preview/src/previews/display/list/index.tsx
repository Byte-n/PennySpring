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

  return (
    <PreviewScaffold>
      <PreviewSection title="Items">
        <List header={<Text weight="strong">Recent</Text>} footer={<Text color="description">End</Text>} style={styles.listBorder}>
          <List.Item
            left={<Avatar size="small" text="FD" />}
            title="Food"
            description="Today 12:30"
            right={(
              <View style={styles.rowText}>
                <Text weight="strong">-24.00</Text>
                <Text color="description" size="sm">Done</Text>
              </View>
            )}
            selected
          />
          <List.Item
            left={<Avatar size="small" text="TR" />}
            title="Transport"
            description="Today 08:10"
            right={<Text weight="strong">-6.00</Text>}
          />
          <List.Item disabled title="Disabled item" description="Unavailable action" />
        </List>
      </PreviewSection>

      <PreviewSection title="States">
        <View style={styles.stack}>
          <List empty={<Text color="description">No records</Text>} style={styles.listBorder} />
          <List loading style={styles.listBorder} />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
