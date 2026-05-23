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

export const stepsSizeAndStatusDemoTitle = 'Size and status';

export function StepsSizeAndStatusDemo() {
  return (
    <>
      <Steps items={STEP_ITEMS} defaultValue={0} size="small" status="wait" />
      <Steps
        items={STEP_ITEMS}
        defaultValue={1}
        size="normal"
        status="process"
      />
      <Steps
        items={[
          STEP_ITEMS[0],
          STEP_ITEMS[1],
          { ...STEP_ITEMS[2], status: 'error' },
        ]}
        defaultValue={2}
        size="large"
      />
    </>
  );
}

export default StepsSizeAndStatusDemo;
