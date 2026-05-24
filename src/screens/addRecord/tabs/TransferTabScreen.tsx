import React, { useState } from 'react';
import { Column, KeyboardAwareFormScroll } from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/data';
import { useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { FieldChips } from '../components/FieldChips';
import { CategoryGrid } from '../../../component/CategoryGrid';
import { RemarkInput } from '../components/RemarkInput';
import { useCategoryItems } from '../useCategoryItems';

export function TransferTabScreen() {
  const { token } = useTheme();
  const [typeId, setTypeId] = useState<number>();
  const [assetId, _setAssetId] = useState<number | null>(null);
  const [intoAssetId, _setIntoAssetId] = useState<number | null>(null);
  const [charge, _setCharge] = useState<number | undefined>(undefined);
  const { categories } = useCategoryItems(RECORD_TYPE_CATEGORY.transfer);

  return (
    <KeyboardAwareFormScroll
      extraBottomInset={token.paddingXL}
      focusedInputBottomOffset={token.paddingXL}
    >
      <Column gap={token.marginLG}>
        <AmountDisplay />
        <FieldChips
          tabType="transfer"
          assetId={assetId}
          onAssetPress={() => {}}
          intoAssetId={intoAssetId}
          onIntoAssetPress={() => {}}
          charge={charge}
          onChargePress={() => {}}
        />
        <CategoryGrid categories={categories} value={typeId} onChange={setTypeId} />
        <RemarkInput />
      </Column>
    </KeyboardAwareFormScroll>
  );
}
