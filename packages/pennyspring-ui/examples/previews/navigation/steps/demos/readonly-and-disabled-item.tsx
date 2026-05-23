import React from 'react';
import { Steps } from '@pennyspring/ui';
import type { StepsItem } from '@pennyspring/ui';

const STEP_ITEMS: StepsItem[] = [
  {
    key: 'create',
    titleText: 'Create plan',
    descriptionText: 'Define categories and budget goals',
  },
  {
    key: 'review',
    titleText: 'Review details',
    descriptionText: 'Validate monthly records',
  },
  {
    key: 'confirm',
    titleText: 'Confirm',
    descriptionText: 'Submit and notify team',
  },
];

export const stepsReadonlyAndDisabledItemDemoTitle =
  'Readonly and disabled item';

export function StepsReadonlyAndDisabledItemDemo() {
  return (
    <>
      <Steps
        readonly
        defaultValue={1}
        items={[
          STEP_ITEMS[0],
          { ...STEP_ITEMS[1], disabled: true },
          STEP_ITEMS[2],
        ]}
      />
      <Steps items={STEP_ITEMS} defaultValue={0} disabled />
    </>
  );
}

export default StepsReadonlyAndDisabledItemDemo;
