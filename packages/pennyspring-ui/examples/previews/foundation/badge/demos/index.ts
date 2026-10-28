import {
  badgeAnchoredDemoTitle,
  BadgeAnchoredDemo,
} from './anchored';
import { badgeColorDemoTitle, BadgeColorDemo } from './color';
import {
  badgeDotAndOverflowDemoTitle,
  BadgeDotAndOverflowDemo,
} from './dot-and-overflow';
import { badgeSizeDemoTitle, BadgeSizeDemo } from './size';

export const badgeDemos = [
  { id: 'size', title: badgeSizeDemoTitle, Component: BadgeSizeDemo },
  { id: 'color', title: badgeColorDemoTitle, Component: BadgeColorDemo },
  {
    id: 'dot-and-overflow',
    title: badgeDotAndOverflowDemoTitle,
    Component: BadgeDotAndOverflowDemo,
  },
  { id: 'anchored', title: badgeAnchoredDemoTitle, Component: BadgeAnchoredDemo },
];
