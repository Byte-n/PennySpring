import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import ShoppingShoppingIcon from '../../assets/icon/shopping/shopping.svg';
import ShoppingDigitalProductIcon from '../../assets/icon/shopping/digital_product.svg';
import ShoppingDailyIcon from '../../assets/icon/shopping/daily.svg';
import ShoppingElectricalApplianceIcon from '../../assets/icon/shopping/electrical_appliance.svg';
import ShoppingClothesIcon from '../../assets/icon/shopping/clothes.svg';
import ShoppingFurnitureIcon from '../../assets/icon/shopping/furniture.svg';
import ShoppingBeautyIcon from '../../assets/icon/shopping/beauty.svg';
import ShoppingBodyHairIcon from '../../assets/icon/shopping/body_hair.svg';
import ShoppingSouvenirIcon from '../../assets/icon/shopping/souvenir.svg';

export const shoppingTypeIconGroup = {
  key: 'shopping',
  label: '购物',
  children: [
    {
      value: ICON.shopping,
      label: ICON.label(ICON.shopping),
      icon: ShoppingShoppingIcon,
    },
    {
      value: ICON.digitalProduct,
      label: ICON.label(ICON.digitalProduct),
      icon: ShoppingDigitalProductIcon,
    },
    {
      value: ICON.daily,
      label: ICON.label(ICON.daily),
      icon: ShoppingDailyIcon,
    },
    {
      value: ICON.electricalAppliance,
      label: ICON.label(ICON.electricalAppliance),
      icon: ShoppingElectricalApplianceIcon,
    },
    {
      value: ICON.clothes,
      label: ICON.label(ICON.clothes),
      icon: ShoppingClothesIcon,
    },
    {
      value: ICON.furniture,
      label: ICON.label(ICON.furniture),
      icon: ShoppingFurnitureIcon,
    },
    {
      value: ICON.beauty,
      label: ICON.label(ICON.beauty),
      icon: ShoppingBeautyIcon,
    },
    {
      value: ICON.bodyHair,
      label: ICON.label(ICON.bodyHair),
      icon: ShoppingBodyHairIcon,
    },
    {
      value: ICON.souvenir,
      label: ICON.label(ICON.souvenir),
      icon: ShoppingSouvenirIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
