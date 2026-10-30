import React, { useCallback, useState } from 'react';
import { useRequest } from 'ahooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Button,
  Column,
  Loading,
  Text,
  useToast,
} from '@pennyspring/ui';
import { BOOK_TYPE, localApi, type BookRow } from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  type BookEntry,
  type CurrentBookRef,
  getRemoteApi,
  useBookStore,
} from '../../stores/bookStore';
import {
  type NetworkBookRef,
  useNetworkBookRefs,
} from '../../stores/networkBookStore';
import { BookList, type BookListItem } from '../../components/BookList';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  errorBanner: {
    backgroundColor: token.colorErrorBg,
    borderBottomWidth: token.lineWidth,
    borderBottomColor: token.colorErrorBorder,
    padding: token.padding,
  },
  retryButton: {
    marginTop: token.marginXS,
  },
  loadingContainer: {
    flex: 1,
  },
}));

interface BookSelectScreenProps {
  /** 作为 RootStack 子页挂载时已有返回头，不再叠加顶部安全区。 */
  isEmbedded?: boolean;
}

export function BookSelectScreen({
  isEmbedded = false,
}: BookSelectScreenProps = {}) {
  const styles = useStyles();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const currentBook = useBookStore(state => state.currentBook);
  const setCurrentBook = useBookStore(state => state.setCurrentBook);
  const initializeBook = useBookStore(state => state.initializeBook);
  const resetInitStatus = useBookStore(state => state.resetInitStatus);
  const initError = useBookStore(state => state.initError);
  const networkRefs = useNetworkBookRefs();

  const [selecting, setSelecting] = useState(false);

  const { data: localBooks = [], loading: localLoading, refresh: refreshLocal } = useRequest(
    () => localApi.book.getAll(),
  );

  const { data: networkBooks = [], loading: networkLoading, refresh: refreshNetwork } = useRequest(
    async () => {
      const settled = await Promise.allSettled(
        networkRefs.map(async ref => {
          const book = await getRemoteApi(ref.serverUrl).book.getById(
            ref.bookId,
          );
          return { ref, book };
        }),
      );
      return networkRefs
        .map((ref, index) => {
          const result = settled[index];
          return result && result.status === 'fulfilled' ? result.value : null;
        })
        .filter(
          (x): x is { ref: NetworkBookRef; book: BookRow } => x !== null,
        );
    },
    { refreshDeps: [JSON.stringify(networkRefs)] },
  );

  useFocusEffect(
    useCallback(() => {
      refreshLocal();
      refreshNetwork();
    }, [refreshLocal, refreshNetwork]),
  );

  const items: BookListItem[] = [
    ...localBooks.map(row => ({
      entry: { kind: BOOK_TYPE.local, ...row } as BookEntry,
      ref: { kind: 'local' as const, id: row.id },
    })),
    ...networkBooks.map(({ ref, book }) => ({
      entry: { kind: BOOK_TYPE.remote, ...book } as BookEntry,
      ref: {
        kind: 'remote' as const,
        serverUrl: ref.serverUrl,
        bookId: ref.bookId,
      },
      networkRef: ref,
    })),
  ];

  const handleBookSelect = useCallback(
    async (ref: CurrentBookRef, entry: BookEntry) => {
      setSelecting(true);
      try {
        setCurrentBook(ref, entry);
        resetInitStatus();
        await initializeBook();
        toast.show({ messageText: `已切换到${entry.name}` });
      } catch (error) {
        toast.show({
          messageText:
            error instanceof Error ? error.message : '账本初始化失败',
        });
      } finally {
        setSelecting(false);
      }
    },
    [setCurrentBook, resetInitStatus, initializeBook, toast],
  );

  const handleRetry = useCallback(async () => {
    setSelecting(true);
    try {
      resetInitStatus();
      await initializeBook();
    } catch (error) {
      toast.show({
        messageText: error instanceof Error ? error.message : '重试失败',
      });
    } finally {
      setSelecting(false);
    }
  }, [resetInitStatus, initializeBook, toast]);

  const loading = localLoading || networkLoading || selecting;

  return (
    <Column style={styles.container}>
      {initError ? (
        <Column
          style={[
            styles.errorBanner,
            {
              paddingTop:
                (isEmbedded ? 0 : insets.top) + styles.errorBanner.padding,
            },
          ]}
        >
          <Text color="errorText">
            {`账本加载失败：${initError.message}`}
          </Text>
          <Button
            size="small"
            onPress={handleRetry}
            style={styles.retryButton}
            disabled={selecting}
          >
            重试
          </Button>
        </Column>
      ) : null}
      {loading ? (
        <Column style={styles.loadingContainer} align="center" justify="center">
          <Loading size="large" />
        </Column>
      ) : (
        <BookList
          mode="select"
          items={items}
          currentBook={currentBook}
          onBookSelect={handleBookSelect}
        />
      )}
    </Column>
  );
}
