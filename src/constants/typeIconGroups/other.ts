import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import OtherOtherIcon from '../../assets/icon/other/other.svg';

export const otherTypeIconGroup = {
  key: 'other',
  label: '其它',
  children: [
    {
      value: ICON.other,
      label: ICON.label(ICON.other),
      icon: OtherOtherIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
