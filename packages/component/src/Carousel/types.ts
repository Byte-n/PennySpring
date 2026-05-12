import type { ReactNode, Ref } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/** Carousel 组件暴露的实例方法 */
export interface CarouselRef {
  /** 滚动到指定索引 */
  swipeTo: (index: number) => void;
  /** 滚动到下一页 */
  swipeNext: () => void;
  /** 滚动到上一页 */
  swipePrev: () => void;
}

/** Carousel 组件属性 */
export interface CarouselProps<Data = unknown> {
  /**
   * 初始展示的索引
   * 该属性是响应式的，当值变化时轮播会跳转到对应索引
   * @default 0
   */
  defaultIndex?: number;

  /**
   * 是否允许手势滑动
   * @default true
   */
  allowTouchMove?: boolean;

  /**
   * 是否自动轮播
   * - `false`: 不自动轮播
   * - `true`: 正向自动轮播
   * - `'reverse'`: 反向自动轮播
   * @default false
   */
  autoplay?: boolean | 'reverse';

  /**
   * 自动轮播间隔，单位：毫秒
   * @default 3000
   */
  autoplayInterval?: number;

  /**
   * 是否开启循环播放
   * @default false
   */
  loop?: boolean;

  /**
   * 滑动方向
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';

  /** 索引变化回调 */
  onIndexChange?: (index: number) => void;

  /** 指示器配置 */
  indicatorProps?: {
    /** 指示器激活状态颜色 */
    color?: string;
    /** 指示器容器样式 */
    style?: StyleProp<ViewStyle>;
  };

  /**
   * 自定义指示器
   * - `false`: 不展示指示器
   * - 函数：接收总数与当前索引，返回自定义节点
   */
  indicator?: false | ((total: number, current: number) => ReactNode);

  /**
   * 单个滑块所占轨道宽（高）度百分比
   * 取值范围 0 ~ 100
   * @default 100
   */
  slideSize?: number;

  /**
   * 轨道两侧预留的偏移量百分比
   * 用于在两端留出空白
   * @default 0
   */
  trackOffset?: number;

  /**
   * 是否在边界处卡住
   * 开启后滑动到边缘不会完全滑出可视区域
   * @default true
   */
  stuckAtBoundary?: boolean;

  /**
   * 是否开启橡皮筋效果
   * 关闭后到达边界时不再有超出回弹
   * @default true
   */
  rubberband?: boolean;

  /**
   * 虚拟渲染时前后额外渲染的滑块个数
   * @default 2
   */
  virtualOverscan?: number;

  /**
   * 数据源数组
   */
  data: Data[];

  /**
   * 渲染每一项的函数
   * @param item - 数据项
   * @param index - 索引
   */
  renderItem: (item: Data, index: number) => ReactNode;

  /**
   * 是否阻断原生手势响应
   * 关闭后可与嵌套的 ScrollView 等原生可滚动容器协同工作
   * @default true
   */
  blockNativeResponder?: boolean;

  /** 容器样式 */
  style?: StyleProp<ViewStyle>;

  ref?: Ref<CarouselRef>;
}
