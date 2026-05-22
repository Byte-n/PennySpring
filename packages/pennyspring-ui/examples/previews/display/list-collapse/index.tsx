import React from 'react';
import { View } from 'react-native';
import { Avatar, List, ListCollapse, Text } from '@pennyspring/ui';
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
  const [controlledExpanded, setControlledExpanded] = React.useState(false);

  return (
    <PreviewScaffold>
      <PreviewSection title="Collapse">
        <View style={styles.stack}>
          <ListCollapse
            defaultExpanded
            left={<Avatar size="small" text="M" />}
            summary={<Text color="description">2 items</Text>}
            titleText="Expanded group"
            expandText="展开"
            collapseText="收起"
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
          <ListCollapse
            titleText="Collapsed group"
            expandText="查看明细"
            collapseText="隐藏明细"
          >
            <Text color="secondary">Collapsed content.</Text>
          </ListCollapse>
          <ListCollapse
            expanded={controlledExpanded}
            onExpandedChange={setControlledExpanded}
            summary={<Text color="description">{controlledExpanded ? 'Opened' : 'Closed'}</Text>}
            titleText="Controlled expand"
            expandText="Open"
            collapseText="Close"
          >
            <Text color="secondary">This panel is controlled by expanded/onExpandedChange.</Text>
          </ListCollapse>
          <ListCollapse
            readonly
            defaultExpanded
            summary={<Text color="description">Readonly</Text>}
            titleText="Readonly group"
            expandText="Open"
            collapseText="Close"
          >
            <Text color="secondary">Readonly keeps content stable and ignores header toggle.</Text>
          </ListCollapse>
          <ListCollapse
            loading
            defaultExpanded
            summary={<Text color="description">Loading</Text>}
            titleText="Loading group"
            expandText="Open"
            collapseText="Close"
          >
            <Text color="secondary">Loading style applies on expanded content.</Text>
          </ListCollapse>
          <ListCollapse
            defaultExpanded
            indicator={<Text color="heading">Custom</Text>}
            summary={<Text color="description">Override indicator</Text>}
            titleText="Custom indicator"
          >
            <Text color="secondary">Custom indicator node replaces expand/collapse text.</Text>
          </ListCollapse>
          <ListCollapse
            disabled
            titleText="Disabled group"
            summary={<Text color="description">Locked</Text>}
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
