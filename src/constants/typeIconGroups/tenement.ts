import {
  DropIcon,
  LightningIcon,
  FlameIcon,
  RecycleIcon,
  BuildingIcon,
  ThermometerHotIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const tenementTypeIconGroup = {
  key: 'tenement',
  label: '物业',
  children: [
    { value: ICON.waterRate, label: ICON.label(ICON.waterRate), icon: DropIcon },
    { value: ICON.electricity, label: ICON.label(ICON.electricity), icon: LightningIcon },
    { value: ICON.gasCharge, label: ICON.label(ICON.gasCharge), icon: FlameIcon },
    { value: ICON.garbageFee, label: ICON.label(ICON.garbageFee), icon: RecycleIcon },
    { value: ICON.propertyCosts, label: ICON.label(ICON.propertyCosts), icon: BuildingIcon },
    { value: ICON.heatingFee, label: ICON.label(ICON.heatingFee), icon: ThermometerHotIcon },
  ],
} as const satisfies TypeIconGroupNode;
