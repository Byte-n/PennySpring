import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import FamilyFamilyIcon from '../../assets/icon/family/family.svg';
import FamilyParentIcon from '../../assets/icon/family/parent.svg';
import FamilyLoveIcon from '../../assets/icon/family/love.svg';
import FamilyChildIcon from '../../assets/icon/family/child.svg';
import FamilyPetIcon from '../../assets/icon/family/pet.svg';

export const familyTypeIconGroup = {
  key: 'family',
  label: '家庭',
  children: [
    {
      value: ICON.family,
      label: ICON.label(ICON.family),
      icon: FamilyFamilyIcon,
    },
    {
      value: ICON.parent,
      label: ICON.label(ICON.parent),
      icon: FamilyParentIcon,
    },
    {
      value: ICON.love,
      label: ICON.label(ICON.love),
      icon: FamilyLoveIcon,
    },
    {
      value: ICON.child,
      label: ICON.label(ICON.child),
      icon: FamilyChildIcon,
    },
    {
      value: ICON.pet,
      label: ICON.label(ICON.pet),
      icon: FamilyPetIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
