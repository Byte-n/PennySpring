import { DotsThreeCircleIcon } from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const otherTypeIconGroup = {
  key: 'other',
  label: '其它',
  children: [
    { value: ICON.other, label: ICON.label(ICON.other), icon: DotsThreeCircleIcon },
  ],
} as const satisfies TypeIconGroupNode;
