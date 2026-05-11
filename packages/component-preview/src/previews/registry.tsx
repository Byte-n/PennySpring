import { ThemePreview } from '@pennyspring/theme';
import { CalendarPreview } from './data-entry/calendar';
import { CascadePickerPreview } from './data-entry/cascade-picker';
import { CheckboxPreview } from './data-entry/checkbox';
import { DateTimePickerPreview } from './data-entry/date-time-picker';
import { InputPreview } from './data-entry/input';
import { PickerPreview } from './data-entry/picker';
import { ProgressPreview } from './data-entry/progress';
import { RadioPreview } from './data-entry/radio';
import { SelectionListPreview } from './data-entry/selection-list';
import { SliderPreview } from './data-entry/slider';
import { SwitchPreview } from './data-entry/switch';
import { TextareaPreview } from './data-entry/textarea';
import { TimePickerPreview } from './data-entry/time-picker';
import { CardPreview } from './display/card';
import { EmptyPreview } from './display/empty';
import { ListPreview } from './display/list';
import { ListCollapsePreview } from './display/list-collapse';
import { ListGroupPreview } from './display/list-group';
import { NotificationPreview } from './feedback/Notification';
import { AvatarPreview } from './foundation/avatar';
import { ButtonPreview } from './foundation/button';
import { DividerPreview } from './foundation/divider';
import { GridPreview } from './foundation/grid';
import { IconPreview } from './foundation/icon';
import { SegmentedPreview } from './foundation/segmented';
import { SpacePreview } from './foundation/space';
import { TagPreview } from './foundation/tag';
import { TextPreview } from './foundation/text';
import { LoadingPreview } from './display/loading';
import { DialogPreview } from './navigation/dialog';
import { DrawerPreview } from './navigation/drawer';
import { PopupPreview } from './navigation/popup';
import { PortalPreview } from './navigation/portal';
import { TopTabNavigatorPreview } from './navigation/top-tab-navigator';
import type { ComponentPreviewSection } from './types';

export const COMPONENT_PREVIEW_SECTIONS = [
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
        id: 'list-group',
        title: 'ListGroup',
        description: '分组列表标题和内容组织。',
        component: ListGroupPreview,
      },
      {
        id: 'list-collapse',
        title: 'ListCollapse',
        description: '可折叠列表分组。',
        component: ListCollapsePreview,
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
        id: 'popup',
        title: 'Popup',
        description: '弹层位置、尺寸、遮罩和操作内容。',
        component: PopupPreview,
      },
    ],
  },
  {
    id: 'feedback',
    title: '反馈',
    items: [
      {
        id: 'notification',
        title: 'Notification',
        description: '通知类型、尺寸、关闭按钮和命令式 API。',
        component: NotificationPreview,
      },
    ],
  },
] satisfies readonly ComponentPreviewSection[];

export function getComponentPreviewById(
  previewId: string,
): ComponentPreviewSection['items'][number] | undefined {
  return COMPONENT_PREVIEW_SECTIONS
    .flatMap(section => section.items)
    .find(item => item.id === previewId);
}
