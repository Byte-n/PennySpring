import type React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface PageStyles {
  container?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  left?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  right?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
}

export interface PageProps {
  title?: React.ReactNode;
  backButtonIcon?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  onBack?: () => void;
  styles?: PageStyles;
}
