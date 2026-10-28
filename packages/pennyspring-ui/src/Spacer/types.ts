import type { StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SpacerDirection = 'horizontal' | 'vertical';

export interface SpacerProps {
  /** 空白方向，默认 'horizontal' */
  direction?: SpacerDirection;
  /** 语义尺寸，映射到布局 gap token：横向取宽度、纵向取高度，两向同值。默认不设置时走 flex 弹性占位 */
  size?: ComponentSize;
  /** 弹性系数，仅在 size 未设置时生效，默认 1 */
  flex?: number;
  /** 外部样式覆盖 */
  style?: StyleProp<ViewStyle>;
}
