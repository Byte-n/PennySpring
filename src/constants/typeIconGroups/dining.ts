import {
  ForkKnifeIcon,
  BowlFoodIcon,
  SunIcon,
  CookingPotIcon,
  BowlSteamIcon,
  MoonStarsIcon,
  PackageIcon,
  CarrotIcon,
  OrangeSliceIcon,
  CakeIcon,
  CookieIcon,
  CoffeeIcon,
  CigaretteIcon,
  StorefrontIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const diningTypeIconGroup = {
  key: 'dining',
  label: '餐饮',
  children: [
    { value: ICON.dining, label: ICON.label(ICON.dining), icon: ForkKnifeIcon },
    { value: ICON.threeMeals, label: ICON.label(ICON.threeMeals), icon: BowlFoodIcon },
    { value: ICON.breakfast, label: ICON.label(ICON.breakfast), icon: SunIcon },
    { value: ICON.lunch, label: ICON.label(ICON.lunch), icon: CookingPotIcon },
    { value: ICON.dinner, label: ICON.label(ICON.dinner), icon: BowlSteamIcon },
    { value: ICON.supper, label: ICON.label(ICON.supper), icon: MoonStarsIcon },
    { value: ICON.takeaway, label: ICON.label(ICON.takeaway), icon: PackageIcon },
    { value: ICON.foodIngredient, label: ICON.label(ICON.foodIngredient), icon: CarrotIcon },
    { value: ICON.fruit, label: ICON.label(ICON.fruit), icon: OrangeSliceIcon },
    { value: ICON.dessert, label: ICON.label(ICON.dessert), icon: CakeIcon },
    { value: ICON.snacks, label: ICON.label(ICON.snacks), icon: CookieIcon },
    { value: ICON.drinks, label: ICON.label(ICON.drinks), icon: CoffeeIcon },
    { value: ICON.at, label: ICON.label(ICON.at), icon: CigaretteIcon },
    { value: ICON.ats, label: ICON.label(ICON.ats), icon: StorefrontIcon },
  ],
} as const satisfies TypeIconGroupNode;
