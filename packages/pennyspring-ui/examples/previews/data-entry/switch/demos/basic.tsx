import React from 'react';
import { View } from 'react-native';
import { Switch, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const switchBasicDemoTitle = 'Basic';

export function SwitchBasicDemo() {
  const styles = useStyles();
  const [checked, setChecked] = React.useState(true);

  return (
    <>
      <View style={styles.stack}>
        <Switch value={checked} onChange={setChecked} />
        <Text color="description" size="sm">
          Checked: {checked ? 'true' : 'false'}
        </Text>
        <Switch defaultValue />
        <Switch />
      </View>
    </>
  );
}

export default SwitchBasicDemo;
