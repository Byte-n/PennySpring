import type { ReactNode } from 'react';
import type { FlatListProps, GestureResponderEvent, ListRenderItemInfo, StyleProp, ViewStyle } from 'react-native';
import type { IconName } from '../Icon';
import type { ComponentSize } from '../shares/types';
import type { SwipeActionAction } from '../SwipeAction';

export interface ListItemSwipeActions {
  leftActions?: SwipeActionAction[];
  rightActions?: SwipeActionAction[];
  disabled?: boolean;
}

export interface ListStyles {
  header?: StyleProp<ViewStyle>;
  footer?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
  loading?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  groupHeader?: StyleProp<ViewStyle>;
}

export interface ListItemData {
  /** 稳定业务标识；可用于默认 key。 */
  value?: string | number;
  /** 行首图标，自动套 38 圆角底板；自定义节点请用 left。 */
  icon?: IconName;
  left?: ReactNode;
  titleText?: string;
  title?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  /** 行尾自定义内容。 */
  right?: ReactNode;
  /** 显式显示导航提示；不会由 onPress 自动推断。 */
  disclosure?: boolean;
  /** 标准行中的辅助状态文本。 */
  statusText?: string;
  /** 状态色语义。 */
  statusTone?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  /** metric 行的对齐指标列。 */
  metrics?: readonly ListMetricData[];
  /** 兼容需要完整控制行内容的场景。 */
  body?: ReactNode;
  badgeText?: string;
  onLongPress?: () => void;
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface ListMetricData {
  key: string;
  label?: string;
  value: ReactNode;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export interface ListSectionData<ItemT = ListItemData> {
  key: string;
  titleText?: string;
  title?: ReactNode;
  countText?: string;
  data: readonly ItemT[];
  collapsible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ListProps<ItemT = ListItemData>
  extends Omit<FlatListProps<ItemT>, 'data' | 'renderItem' | 'ListHeaderComponent' | 'ListFooterComponent' | 'ListEmptyComponent'> {
  size?: ComponentSize;
  data?: readonly ItemT[] | null;
  /** 分组列表；与 data 二选一，分组标题由 List 渲染。 */
  sections?: readonly ListSectionData<ItemT>[];
  renderItem?: NonNullable<FlatListProps<ItemT>['renderItem']>;
  /** 按行返回滑动操作；未提供操作时该行不创建 SwipeAction。 */
  renderSwipeActions?: (
    info: ListRenderItemInfo<ItemT>,
  ) => ListItemSwipeActions | null | undefined;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  loadingIndicator?: ReactNode;
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
