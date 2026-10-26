import type { ListPickerOption, ListPickerOptionGroup } from '@pennyspring/ui';

export const CATEGORY_OPTIONS: ListPickerOption[] = [
  { value: 'food', labelText: '餐饮美食', descriptionText: '日常用餐与外卖' },
  {
    value: 'transport',
    labelText: '交通出行',
    descriptionText: '公交、打车与加油',
  },
  {
    value: 'shopping',
    labelText: '购物消费',
    descriptionText: '生活用品与网购',
  },
  {
    value: 'housing',
    labelText: '居家生活',
    descriptionText: '水电、物业与日用品',
  },
  { value: 'health', labelText: '健康医疗', descriptionText: '药品与就医支出' },
  {
    value: 'disabled',
    labelText: '暂不可选',
    descriptionText: '该选项当前不可用',
    disabled: true,
  },
];

export const GROUPED_OPTIONS: ListPickerOptionGroup[] = [
  {
    key: 'daily',
    titleText: '日常开销',
    options: CATEGORY_OPTIONS.slice(0, 3),
  },
  { key: 'life', titleText: '生活服务', options: CATEGORY_OPTIONS.slice(3) },
];
