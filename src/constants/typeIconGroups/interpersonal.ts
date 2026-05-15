import {
  HandshakeIcon,
  MoneyWavyIcon,
  GiftIcon,
  ForkKnifeIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const interpersonalTypeIconGroup = {
  key: 'interpersonal',
  label: '人情',
  children: [
    { value: ICON.interpersonal, label: ICON.label(ICON.interpersonal), icon: HandshakeIcon },
    { value: ICON.cashGift, label: ICON.label(ICON.cashGift), icon: MoneyWavyIcon },
    { value: ICON.gift, label: ICON.label(ICON.gift), icon: GiftIcon },
    { value: ICON.treat, label: ICON.label(ICON.treat), icon: ForkKnifeIcon },
  ],
} as const satisfies TypeIconGroupNode;
