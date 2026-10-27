import { switchDarkDemoTitle, SwitchDarkDemo } from './dark';
import { switchRowDemoTitle, SwitchRowDemo } from './row';
import { switchSizeDemoTitle, SwitchSizeDemo } from './size';
import { switchStatesDemoTitle, SwitchStatesDemo } from './states';

export const switchDemos = [
  { id: 'size', title: switchSizeDemoTitle, Component: SwitchSizeDemo },
  { id: 'states', title: switchStatesDemoTitle, Component: SwitchStatesDemo },
  { id: 'row', title: switchRowDemoTitle, Component: SwitchRowDemo },
  { id: 'dark', title: switchDarkDemoTitle, Component: SwitchDarkDemo },
];
