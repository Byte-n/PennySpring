import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import EntertainmentAmusementIcon from '../../assets/icon/entertainment/amusement.svg';
import EntertainmentGameIcon from '../../assets/icon/entertainment/game.svg';
import EntertainmentPartyIcon from '../../assets/icon/entertainment/party.svg';
import EntertainmentMovieIcon from '../../assets/icon/entertainment/movie.svg';
import EntertainmentSingIcon from '../../assets/icon/entertainment/sing.svg';
import EntertainmentShowIcon from '../../assets/icon/entertainment/show.svg';
import EntertainmentTravelIcon from '../../assets/icon/entertainment/travel.svg';
import EntertainmentTicketsIcon from '../../assets/icon/entertainment/tickets.svg';
import EntertainmentExcursionFareIcon from '../../assets/icon/entertainment/excursion_fare.svg';
import EntertainmentSportIcon from '../../assets/icon/entertainment/sport.svg';

export const entertainmentTypeIconGroup = {
  key: 'entertainment',
  label: '娱乐',
  children: [
    {
      value: ICON.amusement,
      label: ICON.label(ICON.amusement),
      icon: EntertainmentAmusementIcon,
    },
    {
      value: ICON.game,
      label: ICON.label(ICON.game),
      icon: EntertainmentGameIcon,
    },
    {
      value: ICON.party,
      label: ICON.label(ICON.party),
      icon: EntertainmentPartyIcon,
    },
    {
      value: ICON.movie,
      label: ICON.label(ICON.movie),
      icon: EntertainmentMovieIcon,
    },
    {
      value: ICON.sing,
      label: ICON.label(ICON.sing),
      icon: EntertainmentSingIcon,
    },
    {
      value: ICON.show,
      label: ICON.label(ICON.show),
      icon: EntertainmentShowIcon,
    },
    {
      value: ICON.travel,
      label: ICON.label(ICON.travel),
      icon: EntertainmentTravelIcon,
    },
    {
      value: ICON.tickets,
      label: ICON.label(ICON.tickets),
      icon: EntertainmentTicketsIcon,
    },
    {
      value: ICON.excursionFare,
      label: ICON.label(ICON.excursionFare),
      icon: EntertainmentExcursionFareIcon,
    },
    {
      value: ICON.sport,
      label: ICON.label(ICON.sport),
      icon: EntertainmentSportIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
