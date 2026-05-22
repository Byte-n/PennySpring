import type { IconComponent } from '@pennyspring/ui';

import { ICON } from '@pennyspring/data';

import { incomeTypeIconGroup } from './typeIconGroups/income';
import { transferTypeIconGroup } from './typeIconGroups/transfer';
import { moneyManagementTypeIconGroup } from './typeIconGroups/moneyManagement';
import { diningTypeIconGroup } from './typeIconGroups/dining';
import { dailyTypeIconGroup } from './typeIconGroups/daily';
import { shoppingTypeIconGroup } from './typeIconGroups/shopping';
import { dressTypeIconGroup } from './typeIconGroups/dress';
import { digitalTypeIconGroup } from './typeIconGroups/digital';
import { entertainmentTypeIconGroup } from './typeIconGroups/entertainment';
import { familyTypeIconGroup } from './typeIconGroups/family';
import { parentingTypeIconGroup } from './typeIconGroups/parenting';
import { carTypeIconGroup } from './typeIconGroups/car';
import { interpersonalTypeIconGroup } from './typeIconGroups/interpersonal';
import { trafficTypeIconGroup } from './typeIconGroups/traffic';
import { housingTypeIconGroup } from './typeIconGroups/housing';
import { medicalTypeIconGroup } from './typeIconGroups/medical';
import { campusTypeIconGroup } from './typeIconGroups/campus';
import { tenementTypeIconGroup } from './typeIconGroups/tenement';
import { otherTypeIconGroup } from './typeIconGroups/other';
import { Icon } from 'phosphor-react-native';

export type IconValue = ReturnType<typeof ICON.values>[number];
export type TypeIconComponent = IconComponent;

export interface TypeIconNode {
  value: IconValue;
  label: string;
  icon: TypeIconComponent;
}

export interface TypeIconGroupNode {
  key: string;
  label: string;
  children: readonly TypeIconNode[];
}

export const TYPE_ICON_TREE = [
  incomeTypeIconGroup,
  transferTypeIconGroup,
  moneyManagementTypeIconGroup,
  diningTypeIconGroup,
  dailyTypeIconGroup,
  shoppingTypeIconGroup,
  dressTypeIconGroup,
  digitalTypeIconGroup,
  entertainmentTypeIconGroup,
  familyTypeIconGroup,
  parentingTypeIconGroup,
  carTypeIconGroup,
  interpersonalTypeIconGroup,
  trafficTypeIconGroup,
  housingTypeIconGroup,
  medicalTypeIconGroup,
  campusTypeIconGroup,
  tenementTypeIconGroup,
  otherTypeIconGroup,
] as const satisfies readonly TypeIconGroupNode[];

export const ICON_MAP = TYPE_ICON_TREE.map(v => v.children)
  .flat(1)
  .reduce((acc: any, cur) => {
    acc[cur.value as any] = cur.icon;
    return acc;
  }, {}) as { [key: string]: Icon };
