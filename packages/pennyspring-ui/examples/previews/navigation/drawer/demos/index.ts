import { drawerControlledDemoTitle, DrawerControlledDemo } from './controlled';
import {
  drawerEmbeddedLayoutDemoTitle,
  DrawerEmbeddedLayoutDemo,
} from './embedded-layout';
import { drawerWidthDemoTitle, DrawerWidthDemo } from './width';

export const drawerDemos = [
  {
    id: 'controlled',
    title: drawerControlledDemoTitle,
    Component: DrawerControlledDemo,
  },
  {
    id: 'embedded-layout',
    title: drawerEmbeddedLayoutDemoTitle,
    Component: DrawerEmbeddedLayoutDemo,
  },
  { id: 'width', title: drawerWidthDemoTitle, Component: DrawerWidthDemo },
];
