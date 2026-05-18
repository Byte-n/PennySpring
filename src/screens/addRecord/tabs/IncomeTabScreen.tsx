import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Column } from '@pennyspring/component';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/data';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { FieldChips } from '../components/FieldChips';
import { CategoryGrid } from '../../../component/CategoryGrid';
import { RemarkInput } from '../components/RemarkInput';
import { useCategoryItems } from '../useCategoryItems';

const useStyles = createUseSheetStyle((_token) => ({
  container: {
    flex: 1,
  },
}));

export function IncomeTabScreen() {
  const styles = useStyles();
  const { token } = useTheme();
  const [typeId, setTypeId] = useState<number>();
  const [assetId, _setAssetId] = useState<number | null>(null);
  const { categories } = useCategoryItems(RECORD_TYPE_CATEGORY.income);

  return (
    <ScrollView style={styles.container}>
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
    </ScrollView>
  );
}
