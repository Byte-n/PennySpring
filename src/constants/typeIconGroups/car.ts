import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import CarCarIcon from '../../assets/icon/car/car.svg';
import CarRefuelIcon from '../../assets/icon/car/refuel.svg';
import CarCarChargeIcon from '../../assets/icon/car/car_charge.svg';
import CarParkingIcon from '../../assets/icon/car/parking.svg';
import CarTollIcon from '../../assets/icon/car/toll.svg';
import CarAutoPartsIcon from '../../assets/icon/car/auto_parts.svg';
import CarRepairIcon from '../../assets/icon/car/repair.svg';
import CarCarMaintenanceIcon from '../../assets/icon/car/car_maintenance.svg';
import CarCarWashIcon from '../../assets/icon/car/car_wash.svg';
import CarIllegalIcon from '../../assets/icon/car/illegal.svg';
import CarCarInsuranceIcon from '../../assets/icon/car/car_insurance.svg';
import CarCarInspectionIcon from '../../assets/icon/car/car_inspection.svg';
import CarCarLoanIcon from '../../assets/icon/car/car_loan.svg';

export const carTypeIconGroup = {
  key: 'car',
  label: '汽车',
  children: [
    {
      value: ICON.car,
      label: ICON.label(ICON.car),
      icon: CarCarIcon,
    },
    {
      value: ICON.refuel,
      label: ICON.label(ICON.refuel),
      icon: CarRefuelIcon,
    },
    {
      value: ICON.carCharge,
      label: ICON.label(ICON.carCharge),
      icon: CarCarChargeIcon,
    },
    {
      value: ICON.parking,
      label: ICON.label(ICON.parking),
      icon: CarParkingIcon,
    },
    {
      value: ICON.toll,
      label: ICON.label(ICON.toll),
      icon: CarTollIcon,
    },
    {
      value: ICON.autoParts,
      label: ICON.label(ICON.autoParts),
      icon: CarAutoPartsIcon,
    },
    {
      value: ICON.repair,
      label: ICON.label(ICON.repair),
      icon: CarRepairIcon,
    },
    {
      value: ICON.carMaintenance,
      label: ICON.label(ICON.carMaintenance),
      icon: CarCarMaintenanceIcon,
    },
    {
      value: ICON.carWash,
      label: ICON.label(ICON.carWash),
      icon: CarCarWashIcon,
    },
    {
      value: ICON.illegal,
      label: ICON.label(ICON.illegal),
      icon: CarIllegalIcon,
    },
    {
      value: ICON.carInsurance,
      label: ICON.label(ICON.carInsurance),
      icon: CarCarInsuranceIcon,
    },
    {
      value: ICON.carInspection,
      label: ICON.label(ICON.carInspection),
      icon: CarCarInspectionIcon,
    },
    {
      value: ICON.carLoan,
      label: ICON.label(ICON.carLoan),
      icon: CarCarLoanIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
