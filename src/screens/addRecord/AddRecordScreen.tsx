import React, { useEffect, useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { AddRecordProvider, useAddRecordContext } from './AddRecordContext';
import {
  KeyboardAwareScreen,
  Loading,
  type TabScreen,
  TopTabNavigator,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  RECORD_TYPE_CATEGORY,
  type RecordTypeCategoryValue,
} from '@pennyspring/api';
import { ExpenseTabScreen } from './tabs/ExpenseTabScreen.tsx';
import { IncomeTabScreen } from './tabs/IncomeTabScreen.tsx';
import { TransferTabScreen } from './tabs/TransferTabScreen.tsx';
import { ROOT_ROUTES, type RootStackParamList } from '../../navigation';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';

type AddRecordRoute = RouteProp<RootStackParamList, typeof ROOT_ROUTES.AddRecord>;

const TAB_NAME_BY_CATEGORY: Record<RecordTypeCategoryValue, string> = {
  [RECORD_TYPE_CATEGORY.expense]: 'ExpenseTab',
  [RECORD_TYPE_CATEGORY.income]: 'IncomeTab',
  [RECORD_TYPE_CATEGORY.transfer]: 'TransferTab',
};

export function AddRecordScreen() {
  const route = useRoute<AddRecordRoute>();
  const recordId = route.params?.recordId;
  return (
    <AddRecordProvider>
      <AddRecordContent recordId={recordId} />
    </AddRecordProvider>
  );
}

interface AddRecordContentProps {
  recordId?: number;
}

function AddRecordContent({ recordId }: AddRecordContentProps) {
  const styles = useStyles();
  const { init } = useAddRecordContext();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const [initialRouteName, setInitialRouteName] = useState<string>();
  const [loading, setLoading] = useState(recordId !== undefined);

  useEffect(() => {
    if (recordId === undefined || !currentBook) return;
    let active = true;
    (async () => {
      const detail = await globalApi.record.getDetailById(recordId, currentBook.id);
      const types = await globalApi.type.getAll(currentBook.id);
      const typeRow = types.find(type => type.id === detail.record.typeId);
      if (!active) return;
      init({
        editingRecordId: detail.record.id,
        typeId: detail.record.typeId,
        amount: detail.record.amount,
        remark: detail.record.remark,
        recordTime: detail.record.recordTime,
        tags: detail.tagIds,
        images: detail.imagePaths.map(uri => ({ uri })),
        assetId: detail.record.assetId > 0 ? detail.record.assetId : null,
        intoAssetId: detail.record.intoAssetId > 0 ? detail.record.intoAssetId : null,
        charge: detail.record.charge,
      });
      if (typeRow) {
        setInitialRouteName(TAB_NAME_BY_CATEGORY[typeRow.typeCategory]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [init, recordId, currentBook]);

  if (loading) {
    return <Loading vertical text="加载中" />;
  }

  return (
    <KeyboardAwareScreen>
      <TopTabNavigator
        initialRouteName={initialRouteName}
        screens={ADD_RECORD_TAB_SCREENS}
        styles={{
          sceneContainer: styles.sceneContainer,
        }}
      />
    </KeyboardAwareScreen>
  );
}

const ADD_RECORD_TAB_SCREENS: readonly TabScreen[] = [
  {
    name: 'ExpenseTab',
    label: '支出',
    component: ExpenseTabScreen,
  },
  {
    name: 'IncomeTab',
    label: '收入',
    component: IncomeTabScreen,
  },
  {
    name: 'TransferTab',
    label: '转账',
    component: TransferTabScreen,
  },
];

const useStyles = createUseSheetStyle(token => ({
  sceneContainer: {
    paddingHorizontal: token.paddingContentHorizontal,
  },
}));
