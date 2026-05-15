import {
  GraduationCapIcon,
  BookOpenIcon,
  PencilRulerIcon,
  ExamIcon,
  BooksIcon,
  ChalkboardIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const campusTypeIconGroup = {
  key: 'campus',
  label: '校园',
  children: [
    { value: ICON.booksEducation, label: ICON.label(ICON.booksEducation), icon: GraduationCapIcon },
    { value: ICON.study, label: ICON.label(ICON.study), icon: BookOpenIcon },
    { value: ICON.stationery, label: ICON.label(ICON.stationery), icon: PencilRulerIcon },
    { value: ICON.exam, label: ICON.label(ICON.exam), icon: ExamIcon },
    { value: ICON.books, label: ICON.label(ICON.books), icon: BooksIcon },
    { value: ICON.training, label: ICON.label(ICON.training), icon: ChalkboardIcon },
  ],
} as const satisfies TypeIconGroupNode;
