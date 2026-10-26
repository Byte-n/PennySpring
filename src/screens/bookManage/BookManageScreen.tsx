import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Button,
  Column,
  Dialog,
  FloatingActionGroup,
  ImagePicker,
  Input,
  List,
  Loading,
  Text,
  useToast,
} from '@pennyspring/ui';
import type { ImagePickerValue, ListItemProps } from '@pennyspring/ui';
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
  useNetworkBookStore,
} from '../../stores/networkBookStore';
import { BookList, type BookListItem } from '../../components/BookList';

type DialogStep =
  | 'none'
  | 'typeSelect'
  | 'localForm'
  | 'networkServer'
  | 'networkList'
  | 'networkCreate';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  dialogBody: {
    gap: token.margin,
  },
  typeSelectBody: {
    gap: token.margin,
  },
  networkListScroll: {
    maxHeight: token.controlHeightLG * 10,
  },
  networkListFooter: {
    paddingTop: token.paddingSM,
  },
  serverUrlList: {
    gap: token.marginSM,
  },
  serverUrlHint: {
    fontSize: token.fontSizeSM,
    color: token.colorTextTertiary,
    marginBottom: token.marginXS,
  },
}));

function getImageValue(background: string): ImagePickerValue | undefined {
  return background ? { uri: background } : undefined;
}

function getImageUri(imageValue: ImagePickerValue | undefined): string {
  return imageValue?.uri ?? '';
}

export function BookManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const currentBook = useBookStore(state => state.currentBook);
  const initializeBook = useBookStore(state => state.initializeBook);
  const setCurrentBook = useBookStore(state => state.setCurrentBook);
  const networkRefs = useNetworkBookRefs();
  const addRef = useNetworkBookStore(state => state.addRef);
  const removeRef = useNetworkBookStore(state => state.removeRef);

  const { data: localBooks = [], refresh: refreshLocal } = useRequest(
    () => localApi.book.getAll(),
  );
  const { data: networkBooks = [], refresh: refreshNetwork } = useRequest(
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

  const refreshAll = useCallback(() => {
    refreshLocal();
    refreshNetwork();
  }, [refreshLocal, refreshNetwork]);

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

  const [dialogStep, setDialogStep] = useState<DialogStep>('none');
  const [editingBook, setEditingBook] = useState<BookRow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundImage, setBackgroundImage] = useState<
    ImagePickerValue | undefined
  >();
  const [networkServerUrl, setNetworkServerUrl] = useState('');
  const [serverBookList, setServerBookList] = useState<BookRow[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const closeDialog = useCallback(() => {
    setDialogStep('none');
    setEditingBook(null);
  }, []);

  const openCreate = useCallback(() => {
    setEditingBook(null);
    setName('');
    setDescription('');
    setBackgroundImage(undefined);
    setDialogStep('typeSelect');
  }, []);

  const chooseLocal = useCallback(() => {
    setEditingBook(null);
    setName('');
    setDescription('');
    setBackgroundImage(undefined);
    setDialogStep('localForm');
  }, []);

  const chooseNetwork = useCallback(() => {
    setNetworkServerUrl('');
    setServerBookList([]);
    setDialogStep('networkServer');
  }, []);

  const existingServerUrls = React.useMemo(() => {
    const urls = networkRefs.map(ref => ref.serverUrl);
    return Array.from(new Set(urls));
  }, [networkRefs]);

  const handleConnect = useCallback(async () => {
    const url = networkServerUrl.trim();
    if (!url) {
      return;
    }
    setNetworkLoading(true);
    try {
      const books = await getRemoteApi(url).book.getAll();
      setServerBookList(books);
      setDialogStep('networkList');
    } catch (e: unknown) {
      toast.show({
        messageText: e instanceof Error ? e.message : '连接服务器失败',
      });
    } finally {
      setNetworkLoading(false);
    }
  }, [networkServerUrl, toast]);

  const selectNetworkBook = useCallback(
    (book: BookRow) => {
      addRef({ serverUrl: networkServerUrl, bookId: book.id });
      toast.show({ messageText: `已添加网络账本「${book.name}」` });
      setDialogStep('none');
    },
    [addRef, networkServerUrl, toast],
  );

  const goToNetworkCreate = useCallback(() => {
    setName('');
    setDescription('');
    setDialogStep('networkCreate');
  }, []);

  const handleLocalSubmit = useCallback(async () => {
    const background = getImageUri(backgroundImage);
    setSubmitting(true);
    try {
      if (editingBook) {
        const updated = await localApi.book.update({
          id: editingBook.id,
          name,
          description,
          background,
        });
        if (
          currentBook?.kind === BOOK_TYPE.local &&
          currentBook.id === updated.id
        ) {
          setCurrentBook(
            { kind: 'local', id: updated.id },
            { kind: BOOK_TYPE.local, ...updated },
          );
        }
      } else {
        await localApi.book.create({ name, description, background });
      }
      setDialogStep('none');
      refreshAll();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '操作失败' });
    } finally {
      setSubmitting(false);
    }
  }, [
    backgroundImage,
    currentBook,
    editingBook,
    name,
    description,
    refreshAll,
    setCurrentBook,
    toast,
  ]);

  const handleNetworkCreate = useCallback(async () => {
    const url = networkServerUrl.trim();
    if (!name.trim() || !url) {
      return;
    }
    setSubmitting(true);
    try {
      // 网络账本暂不支持上传图片，封面统一由客户端渲染为网络图标
      const created = await getRemoteApi(url).book.create({
        name,
        description,
        background: '',
      });
      addRef({ serverUrl: url, bookId: created.id });
      toast.show({ messageText: `已创建网络账本「${created.name}」` });
      setDialogStep('none');
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '创建失败' });
    } finally {
      setSubmitting(false);
    }
  }, [addRef, description, name, networkServerUrl, toast]);

  const handleSelectBook = useCallback(
    (ref: CurrentBookRef, entry: BookEntry) => {
      setCurrentBook(ref, entry);
      toast.show({ messageText: `已切换到${entry.name}` });
    },
    [setCurrentBook, toast],
  );

  const handleEditBook = useCallback((book: BookRow) => {
    setEditingBook(book);
    setName(book.name);
    setDescription(book.description);
    setBackgroundImage(getImageValue(book.background));
    setDialogStep('localForm');
  }, []);

  const handleDeleteBook = useCallback(
    async (id: number) => {
      try {
        await localApi.book.delete(id);
        if (currentBook?.kind === BOOK_TYPE.local && currentBook.id === id) {
          await initializeBook();
        }
        refreshAll();
      } catch (e: unknown) {
        toast.show({
          messageText: e instanceof Error ? e.message : '删除失败',
        });
      }
    },
    [currentBook, initializeBook, refreshAll, toast],
  );

  const handleRemoveNetwork = useCallback(
    (networkRef: NetworkBookRef) => {
      removeRef(networkRef.serverUrl, networkRef.bookId);
      if (
        currentBook?.kind === BOOK_TYPE.remote &&
        currentBook.id === networkRef.bookId
      ) {
        initializeBook();
      }
      toast.show({ messageText: '已移除网络账本缓存' });
    },
    [currentBook, initializeBook, removeRef, toast],
  );

  const dialogTitle =
    dialogStep === 'typeSelect'
      ? '选择账本类型'
      : dialogStep === 'localForm'
        ? editingBook
          ? '编辑账本'
          : '新增本地账本'
        : dialogStep === 'networkServer'
          ? '连接服务器'
          : dialogStep === 'networkList'
            ? '选择网络账本'
            : dialogStep === 'networkCreate'
              ? '新建网络账本'
              : '';

  const dialogOkText =
    dialogStep === 'localForm'
      ? editingBook
        ? '保存'
        : '创建'
      : dialogStep === 'networkServer'
        ? '连接'
        : dialogStep === 'networkCreate'
          ? '创建'
          : '确定';

  const dialogOkDisabled =
    dialogStep === 'typeSelect' ||
    dialogStep === 'networkList' ||
    dialogStep === 'none' ||
    (dialogStep === 'localForm' && (!name.trim() || submitting)) ||
    (dialogStep === 'networkServer' &&
      (!networkServerUrl.trim() || networkLoading)) ||
    (dialogStep === 'networkCreate' && (!name.trim() || submitting));

  const handleDialogOk = useCallback(() => {
    if (dialogStep === 'localForm') {
      handleLocalSubmit();
    } else if (dialogStep === 'networkServer') {
      handleConnect();
    } else if (dialogStep === 'networkCreate') {
      handleNetworkCreate();
    }
  }, [dialogStep, handleConnect, handleLocalSubmit, handleNetworkCreate]);

  const handleOpenChange = useCallback(
    (open: boolean, params: { reason: string }) => {
      // OK 原因由各步骤的 onOk 异步处理决定跳转或关闭，此处不主动关闭
      if (!open && params.reason !== 'ok') {
        closeDialog();
      }
    },
    [closeDialog],
  );

  const serverBookItems: ListItemProps[] = serverBookList.map(book => ({
    key: `server-${book.id}`,
    titleText: book.name,
    descriptionText: book.description || '暂无描述',
    onPress: () => selectNetworkBook(book),
  }));

  return (
    <Column style={styles.container}>
      <BookList
        mode="manage"
        items={items}
        currentBook={currentBook}
        onBookSelect={handleSelectBook}
        onBookEdit={handleEditBook}
        onBookDelete={handleDeleteBook}
        onNetworkRemove={handleRemoveNetwork}
      />

      <FloatingActionGroup
        actions={[
          {
            key: 'create-book',
            icon: 'add',
            onPress: openCreate,
            buttonProps: { color: 'orange' },
          },
        ]}
      />

      <Dialog
        open={dialogStep !== 'none'}
        onOpenChange={handleOpenChange}
        titleText={dialogTitle}
        onOk={handleDialogOk}
        okText={dialogOkText}
        okDisabled={dialogOkDisabled}
      >
        {dialogStep === 'typeSelect' ? (
          <Column style={styles.typeSelectBody}>
            <Button block variant="outlined" onPress={chooseLocal}>
              本地账本
            </Button>
            <Button block variant="outlined" onPress={chooseNetwork}>
              网络账本
            </Button>
          </Column>
        ) : null}

        {dialogStep === 'localForm' || dialogStep === 'networkCreate' ? (
          <Column style={styles.dialogBody}>
            <Input
              labelText="账本名称"
              placeholder="请输入"
              value={name}
              onChange={setName}
            />
            <Input
              labelText="描述"
              placeholder="描述(可选)"
              value={description}
              onChange={setDescription}
            />
            {dialogStep === 'localForm' ? (
              <ImagePicker
                label="图片"
                onChange={setBackgroundImage}
                labelText="选择图片"
                value={backgroundImage}
              />
            ) : (
              <Text color="tertiary" size="sm">
                网络账本暂不支持上传图片，封面统一使用网络图标
              </Text>
            )}
          </Column>
        ) : null}

        {dialogStep === 'networkServer' ? (
          <Column style={styles.dialogBody}>
            <Input
              labelText="服务器地址"
              placeholder="请输入服务器地址"
              value={networkServerUrl}
              onChange={setNetworkServerUrl}
            />
            {existingServerUrls.length > 0 ? (
              <Column style={styles.serverUrlList}>
                <Text style={styles.serverUrlHint}>快速选择已有地址：</Text>
                {existingServerUrls.map(url => (
                  <Button
                    key={url}
                    block
                    variant="outlined"
                    size="small"
                    onPress={() => setNetworkServerUrl(url)}
                  >
                    {url}
                  </Button>
                ))}
              </Column>
            ) : null}
            {networkLoading ? <Loading text="连接中..." /> : null}
          </Column>
        ) : null}

        {dialogStep === 'networkList' ? (
          <Column style={styles.dialogBody}>
            <ScrollView style={styles.networkListScroll}>
              {serverBookItems.length === 0 ? (
                <Text color="tertiary">该服务器暂无可用账本</Text>
              ) : (
                <List items={serverBookItems} />
              )}
            </ScrollView>
            <Column style={styles.networkListFooter}>
              <Button
                block
                variant="dashed"
                icon="add"
                onPress={goToNetworkCreate}
              >
                新建账本
              </Button>
            </Column>
          </Column>
        ) : null}
      </Dialog>
    </Column>
  );
}
