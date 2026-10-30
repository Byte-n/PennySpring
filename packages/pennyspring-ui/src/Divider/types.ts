import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type DividerDirection = 'horizontal' | 'vertical';

export type DividerContentPosition = 'left' | 'center' | 'right';

export type DividerSpacing = ComponentSize | 'none';

export interface DividerStyles {
  content?: StyleProp<TextStyle>;
  line?: StyleProp<ViewStyle>;
}

export interface DividerProps {
  children?: ReactNode;
  contentPosition?: DividerContentPosition;
  direction?: DividerDirection;
  size?: ComponentSize;
  /**
   * 分隔线两侧（水平方向为上下，垂直方向为左右）的间距。
   * none 表示无间距；不传时跟随 size。
   */
  spacing?: DividerSpacing;
  style?: StyleProp<ViewStyle>;
  styles?: DividerStyles;
}
