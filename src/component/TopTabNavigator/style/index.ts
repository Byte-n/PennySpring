import { createUseSheetStyle } from '@pennyspring/theme';

export const useHeaderBarStyles = createUseSheetStyle((token) => ({
  container: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorSplit,
    borderBottomWidth: token.lineWidth,
    flexDirection: 'row',
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.paddingMD / 4,
    gap: token.paddingContentHorizontal
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
}));

export const useTopTabNavigatorStyles = createUseSheetStyle((token) => ({
  sceneContainer: {
    backgroundColor: token.colorBgLayout,
  },
  tabBar: {
    borderWidth: 0,
    boxShadow: 'none',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
  },
}));
