import type { ReactNode } from 'react';
import type {
  FlatListProps,
  SectionListProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export interface DataListStyles {
  footer?: StyleProp<ViewStyle>;
  loadingMore?: StyleProp<ViewStyle>;
  loadingMoreText?: StyleProp<TextStyle>;
  complete?: StyleProp<ViewStyle>;
  completeText?: StyleProp<TextStyle>;
}

export interface DataListLoadMoreProps {
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  loadMoreThreshold?: number;
  loadingMoreText?: string;
  loadingMore?: ReactNode | null;
  /** @deprecated use loadingMore */
  loadingMoreContent?: ReactNode;
  completeText?: string;
  complete?: ReactNode;
}

export interface DataListRefreshProps {
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
}

export interface DataListProps<ItemT>
  extends Omit<
      FlatListProps<ItemT>,
      | 'style'
      | 'onEndReached'
      | 'onEndReachedThreshold'
      | 'refreshing'
      | 'onRefresh'
      | 'ListFooterComponent'
    >,
    DataListLoadMoreProps,
    DataListRefreshProps {
  size?: ComponentSize;
  style?: StyleProp<ViewStyle>;
  styles?: DataListStyles;
  footer?: ReactNode;
  onEndReached?: FlatListProps<ItemT>['onEndReached'];
}

export interface DataListSection<ItemT> {
  key: string;
  data: ItemT[];
}

export interface DataListSectionProps<ItemT, SectionT extends DataListSection<ItemT>>
  extends Omit<
      SectionListProps<ItemT, SectionT>,
      | 'style'
      | 'onEndReached'
      | 'onEndReachedThreshold'
      | 'refreshing'
      | 'onRefresh'
      | 'ListFooterComponent'
    >,
    DataListLoadMoreProps,
    DataListRefreshProps {
  size?: ComponentSize;
  style?: StyleProp<ViewStyle>;
  styles?: DataListStyles;
  footer?: ReactNode;
  onEndReached?: SectionListProps<ItemT, SectionT>['onEndReached'];
}

export interface DataListComponent {
  <ItemT>(props: DataListProps<ItemT>): ReactNode;
  Section: <ItemT, SectionT extends DataListSection<ItemT>>(
    props: DataListSectionProps<ItemT, SectionT>,
  ) => ReactNode;
}
