import type { StyleProp, ViewStyle } from 'react-native';

export interface SpacerProps {
  size?: number;
  flex?: number;
  min?: number;
  max?: number;
  style?: StyleProp<ViewStyle>;
}
