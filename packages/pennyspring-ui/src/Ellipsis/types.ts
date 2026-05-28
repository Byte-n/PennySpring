import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type EllipsisDirection = 'start' | 'end' | 'middle';

import type { ComponentSize } from '../shares/types';

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
  /** Default open state (uncontrolled) @default false */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Size of the component @default 'normal' */
  size?: ComponentSize;
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
