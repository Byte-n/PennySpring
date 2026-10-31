import React, { useState } from 'react';
import { Button, ImagePicker, Row, Text } from '@pennyspring/ui';
import type { ImagePickerValue } from '@pennyspring/ui';

export function ImagePickerActionSheetDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<ImagePickerValue[]>([]);

  return (
    <Row align="center" gap="small">
      <Button onPress={() => setOpen(true)}>选择图片</Button>
      <Text color="secondary" size="sm">{`已选 ${value.length} 张`}</Text>
      <ImagePicker.ActionSheet
        maxCount={4}
        multiple
        onChange={setValue}
        onOpenChange={nextOpen => setOpen(nextOpen)}
        open={open}
        sources={['photo', 'camera', 'fileSystem']}
        titleText="添加图片"
        value={value}
      />
    </Row>
  );
}

export default ImagePickerActionSheetDemo;
