import React from 'react';
import { View } from 'react-native';
import { Input, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function InputPasswordDemo() {
  const styles = useStyles();

  return (
    <View style={styles.stack}>
      <Input.Password labelText="Password" placeholder="请输入密码" />
      <Input.Password
        defaultValue="PennySpring"
        labelText="带后缀"
        suffix={<Text color="description">已保存</Text>}
      />
      <Input.Password
        allowClear
        defaultValue="PennySpring"
        labelText="动作位（显隐优先）"
      />
      <Input.Password
        allowClear
        defaultValue="PennySpring"
        labelText="关闭切换后显示清除"
        visibilityToggle={false}
      />
    </View>
  );
}

export default InputPasswordDemo;
