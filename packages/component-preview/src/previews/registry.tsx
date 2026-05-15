import { ThemePreview } from '@pennyspring/theme';
import { ClassificationAndIconsPreview } from './business/classification-and-icons';
import { CalendarPreview } from './data-entry/calendar';
import { CalculatorInputPreview } from './data-entry/calculator-input';
import { CascaderPreview } from './data-entry/cascader';
import { CascadePickerPreview } from './data-entry/cascade-picker';
import { CheckboxPreview } from './data-entry/checkbox';
import { DateTimePickerPreview } from './data-entry/date-time-picker';
import { InputPreview } from './data-entry/input';
import { PickerPreview } from './data-entry/picker';
import { ProgressPreview } from './data-entry/progress';
import { RadioPreview } from './data-entry/radio';
import { SelectionListPreview } from './data-entry/selection-list';
import { SliderPreview } from './data-entry/slider';
import { StepperPreview } from './data-entry/stepper';
import { SwitchPreview } from './data-entry/switch';
import { TextareaPreview } from './data-entry/textarea';
import { TimePickerPreview } from './data-entry/time-picker';
import { CardPreview } from './display/card';
import { CarouselPreview } from './display/carousel';
import { DataListPreview } from './display/data-list';
import { EllipsisPreview } from './display/ellipsis';
import { EmptyPreview } from './display/empty';
import { ListPreview } from './display/list';
import { ListCollapsePreview } from './display/list-collapse';
import { LoadingPreview } from './display/loading';
import { ResultPreview } from './display/result';
import { SkeletonPreview } from './display/skeleton';
import { SwipeActionPreview } from './display/swipe-action';
import { MessagePreview } from './feedback/message';
import { NotificationPreview } from './feedback/notification';
import { ToastPreview } from './feedback/toast';
import { AvatarPreview } from './foundation/avatar';
import { BadgePreview } from './foundation/badge';
import { ButtonPreview } from './foundation/button';
import { DividerPreview } from './foundation/divider';
import { GridPreview } from './foundation/grid';
import { IconPreview } from './foundation/icon';
import { SegmentedPreview } from './foundation/segmented';
import { SpacePreview } from './foundation/space';
import { TabsPreview } from './foundation/tabs';
import { TagPreview } from './foundation/tag';
import { TextPreview } from './foundation/text';
import { ActionSheetPreview } from './navigation/action-sheet';
import { DialogPreview } from './navigation/dialog';
import { DrawerPreview } from './navigation/drawer';
import { FloatingActionGroupPreview } from './navigation/floating-action-group';
import { IndexBarPreview } from './navigation/index-bar';
import { PopupPreview } from './navigation/popup';
import { PortalPreview } from './navigation/portal';
import { SideBarPreview } from './navigation/side-bar';
import { TabBarPreview } from './navigation/tab-bar';
import { StepsPreview } from './navigation/steps';
import { TopTabNavigatorPreview } from './navigation/top-tab-navigator';
import type { ComponentPreviewSection } from './types';

export const COMPONENT_PREVIEW_SECTIONS = [
  {
    id: 'business',
    title: '业务',
    items: [
      {
        id: 'classification-and-icons',
        title: '分类与图标',
        description:
          '资产分类树与类型图标树完整预览，按网格展示并按类型图标分组。',
        component: ClassificationAndIconsPreview,
      },
    ],
  },
  {
    id: 'foundation',
    title: '基础',
    items: [
      {
        id: 'theme',
        title: 'Theme',
        description: '主题算法、预设色和设计 token 预览。',
        component: ThemePreview,
      },
      {
        id: 'text',
        title: 'Text',
        description: '文本尺寸、颜色和字重。',
        component: TextPreview,
      },
      {
        id: 'avatar',
        title: 'Avatar',
        description: '头像、文本头像和头像组。',
        component: AvatarPreview,
      },
      {
        id: 'button',
        title: 'Button',
        description: '按钮类型、变体、尺寸、图标和状态。',
        component: ButtonPreview,
      },
      {
        id: 'badge',
        title: 'Badge',
        description: '角标数字、点状态、颜色和尺寸。',
        component: BadgePreview,
      },
      {
        id: 'grid',
        title: 'Grid',
        description: '宫格布局和单元格内容。',
        component: GridPreview,
      },
      {
        id: 'space',
        title: 'Space',
        description: '间距、方向、对齐和换行。',
        component: SpacePreview,
      },
      {
        id: 'tag',
        title: 'Tag',
        description: '标签颜色、变体、尺寸和状态。',
        component: TagPreview,
      },
      {
        id: 'segmented',
        title: 'Segmented',
        description: '分段选择、图标选项、尺寸和受控切换。',
        component: SegmentedPreview,
      },
      {
        id: 'tabs',
        title: 'Tabs',
        description: '标签切换、内容面板、尺寸和受控切换。',
        component: TabsPreview,
      },
      {
        id: 'icon',
        title: 'Icon',
        description: '图标映射、尺寸、颜色和视觉权重。',
        component: IconPreview,
      },
      {
        id: 'divider',
        title: 'Divider',
        description: '分割线方向、内容位置和尺寸。',
        component: DividerPreview,
      },
    ],
  },
  {
    id: 'data-entry',
    title: '录入',
    items: [
      {
        id: 'input',
        title: 'Input',
        description: '单行输入、状态、前后缀和清除操作。',
        component: InputPreview,
      },
      {
        id: 'calculator-input',
        title: 'CalculatorInput',
        description: '表达式录入、即时计算、清空退格和确认操作。',
        component: CalculatorInputPreview,
      },
      {
        id: 'textarea',
        title: 'Textarea',
        description: '多行输入、计数、错误和只读状态。',
        component: TextareaPreview,
      },
      {
        id: 'checkbox',
        title: 'Checkbox',
        description: '复选、复选组、按钮形态和禁用状态。',
        component: CheckboxPreview,
      },
      {
        id: 'radio',
        title: 'Radio',
        description: '单选、单选组、按钮形态和禁用状态。',
        component: RadioPreview,
      },
      {
        id: 'switch',
        title: 'Switch',
        description: '开关切换、尺寸和禁用只读状态。',
        component: SwitchPreview,
      },
      {
        id: 'slider',
        title: 'Slider',
        description: '滑块范围、步长、尺寸和状态。',
        component: SliderPreview,
      },
      {
        id: 'stepper',
        title: 'Stepper',
        description: '步进器加减、范围限制、尺寸和禁用状态。',
        component: StepperPreview,
      },
      {
        id: 'progress',
        title: 'Progress',
        description: '线性和环形进度、状态和尺寸。',
        component: ProgressPreview,
      },
      {
        id: 'selection-list',
        title: 'SelectionList',
        description: '选项选择、分组和弹层模式。',
        component: SelectionListPreview,
      },
      {
        id: 'calendar',
        title: 'Calendar',
        description: '日期、月份、年份和范围选择。',
        component: CalendarPreview,
      },
      {
        id: 'picker',
        title: 'Picker',
        description: '单列、多列、默认打开和空状态。',
        component: PickerPreview,
      },
      {
        id: 'cascader',
        title: 'Cascader',
        description: '多级层级选择、叶子节点提交和展开层级切换。',
        component: CascaderPreview,
      },
      {
        id: 'cascade-picker',
        title: 'CascadePicker',
        description: '多级级联选择、默认值和默认打开。',
        component: CascadePickerPreview,
      },
      {
        id: 'date-time-picker',
        title: 'DateTimePicker',
        description: '日期时间精度、范围和默认打开。',
        component: DateTimePickerPreview,
      },
      {
        id: 'time-picker',
        title: 'TimePicker',
        description: '时间精度、步长、范围和默认打开。',
        component: TimePickerPreview,
      },
    ],
  },
  {
    id: 'display',
    title: '展示',
    items: [
      {
        id: 'carousel',
        title: 'Carousel',
        description: '轮播滑动、自动播放、纵向模式和自定义指示器。',
        component: CarouselPreview,
      },
      {
        id: 'card',
        title: 'Card',
        description: '普通、摘要和层级容器。',
        component: CardPreview,
      },
      {
        id: 'list',
        title: 'List',
        description: '列表容器、列表项和分割线。',
        component: ListPreview,
      },
      {
        id: 'list-collapse',
        title: 'ListCollapse',
        description: '可折叠列表分组。',
        component: ListCollapsePreview,
      },
      {
        id: 'data-list',
        title: 'DataList',
        description: '列表加载、上拉加载、分组列表和尾部状态。',
        component: DataListPreview,
      },
      {
        id: 'ellipsis',
        title: 'Ellipsis',
        description: '文本截断方向、行数和展开收起。',
        component: EllipsisPreview,
      },
      {
        id: 'swipe-action',
        title: 'SwipeAction',
        description: '左右滑操作、动作颜色、尺寸与只读状态。',
        component: SwipeActionPreview,
      },
      {
        id: 'empty',
        title: 'Empty',
        description: '空状态的图标、文案、附加操作和尺寸。',
        component: EmptyPreview,
      },
      {
        id: 'loading',
        title: 'Loading',
        description: '加载指示器尺寸、方向和自定义内容。',
        component: LoadingPreview,
      },
      {
        id: 'skeleton',
        title: 'Skeleton',
        description: '骨架屏形状、尺寸、动画和加载切换。',
        component: SkeletonPreview,
      },
      {
        id: 'result',
        title: 'Result',
        description: '操作结果状态、图标、标题、副标题和附加操作。',
        component: ResultPreview,
      },
    ],
  },
  {
    id: 'feedback',
    title: '反馈',
    items: [
      {
        id: 'toast',
        title: 'Toast',
        description: '轻提示组件与 useToast。',
        component: ToastPreview,
      },
      {
        id: 'message',
        title: 'Message',
        description: '消息条组件与 useMessage。',
        component: MessagePreview,
      },
      {
        id: 'notification',
        title: 'Notification',
        description: '通知卡片组件与 useNotification。',
        component: NotificationPreview,
      },
    ],
  },
  {
    id: 'navigation',
    title: '导航与容器',
    items: [
      {
        id: 'drawer',
        title: 'Drawer',
        description: '抽屉容器和页面侧滑。',
        component: DrawerPreview,
      },
      {
        id: 'dialog',
        title: 'Dialog',
        description: '对话框尺寸、受控打开和操作状态。',
        component: DialogPreview,
      },
      {
        id: 'action-sheet',
        title: 'ActionSheet',
        description: '底部动作面板、动作回调和关闭行为。',
        component: ActionSheetPreview,
      },
      {
        id: 'steps',
        title: 'Steps',
        description: '步骤条流程状态、尺寸、只读和禁用项。',
        component: StepsPreview,
      },
      {
        id: 'tab-bar',
        title: 'TabBar',
        description: '底部标签栏图标、角标、尺寸和禁用状态。',
        component: TabBarPreview,
      },
      {
        id: 'side-bar',
        title: 'SideBar',
        description: '侧边分类切换、滚动布局和面板渲染。',
        component: SideBarPreview,
      },
      {
        id: 'index-bar',
        title: 'IndexBar',
        description: '索引导航侧栏与分组面板。',
        component: IndexBarPreview,
      },
      {
        id: 'top-tab-navigator',
        title: 'TopTabNavigator',
        description: '顶部标签页和分段控制。',
        component: TopTabNavigatorPreview,
      },
      {
        id: 'portal',
        title: 'Portal',
        description: '跨层级浮层挂载。',
        component: PortalPreview,
      },
      {
        id: 'floating-action-group',
        title: 'FloatingActionGroup',
        description: '悬浮按钮组：任意定位、更多展开、三种展开方向与 mountPoint。',
        component: FloatingActionGroupPreview,
      },
      {
        id: 'popup',
        title: 'Popup',
        description: '弹层位置、尺寸、遮罩和 FloatingPanel 操作。',
        component: PopupPreview,
      },
    ],
  },
] satisfies readonly ComponentPreviewSection[];

export function getComponentPreviewById(
  previewId: string,
): ComponentPreviewSection['items'][number] | undefined {
  return COMPONENT_PREVIEW_SECTIONS.flatMap(section => section.items).find(
    item => item.id === previewId,
  );
}
