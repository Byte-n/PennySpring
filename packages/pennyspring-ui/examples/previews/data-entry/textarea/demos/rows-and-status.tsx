import React from 'react';
import { View } from 'react-native';
import { Textarea } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const textareaRowsAndStatusDemoTitle = 'Rows and status';

export function TextareaRowsAndStatusDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Textarea
          labelText="Small"
          size="small"
          minRows={2}
          placeholder="Small textarea"
        />
        <Textarea
          labelText="Large (maxRows)"
          size="large"
          minRows={3}
          maxRows={5}
          placeholder="Large textarea"
          defaultValue={'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6'}
        />
        <Textarea
          defaultValue="This value needs attention."
          errorText="Please shorten the content."
          labelText="Error"
          status="error"
        />
        <Textarea
          defaultValue="Potential issue needs review."
          helperText="Check the content before submit."
          labelText="Warning"
          status="warning"
        />
        <Textarea
          defaultValue="Saved successfully."
          helperText="Content is valid."
          labelText="Success"
          status="success"
        />
        <Textarea labelText="Required" required placeholder="Required textarea" />
        <Textarea readonly labelText="Readonly" defaultValue="Readonly content" />
        <Textarea disabled labelText="Disabled" defaultValue="Disabled content" />
        <Textarea
          loading
          labelText="Loading"
          defaultValue="Recognizing content..."
        />
      </View>
    </>
  );
}

export default TextareaRowsAndStatusDemo;
