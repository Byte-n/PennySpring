import { buttonBlockDemoTitle, ButtonBlockDemo } from './block';
import {
  buttonColorAndVariantDemoTitle,
  ButtonColorAndVariantDemo,
} from './color-and-variant';
import {
  buttonIconAndStateDemoTitle,
  ButtonIconAndStateDemo,
} from './icon-and-state';
import {
  buttonSizeAndShapeDemoTitle,
  ButtonSizeAndShapeDemo,
} from './size-and-shape';
import { buttonTypeDemoTitle, ButtonTypeDemo } from './type';

export const buttonDemos = [
  { id: 'block', title: buttonBlockDemoTitle, Component: ButtonBlockDemo },
  {
    id: 'color-and-variant',
    title: buttonColorAndVariantDemoTitle,
    Component: ButtonColorAndVariantDemo,
  },
  {
    id: 'icon-and-state',
    title: buttonIconAndStateDemoTitle,
    Component: ButtonIconAndStateDemo,
  },
  {
    id: 'size-and-shape',
    title: buttonSizeAndShapeDemoTitle,
    Component: ButtonSizeAndShapeDemo,
  },
  { id: 'type', title: buttonTypeDemoTitle, Component: ButtonTypeDemo },
];
