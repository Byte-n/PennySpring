import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type ListCollapseSize = ComponentSize;

export interface ListCollapseStyles {
  header?: StyleProp<ViewStyle>;
  headerPressed?: StyleProp<ViewStyle>;
  headerExpanded?: StyleProp<ViewStyle>;
  headerDisabled?: StyleProp<ViewStyle>;
  left?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  summary?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  contentLoading?: StyleProp<ViewStyle>;
}

export interface ListCollapseProps {
  size?: ListCollapseSize;
  title?: ReactNode;
  left?: ReactNode;
  summary?: ReactNode;
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
