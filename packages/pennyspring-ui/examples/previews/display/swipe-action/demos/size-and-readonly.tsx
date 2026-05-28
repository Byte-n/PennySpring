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

export const swipeActionSizeAndReadonlyDemoTitle = 'Size and readonly';

export function SwipeActionSizeAndReadonlyDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <SwipeAction
          size="small"
          rightActions={[{ key: 'delete', actionText: 'Delete' }]}
        >
          <SwipeRow title="Small" description="Compact row with right action" />
        </SwipeAction>
        <SwipeAction
          size="large"
          rightActions={[{ key: 'delete', actionText: 'Delete' }]}
        >
          <SwipeRow
            title="Large"
            description="Large row with larger action area"
          />
        </SwipeAction>
        <SwipeAction
          readonly
          rightActions={[{ key: 'delete', actionText: 'Delete' }]}
        >
          <SwipeRow
            title="Readonly"
            description="Swipe interaction is disabled"
          />
        </SwipeAction>
      </View>
    </>
  );
}

export default SwipeActionSizeAndReadonlyDemo;
