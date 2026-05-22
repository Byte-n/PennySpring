import React from 'react';
import { View } from 'react-native';
import { ActionSheet, Button, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { ActionSheetAction } from '@pennyspring/ui';

const ACTIONS: ActionSheetAction[] = [
  { text: 'Edit', description: 'Update this item' },
  { text: 'Share', description: 'Send to teammates' },
  { text: 'Delete', danger: true },
];

const useStyles = createUseSheetStyle(token => ({
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export function ActionSheetPreview() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [eventText, setEventText] = React.useState('No action yet');

  return (
    <PreviewScaffold>
      <PreviewSection title="Open and actions">
        <PreviewRow>
          <Button
            type={open ? 'primary' : 'default'}
            onPress={() => {
              setEventText('Opened action sheet');
              setOpen(true);
            }}
          >
            Open ActionSheet
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Event feedback">
        <View style={styles.status}>
          <Text color="description" size="sm">
            {eventText}
          </Text>
        </View>
      </PreviewSection>

      <ActionSheet
        open={open}
        titleText="Actions"
        cancelText="Cancel"
        actions={ACTIONS}
        onAction={(action, index) => {
          setEventText(`Selected action ${String(index + 1)}: ${action.text}`);
        }}
        onCancel={params => {
          setEventText(`Cancelled by ${params.reason}`);
        }}
        onOpenChange={(nextOpen, params) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setEventText(`Closed by ${params.reason}`);
          }
        }}
      />
    </PreviewScaffold>
  );
}
