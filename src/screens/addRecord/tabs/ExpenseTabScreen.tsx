import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Column } from '@pennyspring/component';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/data';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { FieldChips } from '../components/FieldChips';
import { CategoryGrid } from '../components/CategoryGrid';
import { RemarkInput } from '../components/RemarkInput';
import { useCategoryItems } from '../useCategoryItems';

const useStyles = createUseSheetStyle(_token => ({
  container: {
    flex: 1,
  },
}));

export function ExpenseTabScreen() {
  const styles = useStyles();
  const { token } = useTheme();
  const [typeId, setTypeId] = useState<number | null>(null);
  const [assetId, _setAssetId] = useState<number | null>(null);
  const [reimbursable, setReimbursable] = useState<string>('none');
  const { categories } = useCategoryItems(RECORD_TYPE_CATEGORY.expense);

  return (
    <ScrollView style={styles.container}>
      <Column gap={token.marginXS}>
        <AmountDisplay />
        <FieldChips
          tabType="expense"
          assetId={assetId}
          onAssetPress={() => {}}
          reimbursable={reimbursable === 'able'}
          onReimbursableToggle={() =>
            setReimbursable(prev => (prev === 'none' ? 'able' : 'none'))
          }
        />
        <CategoryGrid
          categories={categories}
          selectedId={typeId}
          onSelect={setTypeId}
        />
        <RemarkInput />
      </Column>
    </ScrollView>
  );
}
