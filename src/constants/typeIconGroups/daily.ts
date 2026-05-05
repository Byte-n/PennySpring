import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import DailyDailyNecessitiesIcon from '../../assets/icon/daily/daily_necessities.svg';
import DailyKitchenDailyNecessitiesIcon from '../../assets/icon/daily/kitchen_daily_necessities.svg';
import DailyCommunicationIcon from '../../assets/icon/daily/communication.svg';
import DailyCallChargeIcon from '../../assets/icon/daily/call_charge.svg';
import DailyNetFeeIcon from '../../assets/icon/daily/net_fee.svg';
import DailyLifeIcon from '../../assets/icon/daily/life.svg';
import DailyCleanIcon from '../../assets/icon/daily/clean.svg';
import DailyHaircutIcon from '../../assets/icon/daily/haircut.svg';
import DailyBathIcon from '../../assets/icon/daily/bath.svg';
import DailyExpressIcon from '../../assets/icon/daily/express.svg';

export const dailyTypeIconGroup = {
  key: 'daily',
  label: '日常',
  children: [
    {
      value: ICON.dailyNecessities,
      label: ICON.label(ICON.dailyNecessities),
      icon: DailyDailyNecessitiesIcon,
    },
    {
      value: ICON.kitchenDailyNecessities,
      label: ICON.label(ICON.kitchenDailyNecessities),
      icon: DailyKitchenDailyNecessitiesIcon,
    },
    {
      value: ICON.communication,
      label: ICON.label(ICON.communication),
      icon: DailyCommunicationIcon,
    },
    {
      value: ICON.callCharge,
      label: ICON.label(ICON.callCharge),
      icon: DailyCallChargeIcon,
    },
    {
      value: ICON.netFee,
      label: ICON.label(ICON.netFee),
      icon: DailyNetFeeIcon,
    },
    {
      value: ICON.life,
      label: ICON.label(ICON.life),
      icon: DailyLifeIcon,
    },
    {
      value: ICON.clean,
      label: ICON.label(ICON.clean),
      icon: DailyCleanIcon,
    },
    {
      value: ICON.haircut,
      label: ICON.label(ICON.haircut),
      icon: DailyHaircutIcon,
    },
    {
      value: ICON.bath,
      label: ICON.label(ICON.bath),
      icon: DailyBathIcon,
    },
    {
      value: ICON.express,
      label: ICON.label(ICON.express),
      icon: DailyExpressIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
