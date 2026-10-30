import { formBasicDemoTitle, FormBasicDemo } from './basic';
import { FormCompoundDemo, formCompoundDemoTitle } from './compound';
import {
  FormDependenciesDemo,
  formDependenciesDemoTitle,
} from './dependencies';
import { FormFeedbackDemo, formFeedbackDemoTitle } from './feedback';
import { FormHorizontalDemo, formHorizontalDemoTitle } from './horizontal';
import { FormPickerDemo, formPickerDemoTitle } from './picker';
import { FormValidationDemo, formValidationDemoTitle } from './validation';

export const formDemos = [
  { id: 'basic', title: formBasicDemoTitle, Component: FormBasicDemo },
  {
    id: 'horizontal',
    title: formHorizontalDemoTitle,
    Component: FormHorizontalDemo,
  },
  {
    id: 'validation',
    title: formValidationDemoTitle,
    Component: FormValidationDemo,
  },
  {
    id: 'dependencies',
    title: formDependenciesDemoTitle,
    Component: FormDependenciesDemo,
  },
  { id: 'feedback', title: formFeedbackDemoTitle, Component: FormFeedbackDemo },
  { id: 'picker', title: formPickerDemoTitle, Component: FormPickerDemo },
  {
    id: 'compound',
    title: formCompoundDemoTitle,
    Component: FormCompoundDemo,
  },
];
