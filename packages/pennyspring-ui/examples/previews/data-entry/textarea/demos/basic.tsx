import React from 'react';
import { Input } from '@pennyspring/ui';

export const textareaBasicDemoTitle = 'Basic';

export function TextareaBasicDemo() {
  return (
    <>
      <Input
        defaultValue="A multi-line note for preview."
        helperText="Helper text stays below the field."
        labelText="Note"
        maxLength={140}
        multiline
        numberOfLines={4}
      />
    </>
  );
}

export default TextareaBasicDemo;
