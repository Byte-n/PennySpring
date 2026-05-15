import {
  CarIcon,
  GasPumpIcon,
  BatteryChargingIcon,
  GarageIcon,
  RoadHorizonIcon,
  GearIcon,
  HammerIcon,
  WrenchIcon,
  SprayBottleIcon,
  WarningCircleIcon,
  ShieldCheckIcon,
  ClipboardTextIcon,
  BankIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const carTypeIconGroup = {
  key: 'car',
  label: '汽车',
  children: [
    { value: ICON.car, label: ICON.label(ICON.car), icon: CarIcon },
    { value: ICON.refuel, label: ICON.label(ICON.refuel), icon: GasPumpIcon },
    { value: ICON.carCharge, label: ICON.label(ICON.carCharge), icon: BatteryChargingIcon },
    { value: ICON.parking, label: ICON.label(ICON.parking), icon: GarageIcon },
    { value: ICON.toll, label: ICON.label(ICON.toll), icon: RoadHorizonIcon },
    { value: ICON.autoParts, label: ICON.label(ICON.autoParts), icon: GearIcon },
    { value: ICON.repair, label: ICON.label(ICON.repair), icon: HammerIcon },
    { value: ICON.carMaintenance, label: ICON.label(ICON.carMaintenance), icon: WrenchIcon },
    { value: ICON.carWash, label: ICON.label(ICON.carWash), icon: SprayBottleIcon },
    { value: ICON.illegal, label: ICON.label(ICON.illegal), icon: WarningCircleIcon },
    { value: ICON.carInsurance, label: ICON.label(ICON.carInsurance), icon: ShieldCheckIcon },
    { value: ICON.carInspection, label: ICON.label(ICON.carInspection), icon: ClipboardTextIcon },
    { value: ICON.carLoan, label: ICON.label(ICON.carLoan), icon: BankIcon },
  ],
} as const satisfies TypeIconGroupNode;
