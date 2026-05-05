import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import TrafficTrafficIcon from '../../assets/icon/traffic/traffic.svg';
import TrafficBusIcon from '../../assets/icon/traffic/bus.svg';
import TrafficSubwayIcon from '../../assets/icon/traffic/subway.svg';
import TrafficTrainIcon from '../../assets/icon/traffic/train.svg';
import TrafficPlaneIcon from '../../assets/icon/traffic/plane.svg';
import TrafficTaxiIcon from '../../assets/icon/traffic/taxi.svg';
import TrafficShipIcon from '../../assets/icon/traffic/ship.svg';
import TrafficBicycleIcon from '../../assets/icon/traffic/bicycle.svg';

export const trafficTypeIconGroup = {
  key: 'traffic',
  label: '交通',
  children: [
    {
      value: ICON.traffic,
      label: ICON.label(ICON.traffic),
      icon: TrafficTrafficIcon,
    },
    {
      value: ICON.bus,
      label: ICON.label(ICON.bus),
      icon: TrafficBusIcon,
    },
    {
      value: ICON.subway,
      label: ICON.label(ICON.subway),
      icon: TrafficSubwayIcon,
    },
    {
      value: ICON.train,
      label: ICON.label(ICON.train),
      icon: TrafficTrainIcon,
    },
    {
      value: ICON.plane,
      label: ICON.label(ICON.plane),
      icon: TrafficPlaneIcon,
    },
    {
      value: ICON.taxi,
      label: ICON.label(ICON.taxi),
      icon: TrafficTaxiIcon,
    },
    {
      value: ICON.ship,
      label: ICON.label(ICON.ship),
      icon: TrafficShipIcon,
    },
    {
      value: ICON.bicycle,
      label: ICON.label(ICON.bicycle),
      icon: TrafficBicycleIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
