import {
  BaseballCapIcon,
  HoodieIcon,
  PantsIcon,
  TShirtIcon,
  HandbagIcon,
  SneakerIcon,
  SockIcon,
  WatchIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const dressTypeIconGroup = {
  key: 'dress',
  label: '服饰',
  children: [
    { value: ICON.hat, label: ICON.label(ICON.hat), icon: BaseballCapIcon },
    { value: ICON.coat, label: ICON.label(ICON.coat), icon: HoodieIcon },
    { value: ICON.pants, label: ICON.label(ICON.pants), icon: PantsIcon },
    { value: ICON.underwear, label: ICON.label(ICON.underwear), icon: TShirtIcon },
    { value: ICON.bag, label: ICON.label(ICON.bag), icon: HandbagIcon },
    { value: ICON.shoes, label: ICON.label(ICON.shoes), icon: SneakerIcon },
    { value: ICON.socks, label: ICON.label(ICON.socks), icon: SockIcon },
    { value: ICON.accessories, label: ICON.label(ICON.accessories), icon: WatchIcon },
  ],
} as const satisfies TypeIconGroupNode;
