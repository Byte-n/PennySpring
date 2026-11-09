import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import {
  Button,
  CalculatorInput,
  Column,
  DateTimePicker,
  Dialog,
  Empty,
  Loading,
  Row,
  TagPicker,
  Text,
  useToast,
} from '@pennyspring/ui';
import type {
  TagPickerOption,
  TagPickerTexts,
  TagPickerValue,
} from '@pennyspring/ui';
import {
  RECORD_TYPE_CATEGORY,
  VISIBILITY,
  type Api,
  type AssetRow,
  type QuickBookDraftItemPatch,
  type TagRow,
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
import { getPhosphorIconComponent } from '../../../constants/typeIconTree';
import { DraftListCard } from './draft/DraftListCard';
import { DraftTypePicker } from './draft/DraftTypePicker';
import { useDraftTabStyles } from './draft/draftTabStyles';

interface DraftTabData {
  drafts: QuickBookDraftRecord[];
  types: ReadonlyMap<number, TypeRow>;
  assets: ReadonlyMap<number, AssetRow>;
  tags: TagRow[];
  bookApi: Api | null;
  media: MediaStore | null;
  isBookAvailable: boolean;
}

interface DraftEditTarget {
  draftId: string;
  itemIndex: number;
}

const EMPTY_TYPE_MAP: ReadonlyMap<number, TypeRow> = new Map();
const EMPTY_ASSET_MAP: ReadonlyMap<number, AssetRow> = new Map();
const EMPTY_DATA: DraftTabData = {
  drafts: [],
  types: EMPTY_TYPE_MAP,
  assets: EMPTY_ASSET_MAP,
  tags: [],
  bookApi: null,
  media: null,
  isBookAvailable: false,
};
const MISSING_BOOK_NAME = '目标账本';
const DRAFT_BOOK_TIMEOUT_MS = 4_000;
const TAG_PICKER_TEXTS: TagPickerTexts = {
  emptyText: '暂无标签，可在标签管理中新增',
  hiddenOptionsTitle: '已隐藏',
  loadingText: '标签加载中',
  optionsTitle: '标签',
};

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

function formatCentsAsExpression(cents: number | null): string {
  return cents !== null && cents > 0 ? String(cents / 100) : '';
}

function findEditItem(
  drafts: readonly QuickBookDraftRecord[],
  target: DraftEditTarget | null,
): QuickBookDraftRecord | undefined {
  if (target === null) {
    return undefined;
  }
  const draft = drafts.find(item => item.id === target.draftId);
  if (draft === undefined || draft.items[target.itemIndex] === undefined) {
    return undefined;
  }
  return draft;
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
    const [book, types, assets, tags] = await withTimeout(
      Promise.all([
        bookApi.book.getById(target.booksId),
        bookApi.type.getAll(target.booksId),
        bookApi.asset.getByBook(target.booksId),
        bookApi.tag.getAll(target.booksId),
      ]),
      DRAFT_BOOK_TIMEOUT_MS,
    );
    return {
      drafts,
      types: toMapById(types),
      assets: toMapById(assets),
      tags,
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
  const [busyDraftId, setBusyDraftId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<DraftEditTarget | null>(null);
  const [tagEdit, setTagEdit] = useState<DraftEditTarget | null>(null);
  const [tagDraftIds, setTagDraftIds] = useState<number[]>([]);
  const [typeEdit, setTypeEdit] = useState<DraftEditTarget | null>(null);
  const [amountEdit, setAmountEdit] = useState<DraftEditTarget | null>(null);
  const [amountExpression, setAmountExpression] = useState('');
  const [timeEdit, setTimeEdit] = useState<DraftEditTarget | null>(null);
  const [timeDraft, setTimeDraft] = useState(() => new Date());
  const [discardTarget, setDiscardTarget] =
    useState<QuickBookDraftRecord | null>(null);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const hasFocusedRef = useRef(false);

  const target = useMemo(
    () =>
      currentBookRef === null
        ? null
        : draftTargetFromBookRef(currentBookRef, currentBook?.name ?? ''),
    [currentBook?.name, currentBookRef],
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
  const tagMap = useMemo(
    () => new Map((data?.tags ?? []).map(tag => [tag.id, tag])),
    [data?.tags],
  );
  const typeRows = useMemo(
    () => Array.from((data?.types ?? EMPTY_TYPE_MAP).values()),
    [data?.types],
  );
  const tagPickerOptions = useMemo<TagPickerOption[]>(
    () =>
      (data?.tags ?? []).map(tag => ({
        hidden: tag.invisible === VISIBILITY.hidden,
        icon: tag.icon ? getPhosphorIconComponent(tag.icon) : undefined,
        labelText: tag.name,
        value: tag.id,
      })),
    [data?.tags],
  );
  const summary = useMemo(
    () => ({
      draftCount: drafts.length,
      itemCount: drafts.reduce((total, draft) => total + draft.items.length, 0),
    }),
    [drafts],
  );

  const tagEditDraft = findEditItem(drafts, tagEdit);
  const tagEditItem =
    tagEditDraft && tagEdit ? tagEditDraft.items[tagEdit.itemIndex] : undefined;
  const typeEditDraft = findEditItem(drafts, typeEdit);
  const typeEditItem =
    typeEditDraft && typeEdit
      ? typeEditDraft.items[typeEdit.itemIndex]
      : undefined;
  const amountEditDraft = findEditItem(drafts, amountEdit);
  const amountEditItem =
    amountEditDraft && amountEdit
      ? amountEditDraft.items[amountEdit.itemIndex]
      : undefined;
  const timeEditDraft = findEditItem(drafts, timeEdit);
  const timeEditItem =
    timeEditDraft && timeEdit
      ? timeEditDraft.items[timeEdit.itemIndex]
      : undefined;

  const replaceItem = useCallback(
    (
      draftId: string,
      itemIndex: number,
      updatedItem: QuickBookDraftRecord['items'][number],
    ): void => {
      mutate(current =>
        current
          ? {
              ...current,
              drafts: current.drafts.map(currentDraft =>
                currentDraft.id === draftId
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
    },
    [mutate],
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
        replaceItem(draft.id, itemIndex, updatedItem);
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
      }
    },
    [busyDraftId, replaceItem, toast],
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

  const handleEditTags = useCallback(
    (draft: QuickBookDraftRecord, itemIndex: number): void => {
      const item = draft.items[itemIndex];
      setTagDraftIds(item ? [...item.tagIds] : []);
      setTagEdit({ draftId: draft.id, itemIndex });
    },
    [],
  );

  const handleTagChange = useCallback(
    (value: TagPickerValue[]): void => {
      if (tagEdit === null) {
        return;
      }
      const draft = drafts.find(item => item.id === tagEdit.draftId);
      if (draft === undefined) {
        return;
      }
      const tagIds = value.filter(
        (tagId): tagId is number => typeof tagId === 'number',
      );
      setTagDraftIds(tagIds);
      quickBookDraftCache
        .updateItem(draft.id, tagEdit.itemIndex, { tagIds })
        .then(updatedItem => {
          replaceItem(draft.id, tagEdit.itemIndex, updatedItem);
        })
        .catch(patchError => {
          toast.show({
            messageText: getDraftErrorMessage(
              patchError,
              '保存标签失败，请稍后再试',
            ),
            status: 'error',
          });
          const currentItem = draft.items[tagEdit.itemIndex];
          setTagDraftIds(currentItem ? [...currentItem.tagIds] : []);
        });
    },
    [drafts, replaceItem, tagEdit, toast],
  );

  const handleEditType = useCallback(
    (draft: QuickBookDraftRecord, itemIndex: number): void => {
      setTypeEdit({ draftId: draft.id, itemIndex });
    },
    [],
  );

  const handleSelectType = useCallback(
    (type: TypeRow): void => {
      if (typeEdit === null) {
        return;
      }
      const draft = drafts.find(item => item.id === typeEdit.draftId);
      if (draft === undefined) {
        return;
      }
      const isTransfer = type.typeCategory === RECORD_TYPE_CATEGORY.transfer;
      applyItemPatch(draft, typeEdit.itemIndex, {
        typeId: type.id,
        typeName: type.name,
        ...(isTransfer ? {} : { intoAssetId: 0, intoAssetName: '' }),
      }).catch(() => undefined);
    },
    [applyItemPatch, drafts, typeEdit],
  );

  const handleEditAmount = useCallback(
    (draft: QuickBookDraftRecord, itemIndex: number): void => {
      const item = draft.items[itemIndex];
      if (item === undefined) {
        return;
      }
      setAmountExpression(formatCentsAsExpression(item.amountCents));
      setAmountEdit({ draftId: draft.id, itemIndex });
    },
    [],
  );

  const handleAmountOk = useCallback(
    ({ result }: { result: number }): void => {
      if (amountEdit === null) {
        return;
      }
      const draft = drafts.find(item => item.id === amountEdit.draftId);
      if (draft === undefined) {
        return;
      }
      const cents = Math.round(result * 100);
      if (!Number.isFinite(cents) || cents <= 0) {
        toast.show({ messageText: '金额必须大于 0', status: 'error' });
        return;
      }
      applyItemPatch(draft, amountEdit.itemIndex, { amountCents: cents }).catch(
        () => undefined,
      );
      setAmountEdit(null);
    },
    [amountEdit, applyItemPatch, drafts, toast],
  );

  const handleEditTime = useCallback(
    (draft: QuickBookDraftRecord, itemIndex: number): void => {
      const item = draft.items[itemIndex];
      if (item === undefined) {
        return;
      }
      setTimeDraft(new Date(item.recordTime));
      setTimeEdit({ draftId: draft.id, itemIndex });
    },
    [],
  );

  const handleTimeOk = useCallback(
    (date: Date): void => {
      if (timeEdit === null) {
        return;
      }
      const draft = drafts.find(item => item.id === timeEdit.draftId);
      if (draft === undefined) {
        return;
      }
      applyItemPatch(draft, timeEdit.itemIndex, {
        recordTime: date.getTime(),
      }).catch(() => undefined);
      setTimeEdit(null);
    },
    [applyItemPatch, drafts, timeEdit],
  );

  const handleToggleAttach = useCallback(
    (draft: QuickBookDraftRecord, itemIndex: number, next: boolean): void => {
      applyItemPatch(draft, itemIndex, { attachImage: next }).catch(
        () => undefined,
      );
    },
    [applyItemPatch],
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
          messageText: '该笔信息不完整，请点「补全」或铅笔编辑',
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
        setTagEdit(null);
        setTagDraftIds([]);
        setTypeEdit(null);
        setAmountEdit(null);
        setTimeEdit(null);
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
    if (currentBookRef === null || target === null) {
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
            draft.target.bookName || currentBook?.name || MISSING_BOOK_NAME;
          const isBookMissing = !(data?.isBookAvailable ?? false);
          const isBusy = busyDraftId !== null || retryingId === draft.id;
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
              key={draft.id}
              onConfirm={itemIndex => {
                handleConfirmItem(draft, itemIndex).catch(() => undefined);
              }}
              onDiscard={() => setDiscardTarget(draft)}
              onEdit={itemIndex => handleOpenForm(draft, itemIndex)}
              onEditAmount={itemIndex => handleEditAmount(draft, itemIndex)}
              onEditTags={itemIndex => handleEditTags(draft, itemIndex)}
              onEditTime={itemIndex => handleEditTime(draft, itemIndex)}
              onEditType={itemIndex => handleEditType(draft, itemIndex)}
              onRetry={() => handleRetry(draft)}
              onToggleAttach={(itemIndex, next) =>
                handleToggleAttach(draft, itemIndex, next)
              }
              tagMap={tagMap}
              typeMap={data?.types ?? EMPTY_TYPE_MAP}
            />
          );
        })}
      </>
    );
  };

  const bookKey = getBookKey(currentBookRef);
  const tagPickerValue: TagPickerValue[] = tagEdit !== null ? tagDraftIds : [];
  const typePickerValue = typeEditItem?.typeId ?? 0;

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
      <TagPicker
        floatingPanelProps={{
          closeOnMaskClick: true,
          height: '50%',
          keyboardAvoiding: true,
          titleText: '选择标签',
        }}
        onChange={handleTagChange}
        onOpenChange={open => {
          if (!open) {
            setTagEdit(null);
            setTagDraftIds([]);
          }
        }}
        open={tagEdit !== null && tagEditItem !== undefined}
        options={tagPickerOptions}
        style={styles.hiddenTrigger}
        texts={TAG_PICKER_TEXTS}
        value={tagPickerValue}
      />
      <DraftTypePicker
        onCancel={() => setTypeEdit(null)}
        onSelect={handleSelectType}
        open={typeEdit !== null && typeEditItem !== undefined}
        types={typeRows}
        value={typePickerValue}
      />
      <CalculatorInput.Popup
        onChange={setAmountExpression}
        onOk={handleAmountOk}
        onOpenChange={open => {
          if (!open) {
            setAmountEdit(null);
          }
        }}
        open={amountEdit !== null && amountEditItem !== undefined}
        value={amountExpression}
      />
      <DateTimePicker
        layout="calendar"
        onCancel={() => setTimeEdit(null)}
        onOk={handleTimeOk}
        onOpenChange={open => {
          if (!open) {
            setTimeEdit(null);
          }
        }}
        open={timeEdit !== null && timeEditItem !== undefined}
        precision="minute"
        style={styles.hiddenTrigger}
        titleText="选择记账时间"
        value={timeDraft}
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
