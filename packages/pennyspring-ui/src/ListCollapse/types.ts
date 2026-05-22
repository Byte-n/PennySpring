import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';


export interface ListCollapseStyles {
  header?: StyleProp<ViewStyle>;
  left?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  summary?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
}

export interface ListCollapseProps {
  size?: ComponentSize;
  titleText?: string;
  title?: ReactNode;
  left?: ReactNode;
  summary?: ReactNode;
  expandText?: string;
  collapseText?: string;
  indicator?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onHeaderPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: ListCollapseStyles;
}
