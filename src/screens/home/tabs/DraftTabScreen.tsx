import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import {
  Button,
  Column,
  Dialog,
  Empty,
  Icon,
  Loading,
  Row,
  Text,
  useToast,
} from '@pennyspring/ui';
import {
  QUICK_BOOK_DRAFT_STATUS,
  localApi,
  type QuickBookDraftRow,
  type TypeRow,
} from '@pennyspring/api';
import { SparkleIcon } from 'phosphor-react-native';

import { runQuickBookDraft } from '../../../agent/headless/runQuickBookDraft';
import { deleteDraftImageFiles } from '../../../features/quickBookDraft/deleteDraftImages';
import { getDraftErrorMessage } from '../../../features/quickBookDraft/errorMessage';
import { ROOT_ROUTES, useNavigation } from '../../../navigation';
import {
  bumpDraftVersion,
  useDraftVersion,
} from '../../../stores/draftVersionStore';
import { DraftListCard } from './draft/DraftListCard';
import { useDraftTabStyles } from './draft/draftTabStyles';

interface DraftTabData {
  drafts: QuickBookDraftRow[];
  bookNameById: ReadonlyMap<number, string>;
  typesByBook: ReadonlyMap<number, ReadonlyMap<number, TypeRow>>;
}

const EMPTY_TYPE_MAP: ReadonlyMap<number, TypeRow> = new Map();
const MISSING_BOOK_NAME = '目标账本已不存在';

function toMapById<T extends { id: number }>(
  rows: readonly T[],
): Map<number, T> {
  return new Map(rows.map(row => [row.id, row]));
}

async function loadDraftTabData(): Promise<DraftTabData> {
  const [drafts, books] = await Promise.all([
    localApi.quickBookDraft.list(),
    localApi.book.getAll(),
  ]);
  const bookIds = Array.from(new Set(drafts.map(draft => draft.booksId)));
  const typeEntries = await Promise.all(
    bookIds.map(
      async bookId =>
        [bookId, toMapById(await localApi.type.getAll(bookId))] as const,
    ),
  );

  return {
    drafts,
    bookNameById: new Map(books.map(book => [book.id, book.name])),
    typesByBook: new Map(typeEntries),
  };
}

export function DraftTabScreen(): React.ReactElement {
  const styles = useDraftTabStyles();
  const navigation = useNavigation();
  const toast = useToast();
  const draftVersion = useDraftVersion();
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [discardTarget, setDiscardTarget] = useState<QuickBookDraftRow | null>(
    null,
  );
  const [isDiscarding, setIsDiscarding] = useState(false);
  const hasFocusedRef = useRef(false);

  const { data, loading, error, refresh } = useRequest(loadDraftTabData, {
    refreshDeps: [draftVersion],
  });

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedRef.current) {
        refresh();
      } else {
        hasFocusedRef.current = true;
      }
    }, [refresh]),
  );

  const drafts = data?.drafts ?? [];
  const summary = useMemo(() => {
    const pendingCount = drafts.filter(
      draft => draft.status === QUICK_BOOK_DRAFT_STATUS.pending,
    ).length;
    const failedCount = drafts.filter(
      draft => draft.status === QUICK_BOOK_DRAFT_STATUS.failed,
    ).length;
    return { pendingCount, failedCount };
  }, [drafts]);

  const handleOpen = useCallback(
    (draft: QuickBookDraftRow): void => {
      navigation.navigate(ROOT_ROUTES.QuickBookDraft, { draftId: draft.id });
    },
    [navigation],
  );

  const handleRetry = useCallback(
    async (draft: QuickBookDraftRow): Promise<void> => {
      if (retryingId !== null) {
        return;
      }
      setRetryingId(draft.id);
      try {
        await runQuickBookDraft({
          draftId: draft.id,
          imagePath: draft.imagePath,
          booksId: draft.booksId,
          preset: draft.preset,
        });
        bumpDraftVersion();
        toast.show({ messageText: '草稿已重新生成' });
      } catch (retryError) {
        toast.show({
          messageText: getDraftErrorMessage(retryError, '重试失败，请稍后再试'),
          status: 'error',
        });
      } finally {
        setRetryingId(null);
        refresh();
      }
    },
    [refresh, retryingId, toast],
  );

  const handleDiscard = useCallback(async (): Promise<void> => {
    const draft = discardTarget;
    if (draft === null || isDiscarding) {
      return;
    }
    setIsDiscarding(true);
    try {
      const imagePaths = await localApi.quickBookDraft.discard(draft.id);
      await deleteDraftImageFiles(imagePaths);
      bumpDraftVersion();
      setDiscardTarget(null);
      toast.show({ messageText: '草稿已丢弃' });
    } catch (discardError) {
      toast.show({
        messageText: getDraftErrorMessage(discardError, '丢弃失败，请稍后再试'),
        status: 'error',
      });
    } finally {
      setIsDiscarding(false);
    }
  }, [discardTarget, isDiscarding, toast]);

  const renderBody = (): React.ReactElement => {
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
          <Text color="heading" size="md" weight="semibold">
            待确认
          </Text>
          <Text color="tertiary" size="xs">
            {`${summary.pendingCount} 个草稿 · ${summary.failedCount} 个失败`}
          </Text>
        </Row>
        {drafts.map(draft => {
          const bookName = data?.bookNameById.get(draft.booksId);
          return (
            <DraftListCard
              key={draft.id}
              bookName={bookName ?? MISSING_BOOK_NAME}
              draft={draft}
              isBookMissing={bookName === undefined}
              isRetrying={retryingId === draft.id}
              onDiscard={() => setDiscardTarget(draft)}
              onOpen={() => handleOpen(draft)}
              onRetry={() => handleRetry(draft)}
              typeMap={data?.typesByBook.get(draft.booksId) ?? EMPTY_TYPE_MAP}
            />
          );
        })}
        <Row style={styles.hintCard}>
          <Row align="center" justify="center" style={styles.hintIcon}>
            <Icon color="primary" icon={SparkleIcon} size="small" />
          </Row>
          <Column style={styles.hintCopy}>
            <Text color="heading" size="sm" weight="semibold">
              草稿不会直接写入账本
            </Text>
            <Text color="tertiary" size="xs">
              生成阶段不打开 App；在详情页确认后才记账，确认前可随时丢弃。
            </Text>
          </Column>
        </Row>
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
