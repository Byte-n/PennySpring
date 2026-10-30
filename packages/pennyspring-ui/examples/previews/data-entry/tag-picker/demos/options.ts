import type { TagPickerOption } from '@pennyspring/ui';

export const TAG_PICKER_OPTIONS: TagPickerOption[] = [
  { value: 'food', labelText: '餐饮', icon: 'heart' },
  { value: 'transport', labelText: '交通', icon: 'arrow-right' },
  { value: 'home', labelText: '居家', icon: 'home' },
  { value: 'shopping', labelText: '购物', icon: 'star' },
  { value: 'health', labelText: '健康', icon: 'check-circle' },
  { value: 'work', labelText: '工作', icon: 'settings' },
  { value: 'archived', labelText: '已归档', icon: 'image', hidden: true },
  { value: 'budget', labelText: '预算', icon: 'calendar', hidden: true },
  { value: 'unavailable', labelText: '暂不可选', icon: 'warning', disabled: true },
];
