import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import InterpersonalInterpersonalIcon from '../../assets/icon/interpersonal/interpersonal.svg';
import InterpersonalCashGiftIcon from '../../assets/icon/interpersonal/cash_gift.svg';
import InterpersonalGiftIcon from '../../assets/icon/interpersonal/gift.svg';
import InterpersonalTreatIcon from '../../assets/icon/interpersonal/treat.svg';

export const interpersonalTypeIconGroup = {
  key: 'interpersonal',
  label: '人情',
  children: [
    {
      value: ICON.interpersonal,
      label: ICON.label(ICON.interpersonal),
      icon: InterpersonalInterpersonalIcon,
    },
    {
      value: ICON.cashGift,
      label: ICON.label(ICON.cashGift),
      icon: InterpersonalCashGiftIcon,
    },
    {
      value: ICON.gift,
      label: ICON.label(ICON.gift),
      icon: InterpersonalGiftIcon,
    },
    {
      value: ICON.treat,
      label: ICON.label(ICON.treat),
      icon: InterpersonalTreatIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
