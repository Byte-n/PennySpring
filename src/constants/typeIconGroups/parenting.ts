import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import ParentingParentingIcon from '../../assets/icon/parenting/parenting.svg';
import ParentingMilkPowderIcon from '../../assets/icon/parenting/milk_powder.svg';
import ParentingFeederIcon from '../../assets/icon/parenting/feeder.svg';
import ParentingSupplementaryFoodIcon from '../../assets/icon/parenting/supplementary_food.svg';
import ParentingDiapersIcon from '../../assets/icon/parenting/diapers.svg';
import ParentingKidsIcon from '../../assets/icon/parenting/kids.svg';
import ParentingToyIcon from '../../assets/icon/parenting/toy.svg';
import ParentingEarlyEducationIcon from '../../assets/icon/parenting/early_education.svg';
import ParentingFamilyTripIcon from '../../assets/icon/parenting/family_trip.svg';
import ParentingVaccinationIcon from '../../assets/icon/parenting/vaccination.svg';

export const parentingTypeIconGroup = {
  key: 'parenting',
  label: '育儿',
  children: [
    {
      value: ICON.parenting,
      label: ICON.label(ICON.parenting),
      icon: ParentingParentingIcon,
    },
    {
      value: ICON.milkPowder,
      label: ICON.label(ICON.milkPowder),
      icon: ParentingMilkPowderIcon,
    },
    {
      value: ICON.feeder,
      label: ICON.label(ICON.feeder),
      icon: ParentingFeederIcon,
    },
    {
      value: ICON.supplementaryFood,
      label: ICON.label(ICON.supplementaryFood),
      icon: ParentingSupplementaryFoodIcon,
    },
    {
      value: ICON.diapers,
      label: ICON.label(ICON.diapers),
      icon: ParentingDiapersIcon,
    },
    {
      value: ICON.kids,
      label: ICON.label(ICON.kids),
      icon: ParentingKidsIcon,
    },
    {
      value: ICON.toy,
      label: ICON.label(ICON.toy),
      icon: ParentingToyIcon,
    },
    {
      value: ICON.earlyEducation,
      label: ICON.label(ICON.earlyEducation),
      icon: ParentingEarlyEducationIcon,
    },
    {
      value: ICON.familyTrip,
      label: ICON.label(ICON.familyTrip),
      icon: ParentingFamilyTripIcon,
    },
    {
      value: ICON.vaccination,
      label: ICON.label(ICON.vaccination),
      icon: ParentingVaccinationIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
