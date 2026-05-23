import {
  badgeColorAndSizeDemoTitle,
  BadgeColorAndSizeDemo,
} from './color-and-size';
import {
  badgeCountAndDotDemoTitle,
  BadgeCountAndDotDemo,
} from './count-and-dot';
import {
  badgeCustomCountNodeDemoTitle,
  BadgeCustomCountNodeDemo,
} from './custom-count-node';
import { badgeStandaloneDemoTitle, BadgeStandaloneDemo } from './standalone';

export const badgeDemos = [
  {
    id: 'color-and-size',
    title: badgeColorAndSizeDemoTitle,
    Component: BadgeColorAndSizeDemo,
  },
  {
    id: 'count-and-dot',
    title: badgeCountAndDotDemoTitle,
    Component: BadgeCountAndDotDemo,
  },
  {
    id: 'custom-count-node',
    title: badgeCustomCountNodeDemoTitle,
    Component: BadgeCustomCountNodeDemo,
  },
  {
    id: 'standalone',
    title: badgeStandaloneDemoTitle,
    Component: BadgeStandaloneDemo,
  },
];
