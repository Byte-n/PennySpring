import { checkboxChipDemoTitle, CheckboxChipDemo } from './chip';
import { checkboxDarkDemoTitle, CheckboxDarkDemo } from './dark';
import { checkboxGroupDemoTitle, CheckboxGroupDemo } from './group';
import { checkboxSizeDemoTitle, CheckboxSizeDemo } from './size';
import { checkboxSlotsDemoTitle, CheckboxSlotsDemo } from './slots';
import { checkboxStatesDemoTitle, CheckboxStatesDemo } from './states';

export const checkboxDemos = [
  { id: 'size', title: checkboxSizeDemoTitle, Component: CheckboxSizeDemo },
  { id: 'states', title: checkboxStatesDemoTitle, Component: CheckboxStatesDemo },
  { id: 'chip', title: checkboxChipDemoTitle, Component: CheckboxChipDemo },
  { id: 'group', title: checkboxGroupDemoTitle, Component: CheckboxGroupDemo },
  { id: 'slots', title: checkboxSlotsDemoTitle, Component: CheckboxSlotsDemo },
  { id: 'dark', title: checkboxDarkDemoTitle, Component: CheckboxDarkDemo },
];
