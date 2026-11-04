import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRequest } from 'ahooks';
import {
  Button,
  Column,
  Dialog,
  Empty,
  Icon,
  Image,
  Loading,
  Row,
  Tag,
  Text,
  useToast,
} from '@pennyspring/ui';
import {
  QUICK_BOOK_DRAFT_STATUS,
  localApi,
  type AssetRow,
  type DraftItem,
  type QuickBookDraftRow,
  type TypeRow,
} from '@pennyspring/api';
import { BookOpenIcon, WarningIcon } from 'phosphor-react-native';

import { deleteDraftImageFiles } from '../../features/quickBookDraft/deleteDraftImages';
import {
  buildDraftConfirmInput,
  formatDraftAmount,
  formatDraftTimestamp,
  getDraftItemMissingLabels,
  getDraftItemTypeLabel,
  isDraftItemComplete,
} from '../../features/quickBookDraft/draftLogic';
import { getDraftErrorMessage } from '../../features/quickBookDraft/errorMessage';
import { createMediaStore } from '../../media';
import { ROOT_ROUTES } from '../../navigation/routes';
import type { RootStackParamList } from '../../navigation/types';
import { bumpDraftVersion } from '../../stores/draftVersionStore';
import { bumpRecordVersion } from '../../stores/syncVersionStore';
import { DraftItemCard } from './DraftItemCard';
import { useDraftDetailStyles } from './draftDetailStyles';

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROOT_ROUTES.QuickBookDraft
>;

const HEADER_HIT_SLOP = 8;

interface DraftDetailData {
  draft: QuickBookDraftRow;
  bookName: string;
  isBookMissing: boolean;
  typeMap: ReadonlyMap<number, TypeRow>;
  assetMap: ReadonlyMap<number, AssetRow>;
}

interface DraftStatusView {
  label: string;
  color: 'warning' | 'danger' | 'info' | 'success' | 'default';
}

function toMapById<T extends { id: number }>(
  rows: readonly T[],
): Map<number, T> {
  return new Map(rows.map(row => [row.id, row]));
}

function getStatusView(status: QuickBookDraftRow['status']): DraftStatusView {
  if (status === QUICK_BOOK_DRAFT_STATUS.failed) {
    return { label: '生成失败', color: 'danger' };
  }
  if (status === QUICK_BOOK_DRAFT_STATUS.generating) {
    return { label: '生成中', color: 'info' };
  }
  if (status === QUICK_BOOK_DRAFT_STATUS.confirmed) {
    return { label: '已完成', color: 'success' };
  }
  if (status === QUICK_BOOK_DRAFT_STATUS.discarded) {
    return { label: '已丢弃', color: 'default' };
  }
  return { label: '待确认', color: 'warning' };
}

async function loadDraftDetail(draftId: string): Promise<DraftDetailData> {
  const draft = await localApi.quickBookDraft.getById(draftId);
  const [book, types, assets] = await Promise.all([
    localApi.book.getById(draft.booksId).catch(() => null),
    localApi.type.getAll(draft.booksId),
    localApi.asset.getByBook(draft.booksId),
  ]);
  return {
    draft,
    bookName: book?.name ?? '',
    isBookMissing: book === null,
    typeMap: toMapById(types),
    assetMap: toMapById(assets),
  };
}

function getMissingSummary(
  draft: QuickBookDraftRow,
  typeMap: ReadonlyMap<number, TypeRow>,
): string {
  return draft.items
    .map((item, index) => {
      if (item.status === 'confirmed') {
        return '';
      }
      const labels = getDraftItemMissingLabels(
        item,
        typeMap.get(item.typeId),
        draft.booksId,
      );
      return labels.length > 0
        ? `第 ${index + 1} 笔：${labels.join('、')}`
        : '';
    })
    .filter(Boolean)
    .join('；');
}

export function QuickBookDraftDetailScreen({
  navigation,
  route,
}: ScreenProps): React.ReactElement {
  const styles = useDraftDetailStyles();
  const toast = useToast();
  const draftId = route.params.draftId;
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const savedImageCacheRef = useRef<Map<string, string>>(new Map());
  const deletedDraftIdsRef = useRef<Set<string>>(new Set());
  const isConfirmingRef = useRef(false);
  const hasFocusedRef = useRef(false);

  const { data, loading, error, refresh } = useRequest(
    () => loadDraftDetail(draftId),
    { refreshDeps: [draftId] },
  );

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedRef.current) {
        refresh();
      } else {
        hasFocusedRef.current = true;
      }
    }, [refresh]),
  );

  const draft = data?.draft;
  const isGroupConfirmed = draft?.status === QUICK_BOOK_DRAFT_STATUS.confirmed;
  const canDiscard =
    draft !== undefined &&
    draft.status !== QUICK_BOOK_DRAFT_STATUS.confirmed &&
    draft.status !== QUICK_BOOK_DRAFT_STATUS.discarded;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: canDiscard
        ? () => (
            <Button
              color="danger"
              disabled={isDiscarding}
              hitSlop={HEADER_HIT_SLOP}
              onPress={() => setIsDiscardOpen(true)}
              size="small"
              type="text"
            >
              丢弃
            </Button>
          )
        : undefined,
    });
  }, [canDiscard, isDiscarding, navigation]);

  useEffect(() => {
    if (!draft || draft.status !== QUICK_BOOK_DRAFT_STATUS.confirmed) {
      return;
    }
    if (deletedDraftIdsRef.current.has(draft.id)) {
      return;
    }
    deletedDraftIdsRef.current.add(draft.id);
    deleteDraftImageFiles([draft.imagePath]);
  }, [draft]);

  const missingSummary = useMemo(
    () => (data ? getMissingSummary(data.draft, data.typeMap) : ''),
    [data],
  );

  const progressView = useMemo(() => {
    if (!data) {
      return { label: '', color: 'warning' as const };
    }
    const total = data.draft.items.length;
    const confirmedCount = data.draft.confirmedCount;
    if (data.draft.status === QUICK_BOOK_DRAFT_STATUS.confirmed) {
      return { label: `全部完成 ${total}/${total}`, color: 'success' as const };
    }
    if (total === 0) {
      return { label: '暂无明细', color: 'warning' as const };
    }
    if (confirmedCount > 0) {
      return {
        label: `已确认 ${confirmedCount}/${total}`,
        color: 'info' as const,
      };
    }
    const missingCount = data.draft.items.filter(
      item =>
        item.status !== 'confirmed' &&
        !isDraftItemComplete(
          item,
          data.typeMap.get(item.typeId),
          data.draft.booksId,
        ),
    ).length;
    return {
      label: `${total} 笔 · ${missingCount} 笔待补全`,
      color: missingCount > 0 ? ('warning' as const) : ('info' as const),
    };
  }, [data]);

  const resolveImagePaths = useCallback(
    async (targetDraft: QuickBookDraftRow): Promise<string[]> => {
      const cached = savedImageCacheRef.current.get(targetDraft.id);
      if (cached !== undefined) {
        return cached ? [cached] : [];
      }
      if (!targetDraft.imagePath) {
        savedImageCacheRef.current.set(targetDraft.id, '');
        return [];
      }
      const media = createMediaStore({
        kind: 'local',
        booksId: targetDraft.booksId,
      });
      let savedRef: string;
      try {
        savedRef = await media.save({ uri: targetDraft.imagePath });
      } catch {
        throw new Error('截图转存失败，请重试');
      }
      savedImageCacheRef.current.set(targetDraft.id, savedRef);
      return [savedRef];
    },
    [],
  );

  const handleDirectConfirm = useCallback(
    async (item: DraftItem, itemIndex: number): Promise<void> => {
      if (
        !data ||
        draft === undefined ||
        confirmingIndex !== null ||
        isConfirmingRef.current
      ) {
        return;
      }
      if (data.isBookMissing) {
        toast.show({
          messageText: '目标账本已不存在，请丢弃草稿后重新截图',
          status: 'error',
        });
        return;
      }
      const type = data.typeMap.get(item.typeId);
      if (!isDraftItemComplete(item, type, draft.booksId)) {
        toast.show({
          messageText: '该笔信息不完整，请点“确认”补全后保存',
          status: 'error',
        });
        return;
      }
      if (!type) {
        return;
      }

      setConfirmingIndex(itemIndex);
      isConfirmingRef.current = true;
      try {
        const imagePaths = await resolveImagePaths(draft);
        const input = buildDraftConfirmInput({
          item,
          type,
          booksId: draft.booksId,
          imagePaths,
        });
        await localApi.quickBookDraft.confirmItem(draft.id, itemIndex, input);
        bumpRecordVersion();
        bumpDraftVersion();
        try {
          await refresh();
        } catch {
          // 重新加载失败不影响已写入结果，返回详情时会再次刷新。
        }
        toast.show({
          messageText: `已记账：${getDraftItemTypeLabel(
            type,
            data.typeMap,
          )} ${formatDraftAmount(item.amountCents)}`,
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
        isConfirmingRef.current = false;
        setConfirmingIndex(null);
      }
    },
    [confirmingIndex, data, draft, refresh, resolveImagePaths, toast],
  );

  const handleConfirmNavigate = useCallback(
    (itemIndex: number): void => {
      navigation.navigate(ROOT_ROUTES.AddRecord, {
        draftId,
        itemIndex,
      });
    },
    [draftId, navigation],
  );

  const handleDiscard = useCallback(async (): Promise<void> => {
    if (draft === undefined || isDiscarding) {
      return;
    }
    setIsDiscarding(true);
    try {
      const imagePaths = await localApi.quickBookDraft.discard(draft.id);
      await deleteDraftImageFiles(imagePaths);
      bumpDraftVersion();
      setIsDiscardOpen(false);
      toast.show({ messageText: '草稿已丢弃' });
      navigation.goBack();
    } catch (discardError) {
      toast.show({
        messageText: getDraftErrorMessage(discardError, '丢弃失败，请稍后再试'),
        status: 'error',
      });
    } finally {
      setIsDiscarding(false);
    }
  }, [draft, isDiscarding, navigation, toast]);

  const renderBody = (): React.ReactElement => {
    if (loading && !data) {
      return <Loading style={styles.state} text="加载草稿" variant="block" />;
    }
    if (error || !data) {
      return (
        <Empty
          action={
            <Button onPress={() => refresh()} type="text">
              重新加载
            </Button>
          }
          descriptionText="草稿可能已被清理，请返回后刷新列表。"
          style={styles.state}
          titleText="草稿加载失败"
        />
      );
    }

    const statusView = getStatusView(data.draft.status);

    return (
      <>
        <Row style={styles.headerCard}>
          {data.draft.status === QUICK_BOOK_DRAFT_STATUS.confirmed ? (
            <Row
              align="center"
              justify="center"
              style={styles.headerThumbPlaceholder}
            >
              <Text color="tertiary" size="xs">
                已转存
              </Text>
            </Row>
          ) : (
            <Image
              preview
              radius="normal"
              src={{ uri: data.draft.imagePath }}
              style={styles.headerThumb}
            />
          )}
          <Column style={styles.headerCopy}>
            <Text color="heading" size="sm" weight="semibold">
              AI 生成草稿
            </Text>
            <Text color="tertiary" size="xs">
              {`${formatDraftTimestamp(data.draft.createdTime)} · ${
                data.draft.items.length
              } 笔`}
            </Text>
          </Column>
          <Tag color={statusView.color} size="small">
            {statusView.label}
          </Tag>
        </Row>

        <Row style={styles.bookRow}>
          <Icon color="tertiary" icon={BookOpenIcon} size="small" />
          <Column style={styles.bookCopy}>
            <Text color="tertiary" size="xs">
              写入账本
            </Text>
            <Text
              color={data.isBookMissing ? 'warningText' : 'heading'}
              size="sm"
              weight="semibold"
            >
              {data.bookName || '目标账本已不存在'}
            </Text>
          </Column>
          <Tag color={progressView.color} size="small">
            {progressView.label}
          </Tag>
        </Row>

        {data.isBookMissing ? (
          <Row style={styles.warningStrip}>
            <Icon color="warningText" icon={WarningIcon} size="small" />
            <Text color="warningText" size="xs" style={styles.warningText}>
              目标账本已不存在，无法写入；请丢弃草稿后重新截图。
            </Text>
          </Row>
        ) : null}

        {data.draft.status === QUICK_BOOK_DRAFT_STATUS.generating ? (
          <Loading text="草稿仍在生成中" variant="block" />
        ) : null}

        {data.draft.status === QUICK_BOOK_DRAFT_STATUS.failed ? (
          <Row style={styles.warningStrip}>
            <Icon color="warningText" icon={WarningIcon} size="small" />
            <Text color="warningText" size="xs" style={styles.warningText}>
              {data.draft.errorText || '草稿生成失败，请回到列表重试。'}
            </Text>
          </Row>
        ) : null}

        {data.draft.status === QUICK_BOOK_DRAFT_STATUS.pending ? (
          <Row style={styles.warningStrip}>
            <Icon color="warningText" icon={WarningIcon} size="small" />
            <Text color="warningText" size="xs" style={styles.warningText}>
              {missingSummary
                ? `${missingSummary}。完整笔可直接“确定”，任意一笔都可点“确认”进入新建记录。`
                : '所有笔信息完整，可直接“确定”，或点“确认”进入新建记录再次核对。'}
            </Text>
          </Row>
        ) : null}

        {data.draft.status === QUICK_BOOK_DRAFT_STATUS.confirmed ? (
          <Column style={styles.completeCard}>
            <Text color="successText" size="sm" weight="semibold">
              全部记账完成
            </Text>
            <Text color="secondary" size="xs">
              所有笔都已写入账本，草稿已从待处理列表移除。
            </Text>
          </Column>
        ) : null}

        {data.draft.items.map((item, index) => (
          <DraftItemCard
            key={`${data.draft.id}-${index}`}
            assetMap={data.assetMap}
            draft={data.draft}
            index={index}
            isBookMissing={data.isBookMissing}
            isBusy={confirmingIndex !== null}
            isConfirming={confirmingIndex === index}
            isGroupConfirmed={isGroupConfirmed}
            item={item}
            onConfirmNavigate={() => handleConfirmNavigate(index)}
            onDirectConfirm={() => handleDirectConfirm(item, index)}
            typeMap={data.typeMap}
          />
        ))}
      </>
    );
  };

  return (
    <Column style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        {renderBody()}
      </ScrollView>
      <Dialog
        cancelText="取消"
        okDanger
        okDisabled={isDiscarding}
        okText="丢弃"
        onCancel={() => {
          if (!isDiscarding) {
            setIsDiscardOpen(false);
          }
        }}
        onOk={handleDiscard}
        open={isDiscardOpen}
        titleText="丢弃草稿"
      >
        <Text color="secondary" size="md">
          丢弃后截图与草稿都会删除，已记账的记录不受影响。
        </Text>
      </Dialog>
    </Column>
  );
}
