import {
  HouseIcon,
  KeyIcon,
  BankIcon,
  BedIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const housingTypeIconGroup = {
  key: 'housing',
  label: '住房',
  children: [
    { value: ICON.housing, label: ICON.label(ICON.housing), icon: HouseIcon },
    { value: ICON.houseRent, label: ICON.label(ICON.houseRent), icon: KeyIcon },
    { value: ICON.houseLoan, label: ICON.label(ICON.houseLoan), icon: BankIcon },
    { value: ICON.hotel, label: ICON.label(ICON.hotel), icon: BedIcon },
  ],
} as const satisfies TypeIconGroupNode;
