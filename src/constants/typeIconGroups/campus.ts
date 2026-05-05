import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import CampusBooksEducationIcon from '../../assets/icon/campus/books_education.svg';
import CampusStudyIcon from '../../assets/icon/campus/study.svg';
import CampusStationeryIcon from '../../assets/icon/campus/stationery.svg';
import CampusExamIcon from '../../assets/icon/campus/exam.svg';
import CampusBooksIcon from '../../assets/icon/campus/books.svg';
import CampusTrainingIcon from '../../assets/icon/campus/training.svg';

export const campusTypeIconGroup = {
  key: 'campus',
  label: '校园',
  children: [
    {
      value: ICON.booksEducation,
      label: ICON.label(ICON.booksEducation),
      icon: CampusBooksEducationIcon,
    },
    {
      value: ICON.study,
      label: ICON.label(ICON.study),
      icon: CampusStudyIcon,
    },
    {
      value: ICON.stationery,
      label: ICON.label(ICON.stationery),
      icon: CampusStationeryIcon,
    },
    {
      value: ICON.exam,
      label: ICON.label(ICON.exam),
      icon: CampusExamIcon,
    },
    {
      value: ICON.books,
      label: ICON.label(ICON.books),
      icon: CampusBooksIcon,
    },
    {
      value: ICON.training,
      label: ICON.label(ICON.training),
      icon: CampusTrainingIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
