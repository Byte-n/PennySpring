import React from 'react';
import { Textarea } from '@pennyspring/ui';
import { useAddRecordContext } from '../AddRecordContext';

export function RemarkInput() {
  const { remark, setRemark } = useAddRecordContext();

  return (
    <Textarea
      label="备注"
      maxRows={4}
      minRows={2}
      onChangeText={setRemark}
      placeholder="添加备注"
      value={remark}
    />
  );
}
