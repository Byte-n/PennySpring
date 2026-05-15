import {
  TrafficSignalIcon,
  BusIcon,
  SubwayIcon,
  TrainIcon,
  AirplaneTiltIcon,
  TaxiIcon,
  BoatIcon,
  BicycleIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const trafficTypeIconGroup = {
  key: 'traffic',
  label: '交通',
  children: [
    { value: ICON.traffic, label: ICON.label(ICON.traffic), icon: TrafficSignalIcon },
    { value: ICON.bus, label: ICON.label(ICON.bus), icon: BusIcon },
    { value: ICON.subway, label: ICON.label(ICON.subway), icon: SubwayIcon },
    { value: ICON.train, label: ICON.label(ICON.train), icon: TrainIcon },
    { value: ICON.plane, label: ICON.label(ICON.plane), icon: AirplaneTiltIcon },
    { value: ICON.taxi, label: ICON.label(ICON.taxi), icon: TaxiIcon },
    { value: ICON.ship, label: ICON.label(ICON.ship), icon: BoatIcon },
    { value: ICON.bicycle, label: ICON.label(ICON.bicycle), icon: BicycleIcon },
  ],
} as const satisfies TypeIconGroupNode;
