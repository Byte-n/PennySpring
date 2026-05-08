import React from 'react';
import { Pressable, View } from 'react-native';
import { Drawer, Portal, PortalProvider, Text } from '@pennyspring/component';
import { DotsThreeIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from './PreviewScaffold';

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
  tabFrame: {
    gap: token.marginSM,
    padding: token.padding,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
  tabRow: {
    flexDirection: 'row',
    gap: token.marginXS,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.controlItemBgHover,
  },
  tabItemActive: {
    backgroundColor: token.controlItemBgActive,
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

export function TopTabNavigatorPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="TopTabNavigator">
        <View style={styles.tabFrame}>
          <View style={styles.tabRow}>
            <View style={[styles.tabItem, styles.tabItemActive]}>
              <Text weight="strong">Overview</Text>
            </View>
            <View style={styles.tabItem}>
              <Text color="secondary">Details</Text>
            </View>
            <View style={styles.tabItem}>
              <Text color="secondary">History</Text>
            </View>
          </View>
          <Text color="secondary">Registered preview shows the tab layout language without nesting another navigator.</Text>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}

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
          <DotsThreeIcon color={token.colorIcon} size={token.fontSizeHeading3} />
        </Pressable>
      </PreviewSection>
    </PreviewScaffold>
  );
}
