import React from 'react';
import { Text, Steps } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { StepsItem } from '@pennyspring/component';

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

const useStyles = createUseSheetStyle(token => ({
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export function StepsPreview() {
  const styles = useStyles();
  const [value, setValue] = React.useState(1);
  const [lastPress, setLastPress] = React.useState('No step pressed');

  return (
    <PreviewScaffold>
      <PreviewSection title="Controlled">
        <Steps
          items={STEP_ITEMS}
          value={value}
          onChange={setValue}
          onPress={(_event, stepIndex, item) => {
            setLastPress(`Pressed ${stepIndex + 1}: ${item.titleText ?? 'step'}`);
          }}
        />
        <Text color="description" size="sm" style={styles.status}>
          {lastPress}
        </Text>
      </PreviewSection>

      <PreviewSection title="Size and status">
        <Steps items={STEP_ITEMS} defaultValue={0} size="small" status="wait" />
        <Steps items={STEP_ITEMS} defaultValue={1} size="normal" status="process" />
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
        <Steps items={STEP_ITEMS} defaultValue={0} disabled />
      </PreviewSection>
    </PreviewScaffold>
  );
}
