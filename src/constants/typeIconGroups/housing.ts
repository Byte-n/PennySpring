import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import HousingHousingIcon from '../../assets/icon/housing/housing.svg';
import HousingHouseRentIcon from '../../assets/icon/housing/house_rent.svg';
import HousingHouseLoanIcon from '../../assets/icon/housing/house_loan.svg';
import HousingHotelIcon from '../../assets/icon/housing/hotel.svg';

export const housingTypeIconGroup = {
  key: 'housing',
  label: '住房',
  children: [
    {
      value: ICON.housing,
      label: ICON.label(ICON.housing),
      icon: HousingHousingIcon,
    },
    {
      value: ICON.houseRent,
      label: ICON.label(ICON.houseRent),
      icon: HousingHouseRentIcon,
    },
    {
      value: ICON.houseLoan,
      label: ICON.label(ICON.houseLoan),
      icon: HousingHouseLoanIcon,
    },
    {
      value: ICON.hotel,
      label: ICON.label(ICON.hotel),
      icon: HousingHotelIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
