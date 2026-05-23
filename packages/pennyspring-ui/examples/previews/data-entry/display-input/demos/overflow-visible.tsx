import React from 'react';
import { Column, DisplayInput, Text } from '@pennyspring/ui';
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

export const displayInputOverflowVisibleDemoTitle = 'Overflow visible';

export function DisplayInputOverflowVisibleDemo() {
  const styles = useStyles();
  const [_pressedValue, setPressedValue] = React.useState('未点击');

  return (
    <>
      <Column style={styles.stack}>
        <DisplayInput
          display="block"
          label="block + valueText + overflowVisible"
          overflow="visible"
          style={styles.overflowVisible}
          onPress={() =>
            setPressedValue('点击了 block valueText overflowVisible')
          }
          valueText="block 这是一个非常长的文本，用于验证默认最大宽度与超出隐藏行为"
        />
        <DisplayInput
          display="inline"
          label="inline + valueText + overflowVisible"
          overflow="visible"
          style={styles.overflowVisible}
          onPress={() =>
            setPressedValue('点击了 inline valueText overflowVisible')
          }
          valueText="inline 这是一个非常长的文本，用于验证为用于验证为"
        />
        <DisplayInput
          display="block"
          label="block + custom node + overflowVisible"
          style={styles.overflowVisible}
          onPress={() => setPressedValue('点击了 block 节点 overflowVisible')}
        >
          <Text style={styles.customValue}>
            block 自定义节点：这是一个很长的节点文本，用于观察 overflowVisible
            对节点容器的影响
          </Text>
        </DisplayInput>
        <DisplayInput
          display="inline"
          label="inline + custom node + overflowVisible"
          style={styles.overflowVisible}
          onPress={() => setPressedValue('点击了 inline 节点 overflowVisible')}
        >
          <Text color="description" size="sm">
            inline 自定义节点：这是一个很长的节点文本，用于观察 overflowVisible
            对节点容器的影响
          </Text>
        </DisplayInput>
        <Text color="description" size="sm">
          说明：文本截断由内部 Text 的 numberOfLines 控制，overflow
          不会取消省略号。
        </Text>
      </Column>
    </>
  );
}

export default DisplayInputOverflowVisibleDemo;
