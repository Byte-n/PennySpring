import {
  ShoppingCartIcon,
  DeviceMobileIcon,
  BasketIcon,
  PlugIcon,
  TShirtIcon,
  ArmchairIcon,
  SparkleIcon,
  SprayBottleIcon,
  GiftIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const shoppingTypeIconGroup = {
  key: 'shopping',
  label: '购物',
  children: [
    { value: ICON.shopping, label: ICON.label(ICON.shopping), icon: ShoppingCartIcon },
    { value: ICON.digitalProduct, label: ICON.label(ICON.digitalProduct), icon: DeviceMobileIcon },
    { value: ICON.daily, label: ICON.label(ICON.daily), icon: BasketIcon },
    { value: ICON.electricalAppliance, label: ICON.label(ICON.electricalAppliance), icon: PlugIcon },
    { value: ICON.clothes, label: ICON.label(ICON.clothes), icon: TShirtIcon },
    { value: ICON.furniture, label: ICON.label(ICON.furniture), icon: ArmchairIcon },
    { value: ICON.beauty, label: ICON.label(ICON.beauty), icon: SparkleIcon },
    { value: ICON.bodyHair, label: ICON.label(ICON.bodyHair), icon: SprayBottleIcon },
    { value: ICON.souvenir, label: ICON.label(ICON.souvenir), icon: GiftIcon },
  ],
} as const satisfies TypeIconGroupNode;
