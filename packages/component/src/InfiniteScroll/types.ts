import type { ReactNode } from 'react';
import type { FlatListProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type InfiniteScrollSize = ComponentSize;

export interface InfiniteScrollStyles {
  footer?: StyleProp<ViewStyle>;
  loading?: StyleProp<ViewStyle>;
  loadingText?: StyleProp<TextStyle>;
  complete?: StyleProp<ViewStyle>;
  completeText?: StyleProp<TextStyle>;
}

export interface InfiniteScrollProps<ItemT>
  extends Omit<FlatListProps<ItemT>, 'ListFooterComponent' | 'onEndReached' | 'onEndReachedThreshold' | 'style'> {
  size?: InfiniteScrollSize;
  hasMore?: boolean;
  loading?: boolean;
  threshold?: number;
  loadMore: () => void | Promise<void>;
  loadingContent?: ReactNode;
  loadingText?: string;
  complete?: ReactNode;
  completeText?: string;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: InfiniteScrollStyles;
  onEndReached?: FlatListProps<ItemT>['onEndReached'];
}
