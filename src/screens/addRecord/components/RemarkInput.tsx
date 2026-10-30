import React from 'react';
import { Textarea } from '@pennyspring/ui';
import { useAddRecordContext } from '../AddRecordContext';

export function RemarkInput() {
  const { remark, setRemark } = useAddRecordContext();

  return (
    <Textarea
      maxRows={4}
      minRows={2}
      onChange={setRemark}
      placeholder="添加备注"
      value={remark}
    />
  );
}
