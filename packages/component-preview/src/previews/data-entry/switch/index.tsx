import React from 'react';
import { View } from 'react-native';
import { Switch, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewRow, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function SwitchPreview() {
  const styles = useStyles();
  const [checked, setChecked] = React.useState(true);

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <Switch value={checked} onChange={setChecked} />
          <Text color="description" size="sm">
            Checked: {checked ? 'true' : 'false'}
          </Text>
          <Switch defaultValue />
          <Switch />
        </View>
      </PreviewSection>

      <PreviewSection title="Size and state">
        <View style={styles.stack}>
          <PreviewRow>
            <Switch size="small" defaultValue />
            <Switch size="normal" defaultValue />
            <Switch size="large" defaultValue />
          </PreviewRow>
          <PreviewRow>
            <Switch size="small" disabled defaultValue />
            <Switch size="normal" readonly defaultValue />
            <Switch size="large" disabled />
          </PreviewRow>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
