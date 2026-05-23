import { textColorDemoTitle, TextColorDemo } from './color';
import { textSizeDemoTitle, TextSizeDemo } from './size';
import { textWeightDemoTitle, TextWeightDemo } from './weight';

export const textDemos = [
  { id: 'color', title: textColorDemoTitle, Component: TextColorDemo },
  { id: 'size', title: textSizeDemoTitle, Component: TextSizeDemo },
  { id: 'weight', title: textWeightDemoTitle, Component: TextWeightDemo },
];
