import React, { useState } from 'react';
import { Column, KeyboardAwareFormScroll } from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/data';
import { useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { FieldChips } from '../components/FieldChips';
import { CategoryGrid } from '../../../component/CategoryGrid';
import { RemarkInput } from '../components/RemarkInput';
import { useCategoryItems } from '../useCategoryItems';

export function ExpenseTabScreen() {
  const { token } = useTheme();
  const [typeId, setTypeId] = useState<number>();
  const [assetId, _setAssetId] = useState<number | null>(null);
  const [reimbursable, setReimbursable] = useState<string>('none');
  const { categories } = useCategoryItems(RECORD_TYPE_CATEGORY.expense);

  return (
    <KeyboardAwareFormScroll
      extraBottomInset={token.paddingXL}
      focusedInputBottomOffset={token.paddingXL}
    >
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
          value={typeId}
          onChange={setTypeId}
        />
        <RemarkInput />
      </Column>
    </KeyboardAwareFormScroll>
  );
}
