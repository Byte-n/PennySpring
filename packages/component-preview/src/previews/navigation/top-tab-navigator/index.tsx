import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
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
