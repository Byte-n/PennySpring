import React, { useMemo, useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import {
  AddRecordProvider,
  useAddRecordContext,
  type AddRecordPresetPayload,
  type AddRecordTemplatePayload,
} from './AddRecordContext';
import { Input, KeyboardAwareScreen, Loading, useToast } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider, useTheme } from '@pennyspring/ui';
import {
  RECORD_TYPE_CATEGORY,
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
import {
  useBookStore,
  useCurrentBookId,
  useGlobalApi,
} from '../../stores/bookStore';
import { useMediaStore } from '../../media';
import { TabScreen, TopTabNavigator } from '../../component/TopTabNavigator';
import {
  applyAddRecordInitSeed,
  loadAddRecordInitSeed,
  resolveAddRecordInitSource,
} from './addRecordInit';
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
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const bookId = useCurrentBookId();
  const globalApi = useGlobalApi();
  const media = useMediaStore();
  const [initialRouteName, setInitialRouteName] = useState<string>();
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const initSource = useMemo(
    () =>
      resolveAddRecordInitSource({
        recordId,
        preset,
        template: isTemplateFlow,
        templatePayload,
        draftId,
        itemIndex,
      }),
    [recordId, preset, isTemplateFlow, templatePayload, draftId, itemIndex],
  );
  const isBookRequired =
    initSource?.kind === 'edit' || initSource?.kind === 'preset';
  const isInitReady =
    initSource !== null && (!isBookRequired || bookId !== null);
  const { loading: initLoading } = useRequest(
    () =>
      initSource === null
        ? Promise.resolve(null)
        : loadAddRecordInitSeed(initSource, {
            bookId,
            currentBookRef,
            recordApi: globalApi.record,
            typeApi: globalApi.type,
            media,
          }),
    {
      ready: isInitReady,
      refreshDeps: [initSource, currentBookRef],
      onSuccess: seed => {
        if (seed === null) {
          return;
        }
        applyAddRecordInitSeed(seed, {
          init,
          initFromPreset,
          initFromTemplate,
          initBlankTemplate,
          initFromDraft,
        });
        if (seed.typeCategory !== undefined) {
          setInitialRouteName(TAB_NAME_BY_CATEGORY[seed.typeCategory]);
        }
      },
      onError: error => {
        toast.show({
          messageText: getDraftErrorMessage(
            error,
            initSource?.kind === 'draft'
              ? '草稿加载失败，请返回草稿详情重试'
              : '加载失败，请返回重试',
          ),
          status: 'error',
        });
        navigation.goBack();
      },
    },
  );
  const loading = initLoading || (initSource !== null && !isInitReady);

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
