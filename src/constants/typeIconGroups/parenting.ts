import {
  BabyCarriageIcon,
  BowlFoodIcon,
  JarIcon,
  CookingPotIcon,
  PantsIcon,
  TShirtIcon,
  PuzzlePieceIcon,
  BookOpenIcon,
  AirplaneIcon,
  SyringeIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const parentingTypeIconGroup = {
  key: 'parenting',
  label: '育儿',
  children: [
    { value: ICON.parenting, label: ICON.label(ICON.parenting), icon: BabyCarriageIcon },
    { value: ICON.milkPowder, label: ICON.label(ICON.milkPowder), icon: BowlFoodIcon },
    { value: ICON.feeder, label: ICON.label(ICON.feeder), icon: JarIcon },
    { value: ICON.supplementaryFood, label: ICON.label(ICON.supplementaryFood), icon: CookingPotIcon },
    { value: ICON.diapers, label: ICON.label(ICON.diapers), icon: PantsIcon },
    { value: ICON.kids, label: ICON.label(ICON.kids), icon: TShirtIcon },
    { value: ICON.toy, label: ICON.label(ICON.toy), icon: PuzzlePieceIcon },
    { value: ICON.earlyEducation, label: ICON.label(ICON.earlyEducation), icon: BookOpenIcon },
    { value: ICON.familyTrip, label: ICON.label(ICON.familyTrip), icon: AirplaneIcon },
    { value: ICON.vaccination, label: ICON.label(ICON.vaccination), icon: SyringeIcon },
  ],
} as const satisfies TypeIconGroupNode;
