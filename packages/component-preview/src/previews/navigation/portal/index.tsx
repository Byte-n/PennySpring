import React from 'react';
import { Pressable, View } from 'react-native';
import { Portal, PortalProvider, Text } from '@pennyspring/component';
import { DotsThreeIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  portalRoot: {
    minHeight: token.controlHeightLG + token.controlHeightLG,
    justifyContent: 'center',
    padding: token.padding,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
  floating: {
    alignSelf: 'flex-end',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgElevated,
  },
}));

export function PortalPreview() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="Portal">
        <PortalProvider>
          <View style={styles.portalRoot}>
            <Text color="heading" weight="strong">Provider content</Text>
            <Text color="secondary">Portal children are mounted after provider children.</Text>
            <Portal>
              <View style={styles.floating}>
                <Text>Portaled content</Text>
              </View>
            </Portal>
          </View>
        </PortalProvider>
      </PreviewSection>

      <PreviewSection title="Trigger shape">
        <Pressable accessibilityLabel="More actions" accessibilityRole="button">
          <DotsThreeIcon color={token.colorIcon} />
        </Pressable>
      </PreviewSection>
    </PreviewScaffold>
  );
}
