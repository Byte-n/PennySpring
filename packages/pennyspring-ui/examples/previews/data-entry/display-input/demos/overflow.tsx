import React from 'react';
import { Column, DisplayInput, Icon, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  overflowVisible: {
    overflow: 'visible',
  },
  customValue: {
    color: token.colorSuccessText,
  },
}));

export const displayInputOverflowDemoTitle = 'Overflow';

export function DisplayInputOverflowDemo() {
  const styles = useStyles();
  const [_pressedValue, setPressedValue] = React.useState('未点击');

  return (
    <>
      <Column style={styles.stack}>
        <DisplayInput
          display="block"
          labelText="block + valueText (默认截断)"
          onPress={() => setPressedValue('点击了 block valueText 默认截断')}
          valueText="block 这是一个非常长的文本，用于验证默认最大宽度与超出隐藏行为"
        />
        <DisplayInput
          display="inline"
          labelText="inline + valueText (默认截断)"
          onPress={() => setPressedValue('点击了 inline valueText 默认截断')}
          valueText="inline 这是一个非常长的文本，用于验证为用于验证为"
        />
        <DisplayInput
          display="block"
          labelText="block + custom node"
          onPress={() => setPressedValue('点击了 block 自定义节点')}
        >
          <Column>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={styles.customValue}
            >
              block
              自定义节点：这是一个很长的节点文本，用于观察节点分支在默认容器下的表现
            </Text>
            <Icon color="success" icon="check-circle" size="small" />
          </Column>
        </DisplayInput>
        <DisplayInput
          display="inline"
          labelText="inline + custom node"
          onPress={() => setPressedValue('点击了 inline 自定义节点')}
        >
          <Column>
            <Text
              color="description"
              ellipsizeMode="tail"
              numberOfLines={1}
              size="sm"
            >
              inline
              自定义节点：这是一个很长的节点文本，用于观察节点分支在默认容器下的表现
            </Text>
            <Icon color="textDescription" icon="info" size="small" />
          </Column>
        </DisplayInput>
      </Column>
    </>
  );
}

export default DisplayInputOverflowDemo;
