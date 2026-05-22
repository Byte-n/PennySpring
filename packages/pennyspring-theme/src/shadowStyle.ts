import type { ViewStyle } from 'react-native';
import type { ShadowToken } from './types';

export function toShadowStyle(shadow: ShadowToken): ViewStyle {
  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
    elevation: shadow.elevation,
  } as ViewStyle;
}
