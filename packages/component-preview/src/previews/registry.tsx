import {
  AvatarPreview,
  ButtonPreview,
  GridPreview,
} from './FoundationPreviews';
import { ThemePreview } from '@pennyspring/theme';
import {
  CalendarPreview,
  InputPreview,
  SelectionListPreview,
  TextareaPreview,
} from './DataEntryPreviews';
import {
  CardPreview,
  ListCollapsePreview,
  ListGroupPreview,
  ListPreview,
} from './DisplayPreviews';
import {
  DrawerPreview,
  PortalPreview,
  TopTabNavigatorPreview,
} from './NavigationPreviews';
import { TextPreview } from './TextPreview';
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
