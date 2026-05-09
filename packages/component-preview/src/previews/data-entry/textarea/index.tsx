import React from 'react';
import { View } from 'react-native';
import { Textarea } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function TextareaPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <Textarea
          defaultValue="A multi-line note for preview."
          helperText="Helper text stays below the field."
          label="Note"
          maxLength={140}
          showCount
        />
      </PreviewSection>

      <PreviewSection title="Rows and status">
        <View style={styles.stack}>
          <Textarea label="Small" size="small" minRows={2} placeholder="Small textarea" />
          <Textarea label="Large" size="large" minRows={4} placeholder="Large textarea" />
          <Textarea
            defaultValue="This value needs attention."
            errorText="Please shorten the content."
            label="Error"
            status="error"
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
