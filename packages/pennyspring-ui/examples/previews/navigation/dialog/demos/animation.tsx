import React, { useState } from 'react';
import { Button, Column, Dialog, Row, Text } from '@pennyspring/ui';

export function DialogAnimationDemo() {
  const [fadeOpen, setFadeOpen] = useState(false);
  const [opacityOpen, setOpacityOpen] = useState(false);

  return (
    <Column gap="normal">
      <Row gap="small">
        <Button onPress={() => setFadeOpen(true)}>Fade 动画</Button>
        <Button onPress={() => setOpacityOpen(true)}>Opacity 动画</Button>
      </Row>

      <Dialog
        animation="fade"
        onOpenChange={setFadeOpen}
        open={fadeOpen}
        titleText="Fade 动画"
      >
        <Text>从底部滑出与退出的动画效果</Text>
      </Dialog>

      <Dialog
        animation="opacity"
        onOpenChange={setOpacityOpen}
        open={opacityOpen}
        titleText="Opacity 动画"
      >
        <Text>透明度渐变的显示与隐藏动画效果</Text>
      </Dialog>
    </Column>
  );
}

export default DialogAnimationDemo;
