import React from 'react';
import { View } from 'react-native';
import { Drawer, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  frame: {
    minHeight: token.controlHeightLG + token.controlHeightLG + token.controlHeightLG,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    overflow: 'hidden',
    backgroundColor: token.colorBgLayout,
  },
  drawerContent: {
    gap: token.marginSM,
  },
}));

export function DrawerPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Drawer">
        <View style={styles.frame}>
          <Drawer
            open
            onOpen={() => undefined}
            onClose={() => undefined}
            renderDrawerContent={() => (
              <View style={styles.drawerContent}>
                <Text color="heading" weight="strong">Drawer content</Text>
                <Text color="secondary">Navigation and filters can live here.</Text>
              </View>
            )}
          >
            <View style={styles.drawerContent}>
              <Text color="heading" weight="strong">Main content</Text>
              <Text color="secondary">Drawer is forced open for preview.</Text>
            </View>
          </Drawer>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
