import React from 'react';
import { View } from 'react-native';
import { Icon, Loading } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
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

export function LoadingPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Size">
        <PreviewRow>
          <Loading size="small" text="Small" />
          <Loading size="normal" text="Normal" />
          <Loading size="large" text="Large" />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Direction">
        <PreviewRow>
          <Loading text="Horizontal" />
          <Loading text="Vertical" vertical />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Custom indicator">
        <View style={styles.stack}>
          <View style={styles.panel}>
            <Loading
              indicator={<Icon icon="notification" size="large" color="colorPrimary" />}
              text="Icon indicator"
            />
          </View>
          <View style={styles.panel}>
            <Loading
              indicator={<Icon icon="settings" size="large" color="colorTextDescription" />}
              text="Static indicator"
              vertical
            />
          </View>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
