import React from 'react';
import { View } from 'react-native';
import { Space, Button, Portal, PortalProvider, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

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

export function PortalMountOnlyDemo() {
  const styles = useStyles();
  const [showPortal, setShowPortal] = React.useState(false);

  return (
    <>
      <Space align="center" gap="large" wrap>
        <Button
          type={showPortal ? 'primary' : 'default'}
          onPress={() => {
            setShowPortal(current => !current);
          }}
        >
          {showPortal ? 'Unmount portal content' : 'Mount portal content'}
        </Button>
      </Space>
      <PortalProvider>
        <View style={styles.mountHost}>
          <Text color="heading" weight="strong">
            Provider content
          </Text>
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
    </>
  );
}

export default PortalMountOnlyDemo;
