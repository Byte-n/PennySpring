import type { ListPickerCascaderOption } from '@pennyspring/ui';

export const CATEGORY_OPTIONS: Array<ListPickerCascaderOption> = [
  {
    labelText: '日常支出',
    value: 'daily',
    children: [
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
    labelText: '固定支出',
    value: 'fixed',
    children: [
      {
        labelText: '住房',
        value: 'housing',
        children: [
          { labelText: '房租', value: 'rent' },
          { labelText: '水电', value: 'utilities' },
        ],
      },
    ],
  },
];
