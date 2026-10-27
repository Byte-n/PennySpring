import { buttonBlockDemoTitle, ButtonBlockDemo } from './block';
import { buttonPresetDemoTitle, ButtonPresetDemo } from './preset';
import { buttonSizeAndShapeDemoTitle, ButtonSizeAndShapeDemo } from './size-and-shape';
import { buttonStateDemoTitle, ButtonStateDemo } from './state';
import { buttonTypeDemoTitle, ButtonTypeDemo } from './type';
import { buttonVariantDemoTitle, ButtonVariantDemo } from './variant';

export const buttonDemos = [
  { id: 'type', title: buttonTypeDemoTitle, Component: ButtonTypeDemo },
  { id: 'variant', title: buttonVariantDemoTitle, Component: ButtonVariantDemo },
  {
    id: 'size-and-shape',
    title: buttonSizeAndShapeDemoTitle,
    Component: ButtonSizeAndShapeDemo,
  },
  { id: 'state', title: buttonStateDemoTitle, Component: ButtonStateDemo },
  { id: 'preset', title: buttonPresetDemoTitle, Component: ButtonPresetDemo },
  { id: 'block', title: buttonBlockDemoTitle, Component: ButtonBlockDemo },
];
