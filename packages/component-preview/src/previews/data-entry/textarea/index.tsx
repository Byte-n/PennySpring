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
          <Textarea
            label="Large (maxRows)"
            size="large"
            minRows={3}
            maxRows={5}
            placeholder="Large textarea"
            defaultValue={'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6'}
          />
          <Textarea
            defaultValue="This value needs attention."
            errorText="Please shorten the content."
            label="Error"
            status="error"
          />
          <Textarea
            defaultValue="Potential issue needs review."
            helperText="Check the content before submit."
            label="Warning"
            status="warning"
          />
          <Textarea
            defaultValue="Saved successfully."
            helperText="Content is valid."
            label="Success"
            status="success"
          />
          <Textarea label="Required" required placeholder="Required textarea" />
          <Textarea readonly label="Readonly" defaultValue="Readonly content" />
          <Textarea disabled label="Disabled" defaultValue="Disabled content" />
          <Textarea loading label="Loading" defaultValue="Recognizing content..." />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
