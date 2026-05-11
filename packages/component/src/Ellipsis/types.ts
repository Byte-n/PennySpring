import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type EllipsisDirection = 'start' | 'end' | 'middle';

export type EllipsisSize = 'small' | 'normal' | 'large';

export interface EllipsisProps {
  /** The text content to display */
  content: string;
  /** Truncation direction @default 'end' */
  direction?: EllipsisDirection;
  /** Number of visible lines before truncation @default 1 */
  rows?: number;
  /** Text for the expand action */
  expandText?: string;
  /** Text for the collapse action */
  collapseText?: string;
  /** Default expanded state (uncontrolled) @default false */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpand?: (expanded: boolean) => void;
  /** Size of the component @default 'normal' */
  size?: EllipsisSize;
  /** Custom styles for internal elements */
  styles?: EllipsisStyles;
  /** Root container style */
  style?: StyleProp<ViewStyle>;
  /** Test ID for the root element */
  'data-testid'?: string;
}

export interface EllipsisStyles {
  /** Style for the expand/collapse action text */
  action?: StyleProp<TextStyle>;
}
