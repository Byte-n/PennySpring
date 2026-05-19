import React from 'react';
import { View } from 'react-native';
import { Button, Portal, PortalProvider, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  mountHost: {
    minHeight: token.controlHeightLG + token.controlHeightLG,
    justifyContent: 'center',
    padding: token.paddingSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    gap: token.marginXXS,
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
  const [showPortal, setShowPortal] = React.useState(false);

  return (
    <PreviewScaffold>
      <PreviewSection title="Mount only">
        <PreviewRow>
          <Button
            type={showPortal ? 'primary' : 'default'}
            onPress={() => {
              setShowPortal(current => !current);
            }}
          >
            {showPortal ? 'Unmount portal content' : 'Mount portal content'}
          </Button>
        </PreviewRow>
        <PortalProvider>
          <View style={styles.mountHost}>
            <Text color="heading" weight="strong">Provider content</Text>
            <Text color="secondary">Portal children mount at provider root.</Text>
            {showPortal ? (
              <Portal>
                <View style={styles.floating}>
                  <Text>Portaled content</Text>
                </View>
              </Portal>
            ) : null}
          </View>
        </PortalProvider>
      </PreviewSection>
    </PreviewScaffold>
  );
}
