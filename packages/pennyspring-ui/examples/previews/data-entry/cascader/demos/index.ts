import {
  cascaderOpenAndStateDemoTitle,
  CascaderOpenAndStateDemo,
} from './open-and-state';
import { cascaderSizeDemoTitle, CascaderSizeDemo } from './size';
import { cascaderTriggerDemoTitle, CascaderTriggerDemo } from './trigger';

export const cascaderDemos = [
  {
    id: 'open-and-state',
    title: cascaderOpenAndStateDemoTitle,
    Component: CascaderOpenAndStateDemo,
  },
  { id: 'size', title: cascaderSizeDemoTitle, Component: CascaderSizeDemo },
  {
    id: 'trigger',
    title: cascaderTriggerDemoTitle,
    Component: CascaderTriggerDemo,
  },
];
