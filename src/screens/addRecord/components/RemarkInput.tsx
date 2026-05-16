import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Input } from '@pennyspring/component';
import { useAddRecordContext } from '../AddRecordContext';

const useStyles = createUseSheetStyle((_token) => ({
  container: {},
}));

export function RemarkInput() {
  const styles = useStyles();
  const { remark, setRemark } = useAddRecordContext();

  return (
    <View style={styles.container}>
      <Input value={remark} onChangeText={setRemark} placeholder="添加备注" />
    </View>
  );
}
