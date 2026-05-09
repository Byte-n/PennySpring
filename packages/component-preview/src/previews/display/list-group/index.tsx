import React from 'react';
import { List, ListGroup, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  listBorder: {
    borderTopWidth: token.lineWidth,
    borderBottomWidth: token.lineWidth,
    borderColor: token.colorSplit,
  },
}));

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
