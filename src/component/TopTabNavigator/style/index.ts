import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';

export const useSegmentedControlStyles = createUseSheetStyle((token) => ({
  container: {
    alignSelf: 'center',
  },
  track: {
    backgroundColor: token.colorBgLayout,
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    minHeight: token.controlHeightSM,
    padding: token.paddingXXS,
    position: 'relative',
  },
  indicator: {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusSM,
    bottom: token.paddingXXS,
    left: token.paddingXXS,
    position: 'absolute',
    top: token.paddingXXS,
    ...toShadowStyle(token.boxShadowTertiary),
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: token.controlHeightSM,
    paddingHorizontal: token.paddingSM,
    position: 'relative',
    zIndex: token.zIndexBase + 1,
  },
  label: {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
  },
  activeLabel: {
    color: token.colorText,
    fontWeight: String(token.fontWeightSemiBold) as TextStyle['fontWeight'],
  },
  inactiveLabel: {
    color: token.colorTextTertiary,
  },
}));

export const useHeaderBarStyles = createUseSheetStyle((token) => ({
  container: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorSplit,
    borderBottomWidth: token.lineWidth,
    flexDirection: 'row',
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.paddingMD / 4,
    paddingVertical: token.paddingMD / 2,
    gap: token.paddingContentHorizontal
  },
  leftActions: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  center: {
    alignItems: 'center',
    flex: 2,
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
}));
