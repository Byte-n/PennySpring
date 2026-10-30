import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type ProgressStatus = 'default' | 'success' | 'error';

export interface ProgressBaseProps {
  percent?: number;
  size?: ComponentSize;
  status?: ProgressStatus;
}

export interface ProgressBarStyles {
  track?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  info?: StyleProp<TextStyle>;
}

export interface ProgressBarProps extends ProgressBaseProps {
  format?: (percent: number) => ReactNode;
  showInfo?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: ProgressBarStyles;
}

export interface ProgressCircleStyles {
  track?: StyleProp<ViewStyle>;
  mask?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  info?: StyleProp<TextStyle>;
}

export interface ProgressCircleProps extends ProgressBaseProps {
  format?: (percent: number) => ReactNode;
  showInfo?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: ProgressCircleStyles;
}

export interface ProgressComponent {
  (): null;
  Bar: (props: ProgressBarProps) => ReactNode;
  Circle: (props: ProgressCircleProps) => ReactNode;
}
