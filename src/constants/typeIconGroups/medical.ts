import {
  HospitalIcon,
  FirstAidKitIcon,
  ClipboardTextIcon,
  StethoscopeIcon,
  PillIcon,
  BedIcon,
  HeartbeatIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const medicalTypeIconGroup = {
  key: 'medical',
  label: '医疗',
  children: [
    { value: ICON.medical, label: ICON.label(ICON.medical), icon: HospitalIcon },
    { value: ICON.medkit, label: ICON.label(ICON.medkit), icon: FirstAidKitIcon },
    { value: ICON.registration, label: ICON.label(ICON.registration), icon: ClipboardTextIcon },
    { value: ICON.diagnose, label: ICON.label(ICON.diagnose), icon: StethoscopeIcon },
    { value: ICON.drug, label: ICON.label(ICON.drug), icon: PillIcon },
    { value: ICON.hospitalization, label: ICON.label(ICON.hospitalization), icon: BedIcon },
    { value: ICON.hygiene, label: ICON.label(ICON.hygiene), icon: HeartbeatIcon },
  ],
} as const satisfies TypeIconGroupNode;
