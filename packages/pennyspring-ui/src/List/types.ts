import type { ReactNode } from 'react';
import type { FlatListProps, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export interface ListStyles {
  header?: StyleProp<ViewStyle>;
  footer?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
  loading?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  groupHeader?: StyleProp<ViewStyle>;
}

export interface ListItemData {
  left?: ReactNode;
  titleText?: string;
  title?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface ListProps<ItemT = ListItemData>
  extends Omit<FlatListProps<ItemT>, 'data' | 'renderItem' | 'ListHeaderComponent' | 'ListFooterComponent' | 'ListEmptyComponent'> {
  size?: ComponentSize;
  data?: readonly ItemT[] | null;
  renderItem?: NonNullable<FlatListProps<ItemT>['renderItem']>;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  loadingContent?: ReactNode;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  loadMoreThreshold?: number;
  completeText?: string;
  collapsible?: boolean;
  title?: ReactNode;
  titleText?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  styles?: ListStyles;
}
