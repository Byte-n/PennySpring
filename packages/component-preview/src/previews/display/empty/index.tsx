import React from 'react';
import { View } from 'react-native';
import { Button, Empty, Icon, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginLG,
  },
  panel: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
}));

export function EmptyPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <View style={styles.panel}>
            <Empty
              titleText="No data"
              descriptionText="No records are available now."
            />
          </View>
          <View style={styles.panel}>
            <Empty
              icon={<Icon icon="list" size={28} color="colorTextDescription" />}
              titleText="No tasks"
              descriptionText="Create your first item to get started."
              extra={<Button size="small">Create</Button>}
            />
          </View>
        </View>
      </PreviewSection>

      <PreviewSection title="Size">
        <View style={styles.stack}>
          <View style={styles.panel}>
            <Empty
              size="small"
              titleText="Small"
              descriptionText="Compact empty state."
            />
          </View>
          <View style={styles.panel}>
            <Empty
              size="normal"
              titleText="Normal"
              descriptionText="Default empty state."
            />
          </View>
          <View style={styles.panel}>
            <Empty
              size="large"
              title={<Text size="h4" weight="strong">Large</Text>}
              descriptionText="Expanded empty state with larger rhythm."
            />
          </View>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
