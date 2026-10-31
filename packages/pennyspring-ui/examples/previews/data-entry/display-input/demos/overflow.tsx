import React from 'react';
import { Column, DisplayInput, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function DisplayInputOverflowDemo() {
  const styles = useStyles();

  return (
    <Column style={styles.stack}>
      <DisplayInput
        display="block"
        labelText="Block long text"
        valueText="block 这是一个非常长的文本，用于验证默认最大宽度与超出隐藏行为"
      />
      <DisplayInput
        display="inline"
        labelText="Inline long text"
        valueText="inline 这是一个非常长的文本，用于验证默认截断行为"
      />
      <DisplayInput
        display="block"
        labelText="Block custom node"
      >
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          自定义节点：这是一个很长的节点文本，用于观察节点分支在默认容器下的表现
        </Text>
      </DisplayInput>
    </Column>
  );
}

export default DisplayInputOverflowDemo;
