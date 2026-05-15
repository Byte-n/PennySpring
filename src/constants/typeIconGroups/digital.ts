import {
  DeviceMobileIcon,
  HeadphonesIcon,
  CrownSimpleIcon,
  CameraIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const digitalTypeIconGroup = {
  key: 'digital',
  label: '数码',
  children: [
    { value: ICON.mobilePhone, label: ICON.label(ICON.mobilePhone), icon: DeviceMobileIcon },
    { value: ICON.mobilePhoneAccessories, label: ICON.label(ICON.mobilePhoneAccessories), icon: HeadphonesIcon },
    { value: ICON.member, label: ICON.label(ICON.member), icon: CrownSimpleIcon },
    { value: ICON.camera, label: ICON.label(ICON.camera), icon: CameraIcon },
  ],
} as const satisfies TypeIconGroupNode;
