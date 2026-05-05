import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import DressHatIcon from '../../assets/icon/dress/hat.svg';
import DressCoatIcon from '../../assets/icon/dress/coat.svg';
import DressPantsIcon from '../../assets/icon/dress/pants.svg';
import DressUnderwearIcon from '../../assets/icon/dress/underwear.svg';
import DressBagIcon from '../../assets/icon/dress/bag.svg';
import DressShoesIcon from '../../assets/icon/dress/shoes.svg';
import DressSocksIcon from '../../assets/icon/dress/socks.svg';
import DressAccessoriesIcon from '../../assets/icon/dress/accessories.svg';

export const dressTypeIconGroup = {
  key: 'dress',
  label: '服饰',
  children: [
    {
      value: ICON.hat,
      label: ICON.label(ICON.hat),
      icon: DressHatIcon,
    },
    {
      value: ICON.coat,
      label: ICON.label(ICON.coat),
      icon: DressCoatIcon,
    },
    {
      value: ICON.pants,
      label: ICON.label(ICON.pants),
      icon: DressPantsIcon,
    },
    {
      value: ICON.underwear,
      label: ICON.label(ICON.underwear),
      icon: DressUnderwearIcon,
    },
    {
      value: ICON.bag,
      label: ICON.label(ICON.bag),
      icon: DressBagIcon,
    },
    {
      value: ICON.shoes,
      label: ICON.label(ICON.shoes),
      icon: DressShoesIcon,
    },
    {
      value: ICON.socks,
      label: ICON.label(ICON.socks),
      icon: DressSocksIcon,
    },
    {
      value: ICON.accessories,
      label: ICON.label(ICON.accessories),
      icon: DressAccessoriesIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
