import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import {
  Button,
  CalculatorInput,
  Column,
  Dialog,
  Empty,
  Loading,
  Popup,
  Row,
  Text,
  useToast,
} from '@pennyspring/ui';
import {
  RECORD_TYPE_CATEGORY,
  VISIBILITY,
  type Api,
  type AssetRow,
  type QuickBookDraftItemPatch,
  type RecordTypeCategoryValue,
  type TypeRow,
} from '@pennyspring/api';

import { runQuickBookDraft } from '../../../agent/headless/runQuickBookDraft';
import {
  draftTargetFromBookRef,
  resolveBookApi,
  resolveBookMedia,
} from '../../../features/quickBookDraft/bookApi';
import { confirmQuickBookDraftItem } from '../../../features/quickBookDraft/confirmDraft';
import {
  getDraftBookKey,
  type DraftBookTarget,
} from '../../../features/quickBookDraft/draftBook';
import {
  type QuickBookDraftRecord,
  quickBookDraftCache,
} from '../../../features/quickBookDraft/draftCacheStorage';
import {
  buildDraftConfirmInput,
  formatDraftAmount,
  isDraftItemComplete,
} from '../../../features/quickBookDraft/draftLogic';
import {
  deleteDraftImageFiles,
  deleteDraftImageIfConfirmed,
} from '../../../features/quickBookDraft/deleteDraftImages';
import { getDraftErrorMessage } from '../../../features/quickBookDraft/errorMessage';
import { reconcileInterruptedQuickBookDrafts } from '../../../features/quickBookDraft/reconcileInterruptedDrafts';
import type { MediaStore } from '../../../media';
import { ROOT_ROUTES, useNavigation } from '../../../navigation';
import { getBookKey, useBookStore } from '../../../stores/bookStore';
import {
  bumpDraftVersion,
  useDraftVersion,
} from '../../../stores/draftVersionStore';
import { bumpRecordVersion } from '../../../stores/syncVersionStore';
import { toAssetOptions } from '../../addRecord/recordOptions';
import type { DraftFillField } from './draft/DraftItemRow';
import { DraftListCard } from './draft/DraftListCard';
import { useDraftTabStyles } from './draft/draftTabStyles';

interface DraftTabData {
  drafts: QuickBookDraftRecord[];
  types: ReadonlyMap<number, TypeRow>;
  assets: ReadonlyMap<number, AssetRow>;
  bookApi: Api | null;
  media: MediaStore | null;
  isBookAvailable: boolean;
}

interface DraftFillState {
  draftId: string;
  itemIndex: number;
  field: DraftFillField;
}

interface DraftConfirmingState {
  draftId: string;
  itemIndex: number;
}

interface DraftFillOption {
  text: string;
  description?: string;
}

const EMPTY_TYPE_MAP: ReadonlyMap<number, TypeRow> = new Map();
const EMPTY_ASSET_MAP: ReadonlyMap<number, AssetRow> = new Map();
const EMPTY_DATA: DraftTabData = {
  drafts: [],
  types: EMPTY_TYPE_MAP,
  assets: EMPTY_ASSET_MAP,
  bookApi: null,
  media: null,
  isBookAvailable: false,
};
const MISSING_BOOK_NAME = '目标账本';
const DRAFT_BOOK_TIMEOUT_MS = 4_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('目标账本连接超时')),
      timeoutMs,
    );
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function toMapById<T extends { id: number }>(
  rows: readonly T[],
): Map<number, T> {
  return new Map(rows.map(row => [row.id, row]));
}

function getCategoryLabel(category: RecordTypeCategoryValue): string {
  if (category === RECORD_TYPE_CATEGORY.income) {
    return '收入';
  }
  if (category === RECORD_TYPE_CATEGORY.transfer) {
    return '转账';
  }
  return '支出';
}

function getSelectableTypes(typeMap: ReadonlyMap<number, TypeRow>): TypeRow[] {
  const types = Array.from(typeMap.values());
  const parentIds = new Set(
    types.filter(type => type.parentId > 0).map(type => type.parentId),
  );
  return types.filter(type => type.parentId > 0 || !parentIds.has(type.id));
}

function formatCentsAsExpression(cents: number | null): string {
  return cents !== null && cents > 0 ? String(cents / 100) : '';
}

async function loadDraftTabData(
  target: DraftBookTarget,
): Promise<DraftTabData> {
  const drafts = await quickBookDraftCache.list({ target });
  try {
    const [bookApi, media] = await Promise.all([
      resolveBookApi(target),
      resolveBookMedia(target),
    ]);
    const [book, types, assets] = await withTimeout(
      Promise.all([
        bookApi.book.getById(target.booksId),
        bookApi.type.getAll(target.booksId),
        bookApi.asset.getByBook(target.booksId),
      ]),
      DRAFT_BOOK_TIMEOUT_MS,
    );
    return {
      drafts,
      types: toMapById(types),
      assets: toMapById(assets),
      bookApi,
      media,
      isBookAvailable: book !== null,
    };
  } catch {
    return { ...EMPTY_DATA, drafts };
  }
}

export function DraftTabScreen(): React.ReactElement {
  const styles = useDraftTabStyles();
  const navigation = useNavigation();
  const toast = useToast();
  const draftVersion = useDraftVersion();
  const currentBook = useBookStore(state => state.currentBook);
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [togglingAttachId, setTogglingAttachId] = useState<string | null>(null);
  const [busyDraftId, setBusyDraftId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<DraftConfirmingState | null>(
    null,
  );
  const [fillState, setFillState] = useState<DraftFillState | null>(null);
  const [amountExpression, setAmountExpression] = useState('');
  const [discardTarget, setDiscardTarget] =
    useState<QuickBookDraftRecord | null>(null);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const hasFocusedRef = useRef(false);

  const target = useMemo(
    () =>
      currentBookRef === null || currentBook === null
        ? null
        : draftTargetFromBookRef(currentBookRef, currentBook.name),
    [currentBook, currentBookRef],
  );
  const targetKey = target === null ? '' : getDraftBookKey(target);

  const { data, loading, error, mutate, refresh } = useRequest(
    () =>
      target === null ? Promise.resolve(EMPTY_DATA) : loadDraftTabData(target),
    {
      refreshDeps: [draftVersion, targetKey],
    },
  );

  useFocusEffect(
    useCallback(() => {
      reconcileInterruptedQuickBookDrafts().catch(reconcileError => {
        console.error(
          'Quick book draft reconciliation failed:',
          reconcileError,
        );
      });
      if (hasFocusedRef.current) {
        refresh();
      } else {
        hasFocusedRef.current = true;
      }
    }, [refresh]),
  );

  const drafts = data?.drafts ?? EMPTY_DATA.drafts;
  const summary = useMemo(
    () => ({
      draftCount: drafts.length,
      itemCount: drafts.reduce((total, draft) => total + draft.items.length, 0),
    }),
    [drafts],
  );

  const fillDraft =
    fillState === null
      ? undefined
      : drafts.find(draft => draft.id === fillState.draftId);
  const fillTypeMap = data?.types ?? EMPTY_TYPE_MAP;
  const fillAssetMap = data?.assets ?? EMPTY_ASSET_MAP;
  const fillTypeOptions = useMemo(
    () => getSelectableTypes(fillTypeMap),
    [fillTypeMap],
  );
  const fillTypeActions = useMemo(
    () =>
      fillTypeOptions.map(type => {
        const parent =
          type.parentId > 0 ? fillTypeMap.get(type.parentId) : undefined;
        return {
          text: parent ? `${parent.name} / ${type.name}` : type.name,
          description: getCategoryLabel(type.typeCategory),
        };
      }),
    [fillTypeMap, fillTypeOptions],
  );
  const fillVisibleAssets = useMemo(
    () =>
      Array.from(fillAssetMap.values()).filter(
        asset => asset.invisible !== VISIBILITY.hidden,
      ),
    [fillAssetMap],
  );
  const fillAssetActions: DraftFillOption[] = useMemo(
    () =>
      toAssetOptions(fillVisibleAssets).map(option => ({
        text: String(option.labelText ?? ''),
        description: option.descriptionText,
      })),
    [fillVisibleAssets],
  );

  const handleRetry = useCallback(
    async (draft: QuickBookDraftRecord): Promise<void> => {
      if (retryingId !== null) {
        return;
      }
      setRetryingId(draft.id);
      try {
        await runQuickBookDraft({
          draftId: draft.id,
          imagePath: draft.imagePath,
          target: draft.target,
          preset: draft.preset,
        });
        toast.show({ messageText: '草稿已重新生成' });
      } catch (retryError) {
        toast.show({
          messageText: getDraftErrorMessage(retryError, '重试失败，请稍后再试'),
          status: 'error',
        });
      } finally {
        setRetryingId(null);
      }
    },
    [retryingId, toast],
  );

  const handleToggleAttach = useCallback(
    async (draft: QuickBookDraftRecord, next: boolean): Promise<void> => {
      if (togglingAttachId !== null) {
        return;
      }
      const previous = draft.attachImage;
      setTogglingAttachId(draft.id);
      mutate(current =>
        current
          ? {
              ...current,
              drafts: current.drafts.map(item =>
                item.id === draft.id ? { ...item, attachImage: next } : item,
              ),
            }
          : current,
      );
      try {
        await quickBookDraftCache.setAttachImage(draft.id, next);
      } catch (toggleError) {
        mutate(current =>
          current
            ? {
                ...current,
                drafts: current.drafts.map(item =>
                  item.id === draft.id
                    ? { ...item, attachImage: previous }
                    : item,
                ),
              }
            : current,
        );
        toast.show({
          messageText: getDraftErrorMessage(
            toggleError,
            '保存带图设置失败，请稍后再试',
          ),
          status: 'error',
        });
      } finally {
        setTogglingAttachId(null);
      }
    },
    [mutate, toast, togglingAttachId],
  );

  const applyItemPatch = useCallback(
    async (
      draft: QuickBookDraftRecord,
      itemIndex: number,
      patch: QuickBookDraftItemPatch,
    ): Promise<void> => {
      if (busyDraftId !== null) {
        return;
      }
      setBusyDraftId(draft.id);
      try {
        const updatedItem = await quickBookDraftCache.updateItem(
          draft.id,
          itemIndex,
          patch,
        );
        mutate((current: DraftTabData | undefined) =>
          current
            ? {
                ...current,
                drafts: current.drafts.map(currentDraft =>
                  currentDraft.id === draft.id
                    ? {
                        ...currentDraft,
                        items: currentDraft.items.map((item, index) =>
                          index === itemIndex ? updatedItem : item,
                        ),
                      }
                    : currentDraft,
                ),
              }
            : current,
        );
      } catch (patchError) {
        toast.show({
          messageText: getDraftErrorMessage(
            patchError,
            '保存草稿修改失败，请稍后再试',
          ),
          status: 'error',
        });
      } finally {
        setBusyDraftId(null);
        setFillState(null);
      }
    },
    [busyDraftId, mutate, toast],
  );

  const openFill = useCallback(
    (draft: QuickBookDraftRecord, itemIndex: number, field: DraftFillField) => {
      const item = draft.items[itemIndex];
      if (item === undefined) {
        return;
      }
      if (field === 'amount') {
        setAmountExpression(formatCentsAsExpression(item.amountCents));
      }
      setFillState({ draftId: draft.id, itemIndex, field });
    },
    [],
  );

  const handleFillSelection = useCallback(
    (index: number): void => {
      if (fillState === null || fillDraft === undefined) {
        return;
      }
      const { itemIndex, field } = fillState;
      if (field === 'type') {
        const type = fillTypeOptions[index];
        if (type === undefined) return;
        const isTransfer = type.typeCategory === RECORD_TYPE_CATEGORY.transfer;
        applyItemPatch(fillDraft, itemIndex, {
          typeId: type.id,
          typeName: type.name,
          ...(isTransfer ? {} : { intoAssetId: 0, intoAssetName: '' }),
        }).catch(() => undefined);
        return;
      }
      const asset = fillVisibleAssets[index];
      if (asset === undefined) return;
      applyItemPatch(
        fillDraft,
        itemIndex,
        field === 'asset'
          ? { assetId: asset.id, assetName: asset.name }
          : { intoAssetId: asset.id, intoAssetName: asset.name },
      ).catch(() => undefined);
    },
    [applyItemPatch, fillDraft, fillState, fillTypeOptions, fillVisibleAssets],
  );

  const handleAmountConfirm = useCallback(
    (result: number): void => {
      if (fillState === null || fillDraft === undefined) {
        return;
      }
      const cents = Math.round(result * 100);
      if (!Number.isFinite(cents) || cents <= 0) {
        toast.show({ messageText: '金额必须大于 0', status: 'error' });
        return;
      }
      applyItemPatch(fillDraft, fillState.itemIndex, {
        amountCents: cents,
      }).catch(() => undefined);
    },
    [applyItemPatch, fillDraft, fillState, toast],
  );

  const handleConfirmItem = useCallback(
    async (draft: QuickBookDraftRecord, itemIndex: number): Promise<void> => {
      if (busyDraftId !== null || confirming !== null || data === undefined) {
        return;
      }
      const item = draft.items[itemIndex];
      if (item === undefined || item.status === 'confirmed') {
        return;
      }
      if (
        !data.isBookAvailable ||
        data.bookApi === null ||
        data.media === null
      ) {
        toast.show({
          messageText: '目标账本当前不可用，请联网或切换账本后重试',
          status: 'error',
        });
        return;
      }
      const type = data.types.get(item.typeId);
      if (!isDraftItemComplete(item, type, draft.booksId)) {
        toast.show({
          messageText: '该笔信息不完整，请点「补全」或「新建记录」',
          status: 'error',
        });
        return;
      }
      if (type === undefined) {
        return;
      }

      setBusyDraftId(draft.id);
      setConfirming({ draftId: draft.id, itemIndex });
      try {
        const input = buildDraftConfirmInput({
          item,
          type,
          booksId: draft.booksId,
        });
        await confirmQuickBookDraftItem({
          draftId: draft.id,
          itemIndex,
          target: draft.target,
          bookApi: data.bookApi,
          media: data.media,
          input,
        });
        bumpRecordVersion();
        bumpDraftVersion();
        await deleteDraftImageIfConfirmed(draft.id);
        await refresh();
        toast.show({
          messageText: `已记账：${type.name} ${formatDraftAmount(
            item.amountCents,
          )}`,
        });
      } catch (confirmError) {
        toast.show({
          messageText: getDraftErrorMessage(
            confirmError,
            '记账失败，请稍后重试',
          ),
          status: 'error',
        });
      } finally {
        setBusyDraftId(null);
        setConfirming(null);
      }
    },
    [busyDraftId, confirming, data, refresh, toast],
  );

  const handleOpenForm = useCallback(
    (draft: QuickBookDraftRecord, itemIndex: number): void => {
      navigation.navigate(ROOT_ROUTES.AddRecord, {
        draftId: draft.id,
        itemIndex,
      });
    },
    [navigation],
  );

  const handleDiscard = useCallback(async (): Promise<void> => {
    const draft = discardTarget;
    if (draft === null || isDiscarding) {
      return;
    }
    setIsDiscarding(true);
    try {
      const imagePaths = await quickBookDraftCache.discard(draft.id);
      await deleteDraftImageFiles(imagePaths);
      bumpDraftVersion();
      setDiscardTarget(null);
      await refresh();
      toast.show({ messageText: '草稿已丢弃' });
    } catch (discardError) {
      toast.show({
        messageText: getDraftErrorMessage(discardError, '丢弃失败，请稍后再试'),
        status: 'error',
      });
    } finally {
      setIsDiscarding(false);
    }
  }, [discardTarget, isDiscarding, refresh, toast]);

  const renderBody = (): React.ReactElement => {
    if (currentBook === null || target === null) {
      return (
        <Empty
          descriptionText="选择账本后，截图记账草稿会按账本展示。"
          style={styles.state}
          titleText="暂无当前账本"
        />
      );
    }
    if (loading && !data) {
      return <Loading style={styles.state} text="加载草稿" variant="block" />;
    }
    if (error) {
      return (
        <Empty
          action={
            <Button onPress={() => refresh()} type="text">
              重新加载
            </Button>
          }
          descriptionText="请检查本地数据后重试。"
          style={styles.state}
          titleText="草稿加载失败"
        />
      );
    }
    if (drafts.length === 0) {
      return (
        <Empty
          descriptionText="用悬浮球截图后，草稿会出现在这里。"
          style={styles.state}
          titleText="暂无草稿"
        />
      );
    }

    return (
      <>
        <Row align="baseline" justify="between" style={styles.summary}>
          <Text color="tertiary" size="xs">
            {`${summary.draftCount} 个草稿`}
          </Text>
          {summary.itemCount > 0 ? (
            <Text color="tertiary" size="xs" style={styles.num}>
              {`共 ${summary.itemCount} 笔`}
            </Text>
          ) : null}
        </Row>
        {drafts.map(draft => {
          const bookName =
            draft.target.bookName || currentBook.name || MISSING_BOOK_NAME;
          const isBookMissing = !(data?.isBookAvailable ?? false);
          const isBusy =
            busyDraftId !== null ||
            togglingAttachId === draft.id ||
            retryingId === draft.id;
          return (
            <DraftListCard
              assetMap={data?.assets ?? EMPTY_ASSET_MAP}
              bookName={bookName}
              confirmingItemIndex={
                confirming !== null && confirming.draftId === draft.id
                  ? confirming.itemIndex
                  : null
              }
              draft={draft}
              isBookMissing={isBookMissing}
              isBusy={isBusy}
              isRetrying={retryingId === draft.id}
              isTogglingAttach={togglingAttachId !== null}
              key={draft.id}
              onConfirm={itemIndex => {
                handleConfirmItem(draft, itemIndex).catch(() => undefined);
              }}
              onDiscard={() => setDiscardTarget(draft)}
              onEdit={itemIndex => handleOpenForm(draft, itemIndex)}
              onFill={(itemIndex, field) => openFill(draft, itemIndex, field)}
              onRetry={() => handleRetry(draft)}
              onToggleAttach={next => {
                handleToggleAttach(draft, next).catch(() => undefined);
              }}
              typeMap={data?.types ?? EMPTY_TYPE_MAP}
            />
          );
        })}
      </>
    );
  };

  const fillField = fillState?.field ?? null;
  const isTypeFill = fillField === 'type';
  const isAssetFill = fillField === 'asset' || fillField === 'intoAsset';
  const isAmountFill = fillField === 'amount';
  const fillOptions = isTypeFill ? fillTypeActions : fillAssetActions;
  const fillTitle =
    fillState === null
      ? '补全草稿'
      : isTypeFill
        ? `第 ${fillState.itemIndex + 1} 笔 · 选择类型`
        : fillField === 'asset'
          ? `第 ${fillState.itemIndex + 1} 笔 · 选择转出资产`
          : `第 ${fillState.itemIndex + 1} 笔 · 选择转入资产`;
  const bookKey = getBookKey(currentBookRef);

  return (
    <Column key={bookKey ?? 'no-book'} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        {renderBody()}
      </ScrollView>
      <Popup.FloatingPanel
        footer={null}
        height="70%"
        onCancel={() => setFillState(null)}
        onOpenChange={open => {
          if (!open) {
            setFillState(null);
          }
        }}
        open={fillDraft !== undefined && (isTypeFill || isAssetFill)}
        scrollEnabled
        titleText={fillTitle}
      >
        <Column>
          {fillOptions.map((action, index) => (
            <Pressable
              key={`${action.text}-${index}`}
              onPress={() => handleFillSelection(index)}
              style={({ pressed }) => [
                styles.fillOption,
                index === fillOptions.length - 1 ? styles.fillOptionLast : null,
                pressed ? styles.fillOptionPressed : null,
              ]}
            >
              <Text color="default" size="md">
                {action.text}
              </Text>
              {action.description ? (
                <Text
                  color="tertiary"
                  size="xs"
                  style={styles.fillOptionDescription}
                >
                  {action.description}
                </Text>
              ) : null}
            </Pressable>
          ))}
          {isTypeFill && fillOptions.length === 0 ? (
            <Text color="tertiary" size="sm">
              暂无可选类型，请先在类型管理中添加。
            </Text>
          ) : null}
          {isAssetFill && fillOptions.length === 0 ? (
            <Text color="tertiary" size="sm">
              暂无可选资产，请先在资产管理中添加。
            </Text>
          ) : null}
        </Column>
      </Popup.FloatingPanel>
      <CalculatorInput.Popup
        onChange={setAmountExpression}
        onOk={({ result }) => handleAmountConfirm(result)}
        onOpenChange={open => {
          if (!open) {
            setFillState(null);
          }
        }}
        open={isAmountFill}
        value={amountExpression}
      />
      <Dialog
        cancelText="取消"
        okDanger
        okDisabled={isDiscarding}
        okText="丢弃"
        onCancel={() => {
          if (!isDiscarding) {
            setDiscardTarget(null);
          }
        }}
        onOk={handleDiscard}
        open={discardTarget !== null}
        titleText="丢弃草稿"
      >
        <Text color="secondary" size="md">
          丢弃后截图与草稿都会删除，已记账的记录不受影响。
        </Text>
      </Dialog>
    </Column>
  );
}
