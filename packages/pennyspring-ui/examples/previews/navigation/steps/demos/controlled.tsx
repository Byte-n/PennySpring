import React from 'react';
import { Text, Steps } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
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

const useStyles = createUseSheetStyle(token => ({
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export const stepsControlledDemoTitle = 'Controlled';

export function StepsControlledDemo() {
  const styles = useStyles();
  const [value, setValue] = React.useState(1);
  const [lastPress, setLastPress] = React.useState('No step pressed');

  return (
    <>
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
    </>
  );
}

export default StepsControlledDemo;
