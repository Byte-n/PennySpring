import React from 'react';
import { View } from 'react-native';
import { Input, Text } from '@pennyspring/component';
import { MagnifyingGlassIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function InputPreview() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <Input label="Normal" placeholder="Placeholder" defaultValue="PennySpring" />
          <Input
            clearable
            defaultValue="Search text"
            label="With addons"
            prefix={<MagnifyingGlassIcon color={token.colorIcon} size={token.fontSizeLG} />}
            suffix={<Text color="description">USD</Text>}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Status">
        <View style={styles.stack}>
          <Input label="Error" status="error" errorText="Invalid value" defaultValue="100.00" />
          <Input label="Warning" status="warning" helperText="Please review this value" defaultValue="42" />
          <Input label="Success" status="success" helperText="Looks good" defaultValue="Ready" />
        </View>
      </PreviewSection>

      <PreviewSection title="State">
        <View style={styles.stack}>
          <Input disabled label="Disabled" defaultValue="Disabled value" />
          <Input readonly label="Readonly" defaultValue="Readonly value" />
          <Input loading label="Loading" defaultValue="Checking" />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
