import React from 'react';
import { Alert } from 'react-native';
import { Row, Tag } from '@pennyspring/component';
import { useTheme } from '@pennyspring/theme';
import { useAddRecordContext } from '../AddRecordContext';

interface FieldChipsProps {
  tabType: 'expense' | 'income' | 'transfer';
  assetId?: number | null;
  onAssetPress?: () => void;
  intoAssetId?: number | null;
  onIntoAssetPress?: () => void;
  reimbursable?: boolean;
  onReimbursableToggle?: () => void;
  charge?: number;
  onChargePress?: () => void;
}

export function FieldChips(props: FieldChipsProps) {
  const {
    tabType,
    onAssetPress,
    onIntoAssetPress,
    reimbursable,
    onReimbursableToggle,
    charge,
    onChargePress,
  } = props;

  const { recordTime } = useAddRecordContext();
  const { token } = useTheme();

  const formatTime = (time: number) => {
    return new Date(time).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImagePress = () => {
    Alert.alert('提示', '等待开发');
  };

  const renderExpenseChips = () => (
    <>
      <Tag onPress={onAssetPress}>资产</Tag>
      <Tag>{formatTime(recordTime)}</Tag>
      <Tag
        variant={reimbursable ? 'solid' : 'outlined'}
        onPress={onReimbursableToggle}
      >
        可报销
      </Tag>
      <Tag>标签</Tag>
      <Tag onPress={handleImagePress}>图片</Tag>
    </>
  );

  const renderIncomeChips = () => (
    <>
      <Tag onPress={onAssetPress}>资产</Tag>
      <Tag>{formatTime(recordTime)}</Tag>
      <Tag>标签</Tag>
      <Tag onPress={handleImagePress}>图片</Tag>
    </>
  );

  const renderTransferChips = () => (
    <>
      <Tag onPress={onAssetPress}>转出资产</Tag>
      <Tag onPress={onIntoAssetPress}>转入资产</Tag>
      <Tag>{formatTime(recordTime)}</Tag>
      <Tag onPress={onChargePress}>
        {charge !== undefined ? `手续费 ${charge}` : '手续费'}
      </Tag>
      <Tag>标签</Tag>
      <Tag onPress={handleImagePress}>图片</Tag>
    </>
  );

  return (
    <Row wrap gap={token.marginXS}>
      {tabType === 'expense' && renderExpenseChips()}
      {tabType === 'income' && renderIncomeChips()}
      {tabType === 'transfer' && renderTransferChips()}
    </Row>
  );
}
