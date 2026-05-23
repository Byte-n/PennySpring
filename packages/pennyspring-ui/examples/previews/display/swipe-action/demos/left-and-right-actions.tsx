import React from 'react';
import { View } from 'react-native';
import { SwipeAction, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  rowCard: {
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  rowTitle: {
    marginBottom: token.marginXXS,
  },
}));

interface SwipeRowProps {
  title: string;
  description: string;
}

function SwipeRow({ title, description }: SwipeRowProps) {
  const styles = useStyles();

  return (
    <View style={styles.rowCard}>
      <Text weight="strong" style={styles.rowTitle}>
        {title}
      </Text>
      <Text color="description" size="sm">
        {description}
      </Text>
    </View>
  );
}

export const swipeActionLeftAndRightActionsDemoTitle = 'Left and right actions';

export function SwipeActionLeftAndRightActionsDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <SwipeAction
          leftActions={[
            { key: 'pin', text: 'Pin', color: 'primary' },
            { key: 'done', text: 'Done', color: 'success' },
          ]}
          rightActions={[
            { key: 'more', text: 'More', color: 'weak' },
            { key: 'delete', text: 'Delete', color: 'danger' },
          ]}
        >
          <SwipeRow
            title="Weekly report"
            description="Swipe left or right to reveal actions"
          />
        </SwipeAction>
      </View>
    </>
  );
}

export default SwipeActionLeftAndRightActionsDemo;
