import {
  sideBarControlledAndBlockDemoTitle,
  SideBarControlledAndBlockDemo,
} from './controlled-and-block';
import { sideBarDisabledDemoTitle, SideBarDisabledDemo } from './disabled';
import {
  sideBarLayoutAndSizeDemoTitle,
  SideBarLayoutAndSizeDemo,
} from './layout-and-size';

export const sideBarDemos = [
  {
    id: 'controlled-and-block',
    title: sideBarControlledAndBlockDemoTitle,
    Component: SideBarControlledAndBlockDemo,
  },
  {
    id: 'disabled',
    title: sideBarDisabledDemoTitle,
    Component: SideBarDisabledDemo,
  },
  {
    id: 'layout-and-size',
    title: sideBarLayoutAndSizeDemoTitle,
    Component: SideBarLayoutAndSizeDemo,
  },
];
