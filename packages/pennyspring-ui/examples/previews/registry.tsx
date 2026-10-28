import { ThemePreview } from '@pennyspring/theme';
import { calculatorInputDemos } from './data-entry/calculator-input/demos';
import { calendarPickerDemos } from './data-entry/calendar-picker/demos';
import { checkboxDemos } from './data-entry/checkbox/demos';
import { dateTimePickerDemos } from './data-entry/date-time-picker/demos';
import { displayInputDemos } from './data-entry/display-input/demos';
import { imagePickerDemos } from './data-entry/image-picker/demos';
import { inputDemos } from './data-entry/input/demos';
import { listPickerDemos } from './data-entry/list-picker/demos';
import { pickerDemos } from './data-entry/picker/demos';
import { progressDemos } from './data-entry/progress/demos';
import { radioDemos } from './data-entry/radio/demos';
import { sliderDemos } from './data-entry/slider/demos';
import { stepperDemos } from './data-entry/stepper/demos';
import { switchDemos } from './data-entry/switch/demos';
import { tagPickerDemos } from './data-entry/tag-picker/demos';
import { textareaDemos } from './data-entry/textarea/demos';
import { wheelGroupDemos } from './data-entry/wheel-group/demos';
import { cardDemos } from './display/card/demos';
import { carouselDemos } from './display/carousel/demos';
import { ellipsisDemos } from './display/ellipsis/demos';
import { emptyDemos } from './display/empty/demos';
import { loadingDemos } from './display/loading/demos';
import { listDemos } from './display/list/demos';
import { resultDemos } from './display/result/demos';
import { skeletonDemos } from './display/skeleton/demos';
import { swipeActionDemos } from './display/swipe-action/demos';
import { messageDemos } from './feedback/message/demos';
import { notificationDemos } from './feedback/notification/demos';
import { toastDemos } from './feedback/toast/demos';
import { avatarDemos } from './foundation/avatar/demos';
import { badgeDemos } from './foundation/badge/demos';
import { buttonDemos } from './foundation/button/demos';
import { dividerDemos } from './foundation/divider/demos';
import { gridDemos } from './foundation/grid/demos';
import { iconDemos } from './foundation/icon/demos';
import { layoutDemos } from './foundation/layout/demos';
import { segmentedDemos } from './foundation/segmented/demos';
import { spaceDemos } from './foundation/space/demos';
import { tabsDemos } from './foundation/tabs/demos';
import { tagDemos } from './foundation/tag/demos';
import { textDemos } from './foundation/text/demos';
import { actionSheetDemos } from './navigation/action-sheet/demos';
import { dialogDemos } from './navigation/dialog/demos';
import { drawerDemos } from './navigation/drawer/demos';
import { floatingActionGroupDemos } from './navigation/floating-action-group/demos';
import { indexBarDemos } from './navigation/index-bar/demos';
import { popoverDemos } from './navigation/popover/demos';
import { popupDemos } from './navigation/popup/demos';
import { portalDemos } from './navigation/portal/demos';
import { stepsDemos } from './navigation/steps/demos';
import { tabBarDemos } from './navigation/tab-bar/demos';
import { CalendarPickerPreview } from './data-entry/calendar-picker';
import { CalculatorInputPreview } from './data-entry/calculator-input';
import { CheckboxPreview } from './data-entry/checkbox';
import { DateTimePickerPreview } from './data-entry/date-time-picker';
import { DisplayInputPreview } from './data-entry/display-input';
import { ImagePickerPreview } from './data-entry/image-picker';
import { InputPreview } from './data-entry/input';
import { PickerPreview } from './data-entry/picker';
import { ProgressPreview } from './data-entry/progress';
import { RadioPreview } from './data-entry/radio';
import { SliderPreview } from './data-entry/slider';
import { StepperPreview } from './data-entry/stepper';
import { SwitchPreview } from './data-entry/switch';
import { TagPickerPreview } from './data-entry/tag-picker';
import { TextareaPreview } from './data-entry/textarea';
import { WheelGroupPreview } from './data-entry/wheel-group';
import { CardPreview } from './display/card';
import { CarouselPreview } from './display/carousel';
import { EllipsisPreview } from './display/ellipsis';
import { EmptyPreview } from './display/empty';
import { ListPreview } from './display/list';
import { ListPickerPreview } from './data-entry/list-picker';
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
import { LayoutPreview } from './foundation/layout';
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
import { PopoverPreview } from './navigation/popover';
import { PopupPreview } from './navigation/popup';
import { PortalPreview } from './navigation/portal';
import { TabBarPreview } from './navigation/tab-bar';
import { StepsPreview } from './navigation/steps';
import { PreviewScaffold, PreviewSection } from './PreviewScaffold';
import type { ComponentType } from 'react';
import type { ComponentPreviewItem, ComponentPreviewSection } from './types';

interface ComponentDemoPreview {
  id: string;
  title: string;
  Component: ComponentType;
}

function createDemoPreviewItems(
  componentId: string,
  componentTitle: string,
  demos: readonly ComponentDemoPreview[],
): ComponentPreviewItem[] {
  return demos.map(({ Component, id, title }) => {
    function DemoPreview() {
      return (
        <PreviewScaffold>
          <PreviewSection title={title}>
            <Component />
          </PreviewSection>
        </PreviewScaffold>
      );
    }

    return {
      id: `${componentId}/${id}`,
      title: `${componentTitle} / ${title}`,
      description: title,
      component: DemoPreview,
    };
  });
}

const DEMO_PREVIEW_ITEMS = [
  {
    id: 'theme/basic',
    title: 'Theme / Basic',
    description: '主题算法、预设色和设计 token 预览。',
    component: ThemePreview,
  },
  ...createDemoPreviewItems(
    'calculator-input',
    'CalculatorInput',
    calculatorInputDemos,
  ),
  ...createDemoPreviewItems(
    'calendar-picker',
    'CalendarPicker',
    calendarPickerDemos,
  ),
  ...createDemoPreviewItems('checkbox', 'Checkbox', checkboxDemos),
  ...createDemoPreviewItems(
    'date-time-picker',
    'DateTimePicker',
    dateTimePickerDemos,
  ),
  ...createDemoPreviewItems('display-input', 'DisplayInput', displayInputDemos),
  ...createDemoPreviewItems('image-picker', 'ImagePicker', imagePickerDemos),
  ...createDemoPreviewItems('input', 'Input', inputDemos),
  ...createDemoPreviewItems('list-picker', 'ListPicker', listPickerDemos),
  ...createDemoPreviewItems('picker', 'Picker', pickerDemos),
  ...createDemoPreviewItems('progress', 'Progress', progressDemos),
  ...createDemoPreviewItems('radio', 'Radio', radioDemos),
  ...createDemoPreviewItems('slider', 'Slider', sliderDemos),
  ...createDemoPreviewItems('stepper', 'Stepper', stepperDemos),
  ...createDemoPreviewItems('switch', 'Switch', switchDemos),
  ...createDemoPreviewItems('tag-picker', 'TagPicker', tagPickerDemos),
  ...createDemoPreviewItems('textarea', 'Textarea', textareaDemos),
  ...createDemoPreviewItems('wheel-group', 'WheelGroup', wheelGroupDemos),
  ...createDemoPreviewItems('card', 'Card', cardDemos),
  ...createDemoPreviewItems('carousel', 'Carousel', carouselDemos),
  ...createDemoPreviewItems('ellipsis', 'Ellipsis', ellipsisDemos),
  ...createDemoPreviewItems('empty', 'Empty', emptyDemos),
  ...createDemoPreviewItems('list', 'List', listDemos),
  ...createDemoPreviewItems('loading', 'Loading', loadingDemos),
  ...createDemoPreviewItems('result', 'Result', resultDemos),
  ...createDemoPreviewItems('skeleton', 'Skeleton', skeletonDemos),
  ...createDemoPreviewItems('swipe-action', 'SwipeAction', swipeActionDemos),
  ...createDemoPreviewItems('message', 'Message', messageDemos),
  ...createDemoPreviewItems('notification', 'Notification', notificationDemos),
  ...createDemoPreviewItems('toast', 'Toast', toastDemos),
  ...createDemoPreviewItems('avatar', 'Avatar', avatarDemos),
  ...createDemoPreviewItems('badge', 'Badge', badgeDemos),
  ...createDemoPreviewItems('button', 'Button', buttonDemos),
  ...createDemoPreviewItems('divider', 'Divider', dividerDemos),
  ...createDemoPreviewItems('grid', 'Grid', gridDemos),
  ...createDemoPreviewItems('icon', 'Icon', iconDemos),
  ...createDemoPreviewItems('layout', 'Layout', layoutDemos),
  ...createDemoPreviewItems('segmented', 'Segmented', segmentedDemos),
  ...createDemoPreviewItems('space', 'Space', spaceDemos),
  ...createDemoPreviewItems('tabs', 'Tabs', tabsDemos),
  ...createDemoPreviewItems('tag', 'Tag', tagDemos),
  ...createDemoPreviewItems('text', 'Text', textDemos),
  ...createDemoPreviewItems('action-sheet', 'ActionSheet', actionSheetDemos),
  ...createDemoPreviewItems('dialog', 'Dialog', dialogDemos),
  ...createDemoPreviewItems('drawer', 'Drawer', drawerDemos),
  ...createDemoPreviewItems(
    'floating-action-group',
    'FloatingActionGroup',
    floatingActionGroupDemos,
  ),
  ...createDemoPreviewItems('index-bar', 'IndexBar', indexBarDemos),
  ...createDemoPreviewItems('popover', 'Popover', popoverDemos),
  ...createDemoPreviewItems('popup', 'Popup', popupDemos),
  ...createDemoPreviewItems('portal', 'Portal', portalDemos),
  ...createDemoPreviewItems('steps', 'Steps', stepsDemos),
  ...createDemoPreviewItems('tab-bar', 'TabBar', tabBarDemos),
] satisfies ComponentPreviewItem[];

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
        description: '头像尺寸、内容类型、叠放、禁用与深色对照。',
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
        description: '计数、圆点、语义色、尺寸与挂角环。',
        component: BadgePreview,
      },
      {
        id: 'grid',
        title: 'Grid',
        description: '宫格布局和单元格内容。',
        component: GridPreview,
      },
      {
        id: 'layout',
        title: 'Layout',
        description: 'Row、Column、Spacer、GeometryReader 布局原语。',
        component: LayoutPreview,
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
        description: '分段选择、图标选项、全宽与禁用状态。',
        component: SegmentedPreview,
      },
      {
        id: 'tabs',
        title: 'Tabs',
        description: '标签切换、内容面板、wrap/scroll/block 排布与禁用状态。',
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
        id: 'display-input',
        title: 'DisplayInput',
        description:
          '可点击展示输入风格内容，无光标，支持 inline 与 block 布局。',
        component: DisplayInputPreview,
      },
      {
        id: 'image-picker',
        title: 'ImagePicker',
        description: '图片选择器，支持相册和文件系统来源。',
        component: ImagePickerPreview,
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
        description: '复选、复选组、chip 形态和禁用状态。',
        component: CheckboxPreview,
      },
      {
        id: 'radio',
        title: 'Radio',
        description: '单选、单选组、chip 形态与只读禁用状态。',
        component: RadioPreview,
      },
      {
        id: 'switch',
        title: 'Switch',
        description: '细轨道开关、轨道外文案、尺寸与禁用只读状态。',
        component: SwitchPreview,
      },
      {
        id: 'slider',
        title: 'Slider',
        description: '滑块范围、步长、尺寸、状态与数值标注。',
        component: SliderPreview,
      },
      {
        id: 'stepper',
        title: 'Stepper',
        description: '步进器加减、范围限制、尺寸、单位与禁用状态。',
        component: StepperPreview,
      },
      {
        id: 'progress',
        title: 'Progress',
        description: '条形与圆环进度、状态、信息位与尺寸。',
        component: ProgressPreview,
      },
      {
        id: 'calendar-picker',
        title: 'CalendarPicker',
        description: '日历面板、输入型选择与范围选择。',
        component: CalendarPickerPreview,
      },
      {
        id: 'picker',
        title: 'Picker',
        description: '单列、多列、默认打开与空状态，含 Picker.Cascader 级联子模式。',
        component: PickerPreview,
      },
      {
        id: 'list-picker',
        title: 'ListPicker',
        description:
          '基于 List 行的搜索、分组与单选/多选，含 ListPicker.Cascader 级联子模式。',
        component: ListPickerPreview,
      },
      {
        id: 'tag-picker',
        title: 'TagPicker',
        description: '标签式多选，支持隐藏分组、加载与空状态。',
        component: TagPickerPreview,
      },
      {
        id: 'date-time-picker',
        title: 'DateTimePicker',
        description: '日期时间、仅日期与仅时间预设、滚轮与日历布局。',
        component: DateTimePickerPreview,
      },
      {
        id: 'wheel-group',
        title: 'WheelGroup',
        description: '滚轮组内核、容器高度自适应与禁用态。',
        component: WheelGroupPreview,
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
        description: '指示点/计数、单页/露边/纵向排布、深色与边界。',
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
        description: '骨架形状、尺寸、组合用法、动画与加载切换。',
        component: SkeletonPreview,
      },
      {
        id: 'result',
        title: 'Result',
        description: '结果状态、尺寸、页内/卡片承载与无图标。',
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
        description: '步骤尺寸、四态、只读/禁用、深色与交互。',
        component: StepsPreview,
      },
      {
        id: 'tab-bar',
        title: 'TabBar',
        description: '底部标签栏、图标/文字/角标组合、尺寸与禁用状态。',
        component: TabBarPreview,
      },
      {
        id: 'index-bar',
        title: 'IndexBar',
        description: '索引字母尺寸、选中/禁用、拖动气泡与吸顶分组。',
        component: IndexBarPreview,
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
        description:
          '悬浮按钮组：任意定位、更多展开、三种展开方向与 mountPoint。',
        component: FloatingActionGroupPreview,
      },
      {
        id: 'popover',
        title: 'Popover',
        description: '锚定触发元素的轻量浮层、触发方式与自动翻转。',
        component: PopoverPreview,
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
  const previewItems = [
    ...COMPONENT_PREVIEW_SECTIONS.flatMap(section => section.items),
    ...DEMO_PREVIEW_ITEMS,
  ];

  return previewItems.find(item => item.id === previewId);
}

export function getComponentDemoPreviewsByComponentId(
  componentId: string,
): ComponentPreviewItem[] {
  const demoPrefix = `${componentId}/`;

  return DEMO_PREVIEW_ITEMS.filter(item => item.id.startsWith(demoPrefix));
}
