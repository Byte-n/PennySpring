import {
  BasketIcon,
  CookingPotIcon,
  PhoneIcon,
  ChatCircleIcon,
  WifiHighIcon,
  HeartIcon,
  BroomIcon,
  ScissorsIcon,
  ShowerIcon,
  PackageIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const dailyTypeIconGroup = {
  key: 'daily',
  label: '日常',
  children: [
    { value: ICON.dailyNecessities, label: ICON.label(ICON.dailyNecessities), icon: BasketIcon },
    { value: ICON.kitchenDailyNecessities, label: ICON.label(ICON.kitchenDailyNecessities), icon: CookingPotIcon },
    { value: ICON.communication, label: ICON.label(ICON.communication), icon: ChatCircleIcon },
    { value: ICON.callCharge, label: ICON.label(ICON.callCharge), icon: PhoneIcon },
    { value: ICON.netFee, label: ICON.label(ICON.netFee), icon: WifiHighIcon },
    { value: ICON.life, label: ICON.label(ICON.life), icon: HeartIcon },
    { value: ICON.clean, label: ICON.label(ICON.clean), icon: BroomIcon },
    { value: ICON.haircut, label: ICON.label(ICON.haircut), icon: ScissorsIcon },
    { value: ICON.bath, label: ICON.label(ICON.bath), icon: ShowerIcon },
    { value: ICON.express, label: ICON.label(ICON.express), icon: PackageIcon },
  ],
} as const satisfies TypeIconGroupNode;
