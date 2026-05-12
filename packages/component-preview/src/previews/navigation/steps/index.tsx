import React from 'react';
import { Steps } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const STEP_ITEMS = [
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
] as const;

export function StepsPreview() {
  const [value, setValue] = React.useState(1);

  return (
    <PreviewScaffold>
      <PreviewSection title="Controlled">
        <Steps items={[...STEP_ITEMS]} value={value} onChange={setValue} />
      </PreviewSection>

      <PreviewSection title="Size and status">
        <Steps items={[...STEP_ITEMS]} defaultValue={0} size="small" />
        <Steps items={[...STEP_ITEMS]} defaultValue={1} size="normal" status="process" />
        <Steps
          items={[
            STEP_ITEMS[0],
            STEP_ITEMS[1],
            { ...STEP_ITEMS[2], status: 'error' },
          ]}
          defaultValue={2}
          size="large"
        />
      </PreviewSection>

      <PreviewSection title="Readonly and disabled item">
        <Steps
          readonly
          defaultValue={1}
          items={[
            STEP_ITEMS[0],
            { ...STEP_ITEMS[1], disabled: true },
            STEP_ITEMS[2],
          ]}
        />
      </PreviewSection>
    </PreviewScaffold>
  );
}
