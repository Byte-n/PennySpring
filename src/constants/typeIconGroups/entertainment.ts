import {
  GameControllerIcon,
  JoystickIcon,
  ConfettiIcon,
  FilmSlateIcon,
  MusicNotesIcon,
  MegaphoneIcon,
  AirplaneIcon,
  TicketIcon,
  MoneyWavyIcon,
  PersonSimpleRunIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const entertainmentTypeIconGroup = {
  key: 'entertainment',
  label: '娱乐',
  children: [
    { value: ICON.amusement, label: ICON.label(ICON.amusement), icon: GameControllerIcon },
    { value: ICON.game, label: ICON.label(ICON.game), icon: JoystickIcon },
    { value: ICON.party, label: ICON.label(ICON.party), icon: ConfettiIcon },
    { value: ICON.movie, label: ICON.label(ICON.movie), icon: FilmSlateIcon },
    { value: ICON.sing, label: ICON.label(ICON.sing), icon: MusicNotesIcon },
    { value: ICON.show, label: ICON.label(ICON.show), icon: MegaphoneIcon },
    { value: ICON.travel, label: ICON.label(ICON.travel), icon: AirplaneIcon },
    { value: ICON.tickets, label: ICON.label(ICON.tickets), icon: TicketIcon },
    { value: ICON.excursionFare, label: ICON.label(ICON.excursionFare), icon: MoneyWavyIcon },
    { value: ICON.sport, label: ICON.label(ICON.sport), icon: PersonSimpleRunIcon },
  ],
} as const satisfies TypeIconGroupNode;
