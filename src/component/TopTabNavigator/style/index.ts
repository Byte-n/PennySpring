import { createUseSheetStyle } from '@pennyspring/ui';

export const useHeaderBarStyles = createUseSheetStyle((token) => ({
  container: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorSplit,
    borderBottomWidth: token.lineWidth,
    flexDirection: 'row',
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.paddingMD / 4,
    gap: token.paddingContentHorizontal,
  },
  leftActions: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  center: {
    alignItems: 'stretch',
    flex: 2,
    justifyContent: 'center',
  },
  rightActions: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    minHeight: token.controlHeightLG,
  },
  tabBarLabel: {
    fontFamily: token.fontFamily,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
}));

export const useTopTabNavigatorStyles = createUseSheetStyle((token) => ({
  sceneContainer: {
    backgroundColor: token.colorBgLayout,
  },
}));
