import React from 'react';
import { Column, DisplayInput, Icon, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  customValue: {
    color: token.colorSuccessText,
  },
}));

export const displayInputCustomValueNodeDemoTitle = 'Custom value node';

export function DisplayInputCustomValueNodeDemo() {
  const styles = useStyles();

  return (
    <Column style={styles.stack}>
      <DisplayInput labelText="Text node">
        <Text style={styles.customValue}>自定义样式的文本节点</Text>
      </DisplayInput>
      <DisplayInput
        display="inline"
        labelText="Icon + Text"
      >
        <Row gap={4}>
          <Icon color="success" icon="check-circle" size="small" />
          <Text color="success" size="sm">
            已完成
          </Text>
        </Row>
      </DisplayInput>
      <DisplayInput labelText="Multi-line node">
        <Column gap={4}>
          <Text weight="medium">主标题</Text>
          <Text color="description" size="sm">
            副标题或详细说明
          </Text>
        </Column>
      </DisplayInput>
    </Column>
  );
}

export default DisplayInputCustomValueNodeDemo;
