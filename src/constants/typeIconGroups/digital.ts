import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import DigitalMobilePhoneIcon from '../../assets/icon/digital/mobile_phone.svg';
import DigitalMobilePhoneAccessoriesIcon from '../../assets/icon/digital/mobile_phone_accessories.svg';
import DigitalMemberIcon from '../../assets/icon/digital/member.svg';
import DigitalCameraIcon from '../../assets/icon/digital/camera.svg';

export const digitalTypeIconGroup = {
  key: 'digital',
  label: '数码',
  children: [
    {
      value: ICON.mobilePhone,
      label: ICON.label(ICON.mobilePhone),
      icon: DigitalMobilePhoneIcon,
    },
    {
      value: ICON.mobilePhoneAccessories,
      label: ICON.label(ICON.mobilePhoneAccessories),
      icon: DigitalMobilePhoneAccessoriesIcon,
    },
    {
      value: ICON.member,
      label: ICON.label(ICON.member),
      icon: DigitalMemberIcon,
    },
    {
      value: ICON.camera,
      label: ICON.label(ICON.camera),
      icon: DigitalCameraIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
