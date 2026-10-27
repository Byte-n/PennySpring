import { radioChipDemoTitle, RadioChipDemo } from './chip';
import { radioDarkDemoTitle, RadioDarkDemo } from './dark';
import { radioGroupDemoTitle, RadioGroupDemo } from './group';
import { radioSizeDemoTitle, RadioSizeDemo } from './size';
import { radioSlotsDemoTitle, RadioSlotsDemo } from './slots';
import { radioStatesDemoTitle, RadioStatesDemo } from './states';

export const radioDemos = [
  { id: 'size', title: radioSizeDemoTitle, Component: RadioSizeDemo },
  { id: 'states', title: radioStatesDemoTitle, Component: RadioStatesDemo },
  { id: 'chip', title: radioChipDemoTitle, Component: RadioChipDemo },
  { id: 'group', title: radioGroupDemoTitle, Component: RadioGroupDemo },
  { id: 'slots', title: radioSlotsDemoTitle, Component: RadioSlotsDemo },
  { id: 'dark', title: radioDarkDemoTitle, Component: RadioDarkDemo },
];
