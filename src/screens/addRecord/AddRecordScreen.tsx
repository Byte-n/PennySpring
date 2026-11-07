import React, { useEffect, useRef, useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import {
  AddRecordProvider,
  useAddRecordContext,
  type AddRecordPresetPayload,
  type AddRecordTemplatePayload,
} from './AddRecordContext';
import { Input, KeyboardAwareScreen, Loading, useToast } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider, useTheme } from '@pennyspring/ui';
import {
  localApi,
  QUICK_BOOK_DRAFT_STATUS,
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
  type RecordTypeCategoryValue,
} from '@pennyspring/api';
import { ExpenseTabScreen } from './tabs/ExpenseTabScreen';
import { IncomeTabScreen } from './tabs/IncomeTabScreen';
import { TransferTabScreen } from './tabs/TransferTabScreen';
import {
  ROOT_ROUTES,
  useNavigation,
  type RootStackParamList,
} from '../../navigation';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { useMediaStore } from '../../media';
import { TabScreen, TopTabNavigator } from '../../component/TopTabNavigator';
import { buildAddRecordInitFromDraft } from './draftPrefill';
import { getDraftErrorMessage } from '../../features/quickBookDraft/errorMessage';

type AddRecordRoute = RouteProp<
  RootStackParamList,
  typeof ROOT_ROUTES.AddRecord
>;

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
  const draftId = route.params?.draftId;
  const itemIndex = route.params?.itemIndex;
  const shouldAutoOpenAmount =
    recordId === undefined && template !== true && draftId === undefined;

  return (
    <AddRecordProvider autoOpenAmount={shouldAutoOpenAmount}>
      <AddRecordContent
        recordId={recordId}
        preset={preset}
        template={template}
        templatePayload={templatePayload}
        draftId={draftId}
        itemIndex={itemIndex}
      />
    </AddRecordProvider>
  );
}

interface AddRecordContentProps {
  recordId?: number;
  preset?: AddRecordPresetPayload;
  template?: boolean;
  templatePayload?: AddRecordTemplatePayload;
  draftId?: string;
  itemIndex?: number;
}

function AddRecordContent({
  recordId,
  preset,
  template: isTemplateFlow,
  templatePayload,
  draftId,
  itemIndex,
}: AddRecordContentProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const {
    init,
    initFromPreset,
    initFromTemplate,
    initBlankTemplate,
    initFromDraft,
    template: isTemplateMode,
    templateName,
    setTemplateName,
  } = useAddRecordContext();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const media = useMediaStore();
  const [initialRouteName, setInitialRouteName] = useState<string>();
  const [loading, setLoading] = useState(
    recordId !== undefined ||
      preset !== undefined ||
      isTemplateFlow === true ||
      draftId !== undefined,
  );
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  // useToast 每次渲染返回新控制器；用 ref 保证草稿加载 effect 只依赖稳定值。
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (recordId === undefined || !currentBook) return;
    let active = true;
    (async () => {
      const detail = await globalApi.record.getDetailById(
        recordId,
        currentBook.id,
      );
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
        images: detail.imagePaths.map(uri =>
          media ? media.resolveSource(uri) : { uri },
        ),
        assetId: detail.record.assetId > 0 ? detail.record.assetId : null,
        intoAssetId:
          detail.record.intoAssetId > 0 ? detail.record.intoAssetId : null,
        charge: detail.record.charge,
        reimbursable: detail.record.reimbursable === REIMBURSABLE.reimbursable,
        relatedRecordIds: detail.relatedRecordIds,
      });
      if (typeRow) {
        setInitialRouteName(TAB_NAME_BY_CATEGORY[typeRow.typeCategory]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [init, recordId, currentBook, media]);

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

  // 草稿预填：按草稿目标账本读取类型并填入表单；无效草稿提示后返回详情。
  useEffect(() => {
    if (draftId === undefined) return;
    let active = true;
    (async () => {
      try {
        const draft = await localApi.quickBookDraft.getById(draftId);
        if (draft.status === QUICK_BOOK_DRAFT_STATUS.discarded) {
          throw new Error('草稿已丢弃，无法确认');
        }
        const item =
          itemIndex !== undefined ? draft.items[itemIndex] : undefined;
        if (item === undefined || item.status === 'confirmed') {
          throw new Error('草稿内容已更新，请返回草稿详情刷新后重试');
        }
        const [book, types] = await Promise.all([
          localApi.book.getById(draft.booksId).catch(() => null),
          localApi.type.getAll(draft.booksId),
        ]);
        if (!active) return;
        if (book === null) {
          throw new Error('目标账本已不存在，请丢弃草稿后重新截图');
        }
        const typeRow = types.find(type => type.id === item.typeId);
        const prefill = buildAddRecordInitFromDraft(draft, item, typeRow);
        initFromDraft({
          draftId,
          itemIndex: itemIndex ?? 0,
          ...prefill,
        });
        setInitialRouteName(TAB_NAME_BY_CATEGORY[prefill.typeCategory]);
        setLoading(false);
      } catch (error: unknown) {
        if (!active) return;
        toastRef.current.show({
          messageText: getDraftErrorMessage(
            error,
            '草稿加载失败，请返回草稿详情重试',
          ),
          status: 'error',
        });
        navigation.goBack();
      }
    })();
    return () => {
      active = false;
    };
  }, [draftId, itemIndex, initFromDraft, navigation]);

  if (loading) {
    return <Loading variant="block" text="加载中" />;
  }

  const tabColor = token[TAB_COLORS[currentTabIndex]];

  return (
    <ThemeProvider config={{ token: { colorPrimary: tabColor } }}>
      <KeyboardAwareScreen style={styles.screen}>
        {isTemplateMode && (
          <Input
            allowClear
            labelText="模板名称"
            placeholder="如：通勤支出"
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
    labelText: '支出',
    component: ExpenseTabScreen,
  },
  {
    name: 'IncomeTab',
    labelText: '收入',
    component: IncomeTabScreen,
  },
  {
    name: 'TransferTab',
    labelText: '转账',
    component: TransferTabScreen,
  },
];

const useStyles = createUseSheetStyle(token => ({
  sceneContainer: {
    paddingHorizontal: token.paddingContentHorizontal,
  },
  screen: {
    backgroundColor: token.colorBgLayout,
  },
  nameField: {
    paddingHorizontal: token.paddingContentHorizontal,
    paddingTop: token.paddingMD,
    paddingBottom: token.paddingXS,
  },
}));
