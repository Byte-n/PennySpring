import { inputBasicDemoTitle, InputBasicDemo } from './basic';
import { inputSearchDemoTitle, InputSearchDemo } from './search';
import { inputSizeDemoTitle, InputSizeDemo } from './size';
import { inputStateDemoTitle, InputStateDemo } from './state';
import { inputStatusDemoTitle, InputStatusDemo } from './status';

export const inputDemos = [
  { id: 'basic', title: inputBasicDemoTitle, Component: InputBasicDemo },
  { id: 'size', title: inputSizeDemoTitle, Component: InputSizeDemo },
  { id: 'search', title: inputSearchDemoTitle, Component: InputSearchDemo },
  { id: 'state', title: inputStateDemoTitle, Component: InputStateDemo },
  { id: 'status', title: inputStatusDemoTitle, Component: InputStatusDemo },
];
