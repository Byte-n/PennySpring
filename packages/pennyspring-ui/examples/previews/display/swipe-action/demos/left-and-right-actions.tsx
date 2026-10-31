import React from 'react';
import { View } from 'react-native';
import { SwipeAction, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

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

export function SwipeActionLeftAndRightActionsDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <SwipeAction
          leftActions={[
            { key: 'light', actionText: 'Light', color: 'light' },
            { key: 'weak', actionText: 'Weak', color: 'weak' },
            { key: 'pin', actionText: 'Pin', color: 'primary' },
            { key: 'done', actionText: 'Done', color: 'success' },
          ]}
          rightActions={[
            { key: 'warn', actionText: 'Warn', color: 'warning' },
            { key: 'delete', actionText: 'Delete', color: 'danger' },
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
