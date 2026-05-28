import React from 'react';
import { View } from 'react-native';
import { Input } from '@pennyspring/ui';
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
        <Input
          labelText="Small"
          size="small"
          multiline
          numberOfLines={2}
          placeholder="Small textarea"
        />
        <Input
          labelText="Large"
          size="large"
          multiline
          numberOfLines={5}
          placeholder="Large textarea"
          defaultValue={'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6'}
        />
        <Input
          defaultValue="This value needs attention."
          errorText="Please shorten the content."
          labelText="Error"
          status="error"
        />
        <Input
          defaultValue="Potential issue needs review."
          helperText="Check the content before submit."
          labelText="Warning"
          status="warning"
        />
        <Input
          defaultValue="Saved successfully."
          helperText="Content is valid."
          labelText="Success"
          status="success"
        />
        <Input labelText="Required" required placeholder="Required textarea" />
        <Input readonly labelText="Readonly" defaultValue="Readonly content" />
        <Input disabled labelText="Disabled" defaultValue="Disabled content" />
        <Input
          loading
          labelText="Loading"
          defaultValue="Recognizing content..."
        />
      </View>
    </>
  );
}

export default TextareaRowsAndStatusDemo;
