import React from 'react';
import { Column, DisplayInput, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginMD,
  },
}));

export function DisplayInputOverflowVisibleDemo() {
  const styles = useStyles();

  return (
    <Column style={styles.stack}>
      <DisplayInput
        display="block"
        labelText="Block overflow visible"
        overflow="visible"
        valueText="block 这是一个非常长的文本，用于验证 overflow visible 时文本完整显示不截断的行为"
      />
      <DisplayInput
        display="inline"
        labelText="Inline overflow visible"
        overflow="visible"
        valueText="inline 这是一个非常长的文本，用于验证 overflow visible 时文本完整显示不截断的行为"
      />
      <DisplayInput
        display="block"
        labelText="Custom node overflow visible"
        overflow="visible"
      >
        <Text>
          自定义节点：这是一个很长的节点文本，用于观察 overflow visible 对节点容器的影响，文本会完整显示不截断
        </Text>
      </DisplayInput>
      <Text color="description" size="sm">
        说明：overflow="visible" 允许内容超出容器边界，文本不截断
      </Text>
    </Column>
  );
}

export default DisplayInputOverflowVisibleDemo;
