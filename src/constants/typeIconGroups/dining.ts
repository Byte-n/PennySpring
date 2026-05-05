import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import DiningDiningIcon from '../../assets/icon/dining/dining.svg';
import DiningThreeMealsIcon from '../../assets/icon/dining/three_meals.svg';
import DiningBreakfastIcon from '../../assets/icon/dining/breakfast.svg';
import DiningLunchIcon from '../../assets/icon/dining/lunch.svg';
import DiningDinnerIcon from '../../assets/icon/dining/dinner.svg';
import DiningSupperIcon from '../../assets/icon/dining/supper.svg';
import DiningTakeawayIcon from '../../assets/icon/dining/takeaway.svg';
import DiningFoodIngredientIcon from '../../assets/icon/dining/food_ingredient.svg';
import DiningFruitIcon from '../../assets/icon/dining/fruit.svg';
import DiningDessertIcon from '../../assets/icon/dining/dessert.svg';
import DiningSnacksIcon from '../../assets/icon/dining/snacks.svg';
import DiningDrinksIcon from '../../assets/icon/dining/drinks.svg';
import DiningAtIcon from '../../assets/icon/dining/at.svg';
import DiningAtsIcon from '../../assets/icon/dining/ats.svg';

export const diningTypeIconGroup = {
  key: 'dining',
  label: '餐饮',
  children: [
    {
      value: ICON.dining,
      label: ICON.label(ICON.dining),
      icon: DiningDiningIcon,
    },
    {
      value: ICON.threeMeals,
      label: ICON.label(ICON.threeMeals),
      icon: DiningThreeMealsIcon,
    },
    {
      value: ICON.breakfast,
      label: ICON.label(ICON.breakfast),
      icon: DiningBreakfastIcon,
    },
    {
      value: ICON.lunch,
      label: ICON.label(ICON.lunch),
      icon: DiningLunchIcon,
    },
    {
      value: ICON.dinner,
      label: ICON.label(ICON.dinner),
      icon: DiningDinnerIcon,
    },
    {
      value: ICON.supper,
      label: ICON.label(ICON.supper),
      icon: DiningSupperIcon,
    },
    {
      value: ICON.takeaway,
      label: ICON.label(ICON.takeaway),
      icon: DiningTakeawayIcon,
    },
    {
      value: ICON.foodIngredient,
      label: ICON.label(ICON.foodIngredient),
      icon: DiningFoodIngredientIcon,
    },
    {
      value: ICON.fruit,
      label: ICON.label(ICON.fruit),
      icon: DiningFruitIcon,
    },
    {
      value: ICON.dessert,
      label: ICON.label(ICON.dessert),
      icon: DiningDessertIcon,
    },
    {
      value: ICON.snacks,
      label: ICON.label(ICON.snacks),
      icon: DiningSnacksIcon,
    },
    {
      value: ICON.drinks,
      label: ICON.label(ICON.drinks),
      icon: DiningDrinksIcon,
    },
    {
      value: ICON.at,
      label: ICON.label(ICON.at),
      icon: DiningAtIcon,
    },
    {
      value: ICON.ats,
      label: ICON.label(ICON.ats),
      icon: DiningAtsIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
