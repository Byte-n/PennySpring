import React, { useState } from 'react';
import { Column, KeyboardAwareFormScroll } from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/data';
import { useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { FieldChips } from '../components/FieldChips';
import { CategoryGrid } from '../../../component/CategoryGrid';
import { RemarkInput } from '../components/RemarkInput';
import { useCategoryItems } from '../useCategoryItems';

export function IncomeTabScreen() {
  const { token } = useTheme();
  const [typeId, setTypeId] = useState<number>();
  const [assetId, _setAssetId] = useState<number | null>(null);
  const { categories } = useCategoryItems(RECORD_TYPE_CATEGORY.income);

  return (
    <KeyboardAwareFormScroll
      extraBottomInset={token.paddingXL}
      focusedInputBottomOffset={token.paddingXL}
    >
      <Column gap={token.marginLG}>
        <AmountDisplay />
        <FieldChips
          tabType="income"
          assetId={assetId}
          onAssetPress={() => {}}
        />
        <CategoryGrid categories={categories} value={typeId} onChange={setTypeId} />
        <RemarkInput />
      </Column>
    </KeyboardAwareFormScroll>
  );
}
