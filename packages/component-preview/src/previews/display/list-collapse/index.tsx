import React from 'react';
import { View } from 'react-native';
import { Avatar, List, ListCollapse, Text } from '@pennyspring/component';
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
}));

export function ListCollapsePreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Collapse">
        <View style={styles.stack}>
          <ListCollapse
            defaultExpanded
            left={<Avatar size="small" text="M" />}
            summary={<Text color="description">2 items</Text>}
            titleText="Expanded group"
          >
            <List
              divider="inset"
              items={[
                { titleText: 'Item A', right: <Text>12.00</Text> },
                { titleText: 'Item B', right: <Text>24.00</Text> },
              ]}
              style={styles.listBorder}
            />
          </ListCollapse>
          <ListCollapse titleText="Collapsed group">
            <Text color="secondary">Collapsed content.</Text>
          </ListCollapse>
          <ListCollapse
            disabled
            title="Disabled group"
            summary={<Text color="description">Locked</Text>}
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
