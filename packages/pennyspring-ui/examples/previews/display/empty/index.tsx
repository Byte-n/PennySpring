import React from 'react';
import { View } from 'react-native';
import { Button, Empty, Icon, Text } from '@pennyspring/ui';
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
  textCenter: {
    textAlign: 'center',
  },
}));

export function EmptyPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <View style={styles.panel}>
            <Empty messageText="No data" />
          </View>
          <View style={styles.panel}>
            <Empty
              icon={<Icon icon="list" size={28} color="colorTextDescription" />}
              message={(
                <View>
                  <Text style={styles.textCenter}>No tasks</Text>
                  <Text style={styles.textCenter} color="secondary">
                    Create your first item to get started.
                  </Text>
                  <Button size="small">Create</Button>
                </View>
              )}
            />
          </View>
        </View>
      </PreviewSection>

      <PreviewSection title="Size">
        <View style={styles.stack}>
          <View style={styles.panel}>
            <Empty size="small" messageText="Small" />
          </View>
          <View style={styles.panel}>
            <Empty size="normal" messageText="Normal" />
          </View>
          <View style={styles.panel}>
            <Empty
              size="large"
              message={<Text size="h4" weight="strong">Large</Text>}
            />
          </View>
          <View style={styles.panel}>
            <Empty
              icon={<Icon icon="notification" size="large" color="colorPrimary" />}
              messageText="Custom icon with messageText"
            />
          </View>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
