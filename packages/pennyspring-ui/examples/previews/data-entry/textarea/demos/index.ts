import { textareaSizeDemoTitle, TextareaSizeDemo } from './size';
import { textareaSlotsDemoTitle, TextareaSlotsDemo } from './slots';
import { textareaStatusDemoTitle, TextareaStatusDemo } from './status';

export const textareaDemos = [
  { id: 'size', title: textareaSizeDemoTitle, Component: TextareaSizeDemo },
  { id: 'status', title: textareaStatusDemoTitle, Component: TextareaStatusDemo },
  { id: 'slots', title: textareaSlotsDemoTitle, Component: TextareaSlotsDemo },
];
