import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import TenementWaterRateIcon from '../../assets/icon/tenement/water_rate.svg';
import TenementElectricityIcon from '../../assets/icon/tenement/electricity.svg';
import TenementGasChargeIcon from '../../assets/icon/tenement/gas_charge.svg';
import TenementGarbageFeeIcon from '../../assets/icon/tenement/garbage_fee.svg';
import TenementPropertyCostsIcon from '../../assets/icon/tenement/property_costs.svg';
import TenementHeatingFeeIcon from '../../assets/icon/tenement/heating_fee.svg';

export const tenementTypeIconGroup = {
  key: 'tenement',
  label: '物业',
  children: [
    {
      value: ICON.waterRate,
      label: ICON.label(ICON.waterRate),
      icon: TenementWaterRateIcon,
    },
    {
      value: ICON.electricity,
      label: ICON.label(ICON.electricity),
      icon: TenementElectricityIcon,
    },
    {
      value: ICON.gasCharge,
      label: ICON.label(ICON.gasCharge),
      icon: TenementGasChargeIcon,
    },
    {
      value: ICON.garbageFee,
      label: ICON.label(ICON.garbageFee),
      icon: TenementGarbageFeeIcon,
    },
    {
      value: ICON.propertyCosts,
      label: ICON.label(ICON.propertyCosts),
      icon: TenementPropertyCostsIcon,
    },
    {
      value: ICON.heatingFee,
      label: ICON.label(ICON.heatingFee),
      icon: TenementHeatingFeeIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
