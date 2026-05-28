import React from 'react';
import { View } from 'react-native';
import { Avatar, List, ListCollapse, Text } from '@pennyspring/ui';
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
}));

export const listCollapseCollapseDemoTitle = 'Collapse';

export function ListCollapseCollapseDemo() {
  const styles = useStyles();
  const [controlledExpanded, setControlledExpanded] = React.useState(false);

  return (
    <>
      <View style={styles.stack}>
        <ListCollapse
          defaultOpen
          left={<Avatar size="small" text="M" />}
          summaryText="2 items"
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
          open={controlledExpanded}
          onOpenChange={setControlledExpanded}
          summaryText={controlledExpanded ? 'Opened' : 'Closed'}
          titleText="Controlled expand"
          expandText="Open"
          collapseText="Close"
        >
          <Text color="secondary">
            This panel is controlled by open/onOpenChange.
          </Text>
        </ListCollapse>
        <ListCollapse
          readonly
          defaultOpen
          summaryText="Readonly"
          titleText="Readonly group"
          expandText="Open"
          collapseText="Close"
        >
          <Text color="secondary">
            Readonly keeps content stable and ignores header toggle.
          </Text>
        </ListCollapse>
        <ListCollapse
          loading
          defaultOpen
          summaryText="Loading"
          titleText="Loading group"
          expandText="Open"
          collapseText="Close"
        >
          <Text color="secondary">
            Loading style applies on expanded content.
          </Text>
        </ListCollapse>
        <ListCollapse
          defaultOpen
          indicator={<Text color="heading">Custom</Text>}
          summaryText="Override indicator"
          titleText="Custom indicator"
        >
          <Text color="secondary">
            Custom indicator node replaces expand/collapse text.
          </Text>
        </ListCollapse>
        <ListCollapse
          disabled
          titleText="Disabled group"
          summaryText="Locked"
        />
      </View>
    </>
  );
}

export default ListCollapseCollapseDemo;
