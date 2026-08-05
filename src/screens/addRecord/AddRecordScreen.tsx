import React, { useEffect, useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import {
  AddRecordProvider,
  useAddRecordContext,
  type AddRecordPresetPayload,
  type AddRecordTemplatePayload,
} from './AddRecordContext';
import {
  Input,
  KeyboardAwareScreen,
  Loading,
} from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider, useTheme } from '@pennyspring/theme';
import {
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
  type RecordTypeCategoryValue,
} from '@pennyspring/api';
import { ExpenseTabScreen } from './tabs/ExpenseTabScreen.tsx';
import { IncomeTabScreen } from './tabs/IncomeTabScreen.tsx';
import { TransferTabScreen } from './tabs/TransferTabScreen.tsx';
import { ROOT_ROUTES, type RootStackParamList } from '../../navigation';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { TabScreen, TopTabNavigator } from '../../component/TopTabNavigator';

type AddRecordRoute = RouteProp<RootStackParamList, typeof ROOT_ROUTES.AddRecord>;

const TAB_NAME_BY_CATEGORY: Record<RecordTypeCategoryValue, string> = {
  [RECORD_TYPE_CATEGORY.expense]: 'ExpenseTab',
  [RECORD_TYPE_CATEGORY.income]: 'IncomeTab',
  [RECORD_TYPE_CATEGORY.transfer]: 'TransferTab',
};

const TAB_COLORS = ['red10', 'green10', 'blue10'] as const;

export function AddRecordScreen() {
  const route = useRoute<AddRecordRoute>();
  const recordId = route.params?.recordId;
  const preset = route.params?.preset;
  const template = route.params?.template;
  const templatePayload = route.params?.templatePayload;
  return (
    <AddRecordProvider>
      <AddRecordContent
        recordId={recordId}
        preset={preset}
        template={template}
        templatePayload={templatePayload}
      />
    </AddRecordProvider>
  );
}

interface AddRecordContentProps {
  recordId?: number;
  preset?: AddRecordPresetPayload;
  template?: boolean;
  templatePayload?: AddRecordTemplatePayload;
}

function AddRecordContent({
  recordId,
  preset,
  template: isTemplateFlow,
  templatePayload,
}: AddRecordContentProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const {
    init,
    initFromPreset,
    initFromTemplate,
    initBlankTemplate,
    template: isTemplateMode,
    templateName,
    setTemplateName,
  } = useAddRecordContext();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const [initialRouteName, setInitialRouteName] = useState<string>();
  const [loading, setLoading] = useState(
    recordId !== undefined || preset !== undefined || isTemplateFlow === true,
  );
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

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
        reimbursable: detail.record.reimbursable === REIMBURSABLE.reimbursable,
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

  // 快捷模板预填：以模板进入「编辑后新建」，mode 始终为 create，recordTime 取当前时刻。
  useEffect(() => {
    if (recordId !== undefined || preset === undefined || !currentBook) return;
    let active = true;
    (async () => {
      const types = await globalApi.type.getAll(currentBook.id);
      if (!active) return;
      initFromPreset(preset);
      const typeRow = types.find(type => type.id === preset.typeId);
      if (typeRow) {
        setInitialRouteName(TAB_NAME_BY_CATEGORY[typeRow.typeCategory]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [initFromPreset, preset, recordId, currentBook, globalApi]);

  // 模板编辑/新增：复用 AddRecord 表单。mode 始终为 create，不写记录而写模板 store。
  useEffect(() => {
    if (!isTemplateFlow) {
      return;
    }
    if (templatePayload) {
      initFromTemplate(templatePayload);
      setInitialRouteName(TAB_NAME_BY_CATEGORY[templatePayload.typeCategory]);
    } else {
      initBlankTemplate();
    }
    setLoading(false);
  }, [isTemplateFlow, templatePayload, initFromTemplate, initBlankTemplate]);

  if (loading) {
    return <Loading vertical text="加载中" />;
  }

  const tabColor = token[TAB_COLORS[currentTabIndex]];

  return (
    <ThemeProvider config={{ token: { colorPrimary: tabColor } }}>
      <KeyboardAwareScreen>
        {isTemplateMode && (
          <Input
            placeholder="模板名称（如：通勤支出）"
            value={templateName}
            onChange={setTemplateName}
            style={styles.nameField}
          />
        )}
        <TopTabNavigator
          initialRouteName={initialRouteName}
          screens={ADD_RECORD_TAB_SCREENS}
          styles={{
            sceneContainer: styles.sceneContainer,
          }}
          onIndexChange={setCurrentTabIndex}
        />
      </KeyboardAwareScreen>
    </ThemeProvider>
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
  nameField: {
    paddingHorizontal: token.paddingContentHorizontal,
    paddingVertical: token.paddingContentVertical,
  },
}));
