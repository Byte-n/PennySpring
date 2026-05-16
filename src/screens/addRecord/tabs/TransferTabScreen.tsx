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

const useStyles = createUseSheetStyle((_token) => ({
  container: {
    flex: 1,
  },
}));

export function TransferTabScreen() {
  const styles = useStyles();
  const { token } = useTheme();
  const [typeId, setTypeId] = useState<number | null>(null);
  const [assetId, _setAssetId] = useState<number | null>(null);
  const [intoAssetId, _setIntoAssetId] = useState<number | null>(null);
  const [charge, _setCharge] = useState<number | undefined>(undefined);
  const categories = useCategoryItems(RECORD_TYPE_CATEGORY.transfer);

  return (
    <ScrollView style={styles.container}>
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
        <CategoryGrid categories={categories} selectedId={typeId} onSelect={setTypeId} />
        <RemarkInput />
      </Column>
    </ScrollView>
  );
}
