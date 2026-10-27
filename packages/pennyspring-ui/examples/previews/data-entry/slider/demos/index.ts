import {
  sliderAnnotationsDemoTitle,
  SliderAnnotationsDemo,
} from './annotations';
import { sliderDarkDemoTitle, SliderDarkDemo } from './dark';
import { sliderSizeDemoTitle, SliderSizeDemo } from './size';
import { sliderStatesDemoTitle, SliderStatesDemo } from './states';

export const sliderDemos = [
  { id: 'size', title: sliderSizeDemoTitle, Component: SliderSizeDemo },
  { id: 'states', title: sliderStatesDemoTitle, Component: SliderStatesDemo },
  {
    id: 'annotations',
    title: sliderAnnotationsDemoTitle,
    Component: SliderAnnotationsDemo,
  },
  { id: 'dark', title: sliderDarkDemoTitle, Component: SliderDarkDemo },
];
