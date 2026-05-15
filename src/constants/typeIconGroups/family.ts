import {
  UsersIcon,
  UserIcon,
  HeartIcon,
  BabyIcon,
  PawPrintIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const familyTypeIconGroup = {
  key: 'family',
  label: '家庭',
  children: [
    { value: ICON.family, label: ICON.label(ICON.family), icon: UsersIcon },
    { value: ICON.parent, label: ICON.label(ICON.parent), icon: UserIcon },
    { value: ICON.love, label: ICON.label(ICON.love), icon: HeartIcon },
    { value: ICON.child, label: ICON.label(ICON.child), icon: BabyIcon },
    { value: ICON.pet, label: ICON.label(ICON.pet), icon: PawPrintIcon },
  ],
} as const satisfies TypeIconGroupNode;
