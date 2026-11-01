import React from 'react';
import { Button, Empty, Loading, Result } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import type { TypeRow } from '@pennyspring/api';
import {
  CategoryGrid,
  type CategoryItem,
} from '../../../component/CategoryGrid';

interface CategoryFieldProps {
  categories: TypeRow[];
  error?: Error;
  loading: boolean;
  onChange: (id?: number) => void;
  onRetry: () => void;
  value?: number;
}

const useStyles = createUseSheetStyle(token => ({
  state: {
    paddingVertical: token.paddingLG,
  },
}));

export function CategoryField({
  categories,
  error,
  loading,
  onChange,
  onRetry,
  value,
}: CategoryFieldProps) {
  const styles = useStyles();

  if (loading) {
    return <Loading size="small" text="类型加载中" style={styles.state} />;
  }

  if (error) {
    return (
      <Result
        size="small"
        status="error"
        titleText="类型加载失败"
        subtitleText="请检查网络后重试"
        style={styles.state}
        extra={
          <Button size="small" type="primary" onPress={onRetry}>
            重试
          </Button>
        }
      />
    );
  }

  if (categories.length === 0) {
    return (
      <Empty size="small" descriptionText="暂无可用类型" style={styles.state} />
    );
  }

  return (
    <CategoryGrid
      categories={categories as CategoryItem[]}
      value={value}
      onChange={onChange}
    />
  );
}
