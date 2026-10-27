import { messagePlacementDemoTitle, MessagePlacementDemo } from './placement';
import { messageSlotsDemoTitle, MessageSlotsDemo } from './slots';
import { messageTypesDemoTitle, MessageTypesDemo } from './types';

export const messageDemos = [
  { id: 'types', title: messageTypesDemoTitle, Component: MessageTypesDemo },
  { id: 'slots', title: messageSlotsDemoTitle, Component: MessageSlotsDemo },
  { id: 'placement', title: messagePlacementDemoTitle, Component: MessagePlacementDemo },
];
