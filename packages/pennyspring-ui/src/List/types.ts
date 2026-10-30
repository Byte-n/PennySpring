import type { ReactNode } from 'react';
import type { FlatListProps, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import type { IconName } from '../Icon';
import type { ComponentSize } from '../shares/types';

export type ListAmountTone = 'expense' | 'income' | 'neutral';

/** 行尾金额。组件自动拆整数与小数并右对齐。 */
export interface ListAmount {
  value: number | string;
  /** 语义色调：支出红、收入绿、中性主文字。 */
  tone?: ListAmountTone;
  /** 货币符号，默认 ¥。 */
  currency?: string;
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
  /** 行首图标，自动套 38 圆角底板；自定义节点请用 left。 */
  icon?: IconName;
  left?: ReactNode;
  titleText?: string;
  title?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  /** 行尾金额，优先于 right。 */
  amountText?: ListAmount;
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
