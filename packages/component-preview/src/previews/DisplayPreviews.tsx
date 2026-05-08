import React from 'react';
import { View } from 'react-native';
import { Avatar, Card, List, ListCollapse, ListGroup, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from './PreviewScaffold';

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

export function CardPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Variants">
        <View style={styles.stack}>
          <Card title="Plain card" extra={<Text color="description">Extra</Text>}>
            <Text color="secondary">Default container with header, body and extra content.</Text>
          </Card>
          <Card variant="elevated" title="Elevated card" footer={<Text color="description">Footer</Text>}>
            <Text color="secondary">Elevated variant for higher layer content.</Text>
          </Card>
          <Card variant="summary" title="Summary">
            <Text color="heading" size="h3" weight="strong">
              12,840.00
            </Text>
          </Card>
        </View>
      </PreviewSection>

      <PreviewSection title="State">
        <View style={styles.stack}>
          <Card onPress={() => undefined} title="Pressable">
            <Text color="secondary">Tap feedback is owned by Card.</Text>
          </Card>
          <Card loading loadingNode={<Text color="description">Loading...</Text>} title="Loading">
            <Text>Hidden while loading.</Text>
          </Card>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}

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

export function ListGroupPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Grouped list">
        <ListGroup
          divider="inset"
          footer={<Text color="description">Group footer</Text>}
          summary={<Text color="description">3 items</Text>}
          title="May 7"
          style={styles.listBorder}
        >
          <List.Item title="Coffee" right={<Text>-18.00</Text>} />
          <List.Item title="Groceries" right={<Text>-128.00</Text>} />
          <List.Item title="Refund" right={<Text>+36.00</Text>} />
        </ListGroup>
      </PreviewSection>

      <PreviewSection title="Empty">
        <ListGroup empty={<Text color="description">No items in this group</Text>} title="Empty group" style={styles.listBorder} />
      </PreviewSection>
    </PreviewScaffold>
  );
}

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
            title="Expanded group"
          >
            <List divider="inset" style={styles.listBorder}>
              <List.Item title="Item A" right={<Text>12.00</Text>} />
              <List.Item title="Item B" right={<Text>24.00</Text>} />
            </List>
          </ListCollapse>
          <ListCollapse title="Collapsed group">
            <Text color="secondary">Collapsed content.</Text>
          </ListCollapse>
          <ListCollapse disabled title="Disabled group" summary={<Text color="description">Locked</Text>} />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
