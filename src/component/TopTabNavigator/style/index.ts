import { createUseSheetStyle } from '@pennyspring/ui';

export const useHeaderBarStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorSplit,
    borderBottomWidth: token.lineWidth,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: token.controlHeight,
    paddingHorizontal: token.paddingXS,
  },
  leftActions: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  rightActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
  },
  tabsRow: {
    height: token.controlHeight,
  },
  tabBar: {
    backgroundColor: token.colorBgContainer,
    borderWidth: 0,
    boxShadow: 'none',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
  },
  tabBarIndicator: {
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadiusSM,
    height: token.lineWidthBold,
  },
  tabBarItem: {
    minHeight: token.controlHeight,
  },
  tabBarLabel: {
    fontFamily: token.fontFamily,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
}));

export const useTopTabNavigatorStyles = createUseSheetStyle(token => ({
  sceneContainer: {
    backgroundColor: token.colorBgLayout,
  },
}));
