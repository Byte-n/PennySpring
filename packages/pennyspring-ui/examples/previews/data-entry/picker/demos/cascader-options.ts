import type { PickerCascaderTab } from '@pennyspring/ui';

export type ExpenseTabKey = 'daily' | 'fixed';

export const EXPENSE_TABS: Array<PickerCascaderTab<unknown, ExpenseTabKey>> = [
  {
    tabKey: 'daily',
    labelText: '日常支出',
    options: [
      {
        labelText: '餐饮',
        value: 'food',
        children: [
          { labelText: '早餐', value: 'breakfast' },
          { labelText: '晚餐', value: 'dinner' },
        ],
      },
      {
        labelText: '交通',
        value: 'traffic',
        children: [
          { labelText: '地铁', value: 'metro' },
          { labelText: '出租车', value: 'taxi' },
        ],
      },
    ],
  },
  {
    tabKey: 'fixed',
    labelText: '固定支出',
    options: [
      {
        labelText: '住房',
        value: 'home',
        children: [
          { labelText: '房租', value: 'rent' },
          { labelText: '水电', value: 'utilities' },
        ],
      },
    ],
  },
];

export const EMPTY_TABS: Array<PickerCascaderTab<unknown, ExpenseTabKey>> = [
  {
    tabKey: 'daily',
    labelText: '日常支出',
    options: [],
  },
];

export const DISABLED_TABS: Array<PickerCascaderTab<unknown, ExpenseTabKey>> = [
  {
    tabKey: 'daily',
    labelText: '日常支出',
    options: [
      {
        labelText: '餐饮',
        value: 'food',
        children: [
          { labelText: '早餐', value: 'breakfast', disabled: true },
          { labelText: '晚餐', value: 'dinner' },
        ],
      },
    ],
  },
  {
    tabKey: 'fixed',
    labelText: '固定支出',
    disabled: true,
    options: [
      {
        labelText: '住房',
        value: 'home',
        children: [{ labelText: '房租', value: 'rent' }],
      },
    ],
  },
];
