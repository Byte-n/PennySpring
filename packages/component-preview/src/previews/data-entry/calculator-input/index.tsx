import React from 'react';
import { View } from 'react-native';
import { CalculatorInput, Input, Text } from '@pennyspring/component';
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
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [popupValue, setPopupValue] = React.useState('30/5+2');
  const [popupDisplayValue, setPopupDisplayValue] = React.useState('');

  return (
    <PreviewScaffold>
      <PreviewSection title="CalculatorInput.Popup">
        <View style={styles.stack}>
          <Input
            readonly
            label="Tap to open calculator"
            placeholder="Select calculated value"
            value={popupDisplayValue}
            onFocus={() => {
              setPopupOpen(true);
            }}
          />
          <CalculatorInput.Popup
            open={popupOpen}
            value={popupValue}
            onChange={setPopupValue}
            onOk={params => {
              setPopupDisplayValue(String(params.result));
            }}
            onOpenChange={setPopupOpen}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <CalculatorInput defaultValue="1+2×3" />
          <CalculatorInput defaultValue="16/" />
        </View>
      </PreviewSection>

      <PreviewSection title="Controlled">
        <View style={styles.stack}>
          <View style={styles.status}>
            <Text color="description" size="sm">
              Expression: {expression || '-'}
            </Text>
            <Text color="description" size="sm">
              Confirmed: {formatOkParams(okParams)}
            </Text>
          </View>
          <CalculatorInput
            value={expression}
            onChange={setExpression}
            onOk={setOkParams}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="State">
        <View style={styles.stack}>
          <Text color="description" size="sm">
            disabled
          </Text>
          <CalculatorInput disabled defaultValue="100+20" />
          <Text color="description" size="sm">
            readonly
          </Text>
          <CalculatorInput readonly defaultValue="88/4" />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
