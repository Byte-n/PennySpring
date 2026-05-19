import React from 'react';
import { Column, DisplayInput, Icon, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

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

export function DisplayInputPreview() {
  const styles = useStyles();
  const [pressedValue, setPressedValue] = React.useState('未点击');
  const inlineValues = React.useMemo(
    () => ['短文本', '中等长度文本示例', '这是一个更长一点的内联展示文本'],
    [],
  );
  const [inlineValueIndex, setInlineValueIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setInlineValueIndex(
        previousIndex => (previousIndex + 1) % inlineValues.length,
      );
    }, 1200);

    return () => {
      clearInterval(timer);
    };
  }, [inlineValues]);

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <Column style={styles.stack}>
          <DisplayInput
            label="Block (default)"
            onPress={() => setPressedValue('点击了 Block')}
            placeholder="请选择账户"
            valueText="现金账户"
          />
          <DisplayInput
            display="inline"
            label="Inline"
            onPress={() => setPressedValue('点击了 Inline')}
            valueText={inlineValues[inlineValueIndex]}
          />
          <Text color="description" size="sm">
            最近一次点击: {pressedValue}
          </Text>
        </Column>
      </PreviewSection>

      <PreviewSection title="Value text">
        <Column style={styles.stack}>
          <DisplayInput
            label="valueText"
            onPress={() => setPressedValue('点击了 valueText')}
            placeholder="请选择"
            valueText="通过 valueText 展示文本值"
          />
          <DisplayInput
            label="placeholder fallback"
            onPress={() => setPressedValue('点击了 placeholder fallback')}
            placeholder="当未提供 value/valueText 时显示我"
          />
        </Column>
      </PreviewSection>

      <PreviewSection title="Custom value node">
        <Column style={styles.stack}>
          <DisplayInput
            label="value (ReactNode)"
            onPress={() => setPressedValue('点击了 自定义节点')}
            placeholder="这个占位不会显示"
          >
            <Text style={styles.customValue}>自定义节点值</Text>
          </DisplayInput>
          <DisplayInput
            display="inline"
            label="inline custom node"
            onPress={() => setPressedValue('点击了 行内自定义节点')}
          >
            <Text color="description" size="sm">
              行内节点值（可放图标+文本组合）
            </Text>
          </DisplayInput>
        </Column>
      </PreviewSection>

      <PreviewSection title="Overflow">
        <Column style={styles.stack}>
          <DisplayInput
            display="block"
            label="block + valueText (默认截断)"
            onPress={() => setPressedValue('点击了 block valueText 默认截断')}
            valueText="block 这是一个非常长的文本，用于验证默认最大宽度与超出隐藏行为"
          />
          <DisplayInput
            display="inline"
            label="inline + valueText (默认截断)"
            onPress={() => setPressedValue('点击了 inline valueText 默认截断')}
            valueText="inline 这是一个非常长的文本，用于验证为用于验证为"
          />
          <DisplayInput
            display="block"
            label="block + custom node"
            onPress={() => setPressedValue('点击了 block 自定义节点')}
          >
            <Column>
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.customValue}
              >
                block 自定义节点：这是一个很长的节点文本，用于观察节点分支在默认容器下的表现
              </Text>
              <Icon color="colorSuccess" icon="check-circle" size="small" />
            </Column>
          </DisplayInput>
          <DisplayInput
            display="inline"
            label="inline + custom node"
            onPress={() => setPressedValue('点击了 inline 自定义节点')}
          >
            <Column>
              <Text
                color="description"
                ellipsizeMode="tail"
                numberOfLines={1}
                size="sm"
              >
                inline 自定义节点：这是一个很长的节点文本，用于观察节点分支在默认容器下的表现
              </Text>
              <Icon color="colorTextDescription" icon="info" size="small" />
            </Column>
          </DisplayInput>
        </Column>
      </PreviewSection>
      <PreviewSection title="Overflow visible">
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
              block 自定义节点：这是一个很长的节点文本，用于观察 overflowVisible 对节点容器的影响
            </Text>
          </DisplayInput>
          <DisplayInput
            display="inline"
            label="inline + custom node + overflowVisible"
            style={styles.overflowVisible}
            onPress={() => setPressedValue('点击了 inline 节点 overflowVisible')}
          >
            <Text color="description" size="sm">
              inline 自定义节点：这是一个很长的节点文本，用于观察 overflowVisible 对节点容器的影响
            </Text>
          </DisplayInput>
          <Text color="description" size="sm">
            说明：文本截断由内部 Text 的 numberOfLines 控制，overflow 不会取消省略号。
          </Text>
        </Column>
      </PreviewSection>

      <PreviewSection title="State">
        <Column style={styles.stack}>
          <DisplayInput label="Required" required placeholder="必填展示输入" />
          <DisplayInput disabled label="Disabled">
            禁用态
          </DisplayInput>
          <DisplayInput readonly label="Readonly" valueText="只读态" />
          <DisplayInput
            helperText="请确认展示值"
            label="Warning"
            status="warning"
            valueText="待确认状态"
          />
          <DisplayInput
            helperText="状态正常"
            label="Success"
            status="success"
            valueText="已确认状态"
          />
          <DisplayInput
            errorText="请选择有效值"
            label="Error"
            status="error"
            valueText="异常状态"
          />
        </Column>
      </PreviewSection>
    </PreviewScaffold>
  );
}
