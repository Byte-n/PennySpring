import React from 'react';
import { View } from 'react-native';
import { CalculatorInput, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { CalculatorInputOkParams } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

function formatOkParams(params: CalculatorInputOkParams | null): string {
  if (params === null) {
    return '-';
  }

  return `${params.expression} = ${params.result}`;
}

export function CalculatorInputPreview() {
  const styles = useStyles();
  const [expression, setExpression] = React.useState('12+8/2');
  const [okParams, setOkParams] = React.useState<CalculatorInputOkParams | null>(null);

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <CalculatorInput defaultValue="1+2×3" />
          <CalculatorInput defaultValue="16/" />
        </View>
      </PreviewSection>

      <PreviewSection title="Controlled">
        <View style={styles.stack}>
          <CalculatorInput
            value={expression}
            onChange={setExpression}
            onOk={setOkParams}
          />
          <View style={styles.status}>
            <Text color="description" size="sm">
              Expression: {expression || '-'}
            </Text>
            <Text color="description" size="sm">
              Confirmed: {formatOkParams(okParams)}
            </Text>
          </View>
        </View>
      </PreviewSection>

      <PreviewSection title="State">
        <View style={styles.stack}>
          <CalculatorInput disabled defaultValue="100+20" />
          <CalculatorInput readonly defaultValue="88/4" />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
