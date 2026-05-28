import React from 'react';
import { Textarea } from '@pennyspring/ui';

export const textareaBasicDemoTitle = 'Basic';

export function TextareaBasicDemo() {
  return (
    <>
      <Textarea
        defaultValue="A multi-line note for preview."
        helperText="Helper text stays below the field."
        labelText="Note"
        maxLength={140}
        showCount
      />
    </>
  );
}

export default TextareaBasicDemo;
