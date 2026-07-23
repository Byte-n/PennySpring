import React, { useCallback, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import type { ImageStyle, StyleProp, TextStyle } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  Column,
  Dialog,
  Empty,
  FloatingActionGroup,
  Icon,
  ImagePicker,
  Input,
  List,
  Loading,
  Row,
  SwipeAction,
  Tag,
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

type DialogStep =
  | 'none'
  | 'typeSelect'
  | 'localForm'
  | 'networkServer'
  | 'networkList'
  | 'networkCreate';

interface BookListItem {
  entry: BookEntry;
  ref: CurrentBookRef;
  networkRef?: NetworkBookRef;
}

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  content: {
    flex: 1,
    padding: token.padding,
    gap: token.marginSM,
  },
  card: {
    borderWidth: token.lineWidth,
    padding: token.padding,
    borderRadius: token.borderRadiusLG,
    gap: token.marginSM,
  },
  cardSelected: {
    borderColor: token.colorPrimaryBorder,
    backgroundColor: token.colorPrimaryBg,
  },
  cardMain: {
    gap: token.marginSM,
  },
  cardInfo: {
    flex: 1,
    gap: token.marginXS,
  },
  cardTitle: {
    alignItems: 'center',
    gap: token.marginXS,
  },
  cardName: {
    flex: 1,
    fontSize: token.fontSizeLG,
    lineHeight: token.lineHeightLG,
    fontWeight: token.fontWeightStrong as TextStyle['fontWeight'],
    color: token.colorTextHeading,
  },
  kindTagText: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
  cardIdTagText: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
  currentTagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXXS,
  },
  currentTagText: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorPrimaryText,
  },
  cardDesc: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
  cardDescEmpty: {
    color: token.colorTextTertiary,
  },
  cardServerUrl: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorTextQuaternary,
  },
  cardTimeSummary: {
    paddingTop: token.paddingXXS,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorBorderSecondary,
  },
  cardCover: {
    width: token.controlHeightLG * 2,
    height: token.controlHeightLG * 2,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorFillTertiary,
    overflow: 'hidden',
  },
  cardCoverImage: {
    width: '100%',
    height: '100%',
  },
  cardCoverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: token.paddingXS,
  },
  cardCoverPlaceholderText: {
    fontSize: token.fontSizeSM,
    color: token.colorTextTertiary,
    textAlign: 'center',
  },
  dialogBody: {
    gap: token.marginSM,
  },
  typeSelectBody: {
    gap: token.marginSM,
  },
  networkListScroll: {
    maxHeight: token.controlHeightLG * 10,
  },
  networkListFooter: {
    paddingTop: token.paddingXS,
  },
}));

const DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

function getImageValue(background: string): ImagePickerValue | undefined {
  return background ? { uri: background } : undefined;
}

function getImageUri(imageValue: ImagePickerValue | undefined): string {
  return imageValue?.uri ?? '';
}

function formatBookTime(time: number): string {
  if (!Number.isFinite(time) || time <= 0) {
    return '未知';
  }

  return new Date(time).toLocaleString('zh-CN', DATE_TIME_FORMAT_OPTIONS);
}

function getItemKey(item: BookListItem): string {
  return item.entry.kind === BOOK_TYPE.remote
    ? `remote-${item.networkRef?.serverUrl ?? ''}-${item.entry.id}`
    : `local-${item.entry.id}`;
}

export function BookManageScreen() {
  const styles = useStyles();
  const cardCoverImageStyle = styles.cardCoverImage as StyleProp<ImageStyle>;
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

  const openEditDialog = useCallback((book: BookRow) => {
    setEditingBook(book);
    setName(book.name);
    setDescription(book.description);
    setBackgroundImage(getImageValue(book.background));
    setDialogStep('localForm');
  }, []);

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
    setBackgroundImage(undefined);
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
    const background = getImageUri(backgroundImage);
    setSubmitting(true);
    try {
      const created = await getRemoteApi(url).book.create({
        name,
        description,
        background,
      });
      addRef({ serverUrl: url, bookId: created.id });
      toast.show({ messageText: `已创建网络账本「${created.name}」` });
      setDialogStep('none');
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '创建失败' });
    } finally {
      setSubmitting(false);
    }
  }, [addRef, backgroundImage, description, name, networkServerUrl, toast]);

  const handleDelete = useCallback(
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

  const handleSelectBook = useCallback(
    (item: BookListItem) => {
      setCurrentBook(item.ref, item.entry);
      toast.show({ messageText: `已切换到${item.entry.name}` });
    },
    [setCurrentBook, toast],
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
      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <Empty />
        ) : (
          items.map(item => {
            const { entry } = item;
            const isCurrentBook =
              currentBook?.kind === entry.kind &&
              currentBook?.id === entry.id;
            const isRemote = entry.kind === BOOK_TYPE.remote;

            return (
              <SwipeAction
                key={getItemKey(item)}
                leftActions={[
                  {
                    key: 'select',
                    actionText: isCurrentBook ? '当前' : '选择',
                    color: isCurrentBook ? 'weak' : 'success',
                    disabled: isCurrentBook,
                    onPress: () => handleSelectBook(item),
                  },
                ]}
                rightActions={
                  isRemote
                    ? [
                        {
                          key: 'remove',
                          actionText: '移除',
                          color: 'danger',
                          onPress: () =>
                            item.networkRef &&
                            handleRemoveNetwork(item.networkRef),
                        },
                      ]
                    : [
                        {
                          key: 'edit',
                          actionText: '编辑',
                          color: 'primary',
                          onPress: () => openEditDialog(entry),
                        },
                        {
                          key: 'delete',
                          actionText: '删除',
                          color: 'danger',
                          onPress: () => handleDelete(entry.id),
                        },
                      ]
                }
              >
                <Card
                  style={[styles.card, isCurrentBook && styles.cardSelected]}
                >
                  <Row align="center" style={styles.cardMain}>
                    <Column style={styles.cardInfo}>
                      <Row style={styles.cardTitle}>
                        <Text numberOfLines={1} style={styles.cardName}>
                          {entry.name}
                        </Text>
                        {isCurrentBook ? (
                          <Tag
                            color="primary"
                            size="small"
                            styles={{ content: styles.currentTagText }}
                            variant="filled"
                          >
                            <Row style={styles.currentTagContent}>
                              <Icon
                                color="primaryText"
                                icon="check"
                                size="small"
                              />
                              <Text style={styles.currentTagText}>当前</Text>
                            </Row>
                          </Tag>
                        ) : null}
                        <Tag
                          size="small"
                          variant="outlined"
                          styles={{ content: styles.kindTagText }}
                        >
                          {isRemote ? '网络' : '本地'}
                        </Tag>
                        <Tag
                          size="small"
                          variant="outlined"
                          styles={{ content: styles.cardIdTagText }}
                        >
                          {`#${entry.id}`}
                        </Tag>
                      </Row>
                      {isRemote && item.networkRef ? (
                        <Text style={styles.cardServerUrl} numberOfLines={1}>
                          {item.networkRef.serverUrl}
                        </Text>
                      ) : null}
                      <Text
                        style={[
                          styles.cardDesc,
                          !entry.description && styles.cardDescEmpty,
                        ]}
                        color="tertiary"
                      >
                        {entry.description || '暂无描述'}
                      </Text>
                      <Column style={styles.cardTimeSummary}>
                        <Text color="quaternary" size="sm">
                          {`创建：${formatBookTime(entry.createdTime)}`}
                        </Text>
                        <Text color="quaternary" size="sm">
                          {`更新：${formatBookTime(entry.updatedTime)}`}
                        </Text>
                      </Column>
                    </Column>
                    <Column style={styles.cardCover}>
                      {entry.background ? (
                        <Image
                          resizeMode="cover"
                          source={{ uri: entry.background }}
                          style={cardCoverImageStyle}
                        />
                      ) : (
                        <Column style={styles.cardCoverPlaceholder}>
                          <Text style={styles.cardCoverPlaceholderText}>
                            暂无图片
                          </Text>
                        </Column>
                      )}
                    </Column>
                  </Row>
                </Card>
              </SwipeAction>
            );
          })
        )}
      </ScrollView>

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
            <ImagePicker
              label="图片"
              onChange={setBackgroundImage}
              labelText="选择图片"
              value={backgroundImage}
            />
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
