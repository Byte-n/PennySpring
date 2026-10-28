import {
  carouselIndicatorsDemoTitle,
  CarouselIndicatorsDemo,
} from './indicators';
import { carouselLayoutDemoTitle, CarouselLayoutDemo } from './layout';
import { carouselStatesDemoTitle, CarouselStatesDemo } from './states';

export const carouselDemos = [
  {
    id: 'indicators',
    title: carouselIndicatorsDemoTitle,
    Component: CarouselIndicatorsDemo,
  },
  {
    id: 'layout',
    title: carouselLayoutDemoTitle,
    Component: CarouselLayoutDemo,
  },
  {
    id: 'states',
    title: carouselStatesDemoTitle,
    Component: CarouselStatesDemo,
  },
];
