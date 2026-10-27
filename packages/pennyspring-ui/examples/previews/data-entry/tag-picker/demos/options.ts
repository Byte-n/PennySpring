import type { TagPickerOption } from '@pennyspring/ui';

export const TAG_PICKER_OPTIONS: TagPickerOption[] = [
  { value: 'food', label: '餐饮', icon: 'heart' },
  { value: 'transport', label: '交通', icon: 'arrow-right' },
  { value: 'home', label: '居家', icon: 'home' },
  { value: 'shopping', label: '购物', icon: 'star' },
  { value: 'health', label: '健康', icon: 'check-circle' },
  { value: 'work', label: '工作', icon: 'settings' },
  { value: 'archived', label: '已归档', icon: 'image', hidden: true },
  { value: 'budget', label: '预算', icon: 'calendar', hidden: true },
  { value: 'unavailable', label: '暂不可选', icon: 'warning', disabled: true },
];
