import { textareaBasicDemoTitle, TextareaBasicDemo } from './basic';
import {
  textareaRowsAndStatusDemoTitle,
  TextareaRowsAndStatusDemo,
} from './rows-and-status';

export const textareaDemos = [
  { id: 'basic', title: textareaBasicDemoTitle, Component: TextareaBasicDemo },
  {
    id: 'rows-and-status',
    title: textareaRowsAndStatusDemoTitle,
    Component: TextareaRowsAndStatusDemo,
  },
];
