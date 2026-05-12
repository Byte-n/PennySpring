import React from 'react';
import { View } from 'react-native';
import { SwipeAction, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

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

export function SwipeActionPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Left and right actions">
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
            <SwipeRow title="Weekly report" description="Swipe left or right to reveal actions" />
          </SwipeAction>
        </View>
      </PreviewSection>

      <PreviewSection title="Size and readonly">
        <View style={styles.stack}>
          <SwipeAction size="small" rightActions={[{ key: 'delete', text: 'Delete' }]}>
            <SwipeRow title="Small" description="Compact row with right action" />
          </SwipeAction>
          <SwipeAction size="large" rightActions={[{ key: 'delete', text: 'Delete' }]}>
            <SwipeRow title="Large" description="Large row with larger action area" />
          </SwipeAction>
          <SwipeAction readonly rightActions={[{ key: 'delete', text: 'Delete' }]}>
            <SwipeRow title="Readonly" description="Swipe interaction is disabled" />
          </SwipeAction>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
