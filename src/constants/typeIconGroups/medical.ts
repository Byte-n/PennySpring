import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import MedicalMedicalIcon from '../../assets/icon/medical/medical.svg';
import MedicalMedkitIcon from '../../assets/icon/medical/medkit.svg';
import MedicalRegistrationIcon from '../../assets/icon/medical/registration.svg';
import MedicalDiagnoseIcon from '../../assets/icon/medical/diagnose.svg';
import MedicalDrugIcon from '../../assets/icon/medical/drug.svg';
import MedicalHospitalizationIcon from '../../assets/icon/medical/hospitalization.svg';
import MedicalHygieneIcon from '../../assets/icon/medical/hygiene.svg';

export const medicalTypeIconGroup = {
  key: 'medical',
  label: '医疗',
  children: [
    {
      value: ICON.medical,
      label: ICON.label(ICON.medical),
      icon: MedicalMedicalIcon,
    },
    {
      value: ICON.medkit,
      label: ICON.label(ICON.medkit),
      icon: MedicalMedkitIcon,
    },
    {
      value: ICON.registration,
      label: ICON.label(ICON.registration),
      icon: MedicalRegistrationIcon,
    },
    {
      value: ICON.diagnose,
      label: ICON.label(ICON.diagnose),
      icon: MedicalDiagnoseIcon,
    },
    {
      value: ICON.drug,
      label: ICON.label(ICON.drug),
      icon: MedicalDrugIcon,
    },
    {
      value: ICON.hospitalization,
      label: ICON.label(ICON.hospitalization),
      icon: MedicalHospitalizationIcon,
    },
    {
      value: ICON.hygiene,
      label: ICON.label(ICON.hygiene),
      icon: MedicalHygieneIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
