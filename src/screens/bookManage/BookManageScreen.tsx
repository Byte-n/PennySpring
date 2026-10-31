import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Button,
  Column,
  Form,
  Icon,
  ImagePicker,
  Input,
  Loading,
  Row,
  Segmented,
  Tag,
  Text,
  useToast,
  type ImagePickerValue,
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
  useNetworkBookStore,
} from '../../stores/networkBookStore';
import { BookList, type BookListItem } from '../../components/BookList';
import { FormFloatingPanel } from '../../components/FormFloatingPanel';
import { createHeaderAddButton } from '../../components/HeaderAddButton';
import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { ManageCard, ManageRow } from '../../components/ManageRow';
import { useNavigation } from '../../navigation';

type BookFormKind = 'local' | 'remote';

interface ConfirmState {
  kind: 'delete' | 'remove';
  item: BookListItem;
}

interface BookFormValues {
  name: string;
  description: string;
  backgroundImage?: ImagePickerValue;
  networkServerUrl: string;
}

const TypedForm = Form.infer<BookFormValues>();

const EMPTY_BOOK_FORM: BookFormValues = {
  name: '',
  description: '',
  backgroundImage: undefined,
  networkServerUrl: '',
};

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  remoteLoading: {
    paddingVertical: token.paddingSM,
  },
}));

function getImageValue(background: string): ImagePickerValue | undefined {
  return background ? { uri: background } : undefined;
}

function getImageUri(imageValue: ImagePickerValue | undefined): string {
  return imageValue?.uri ?? '';
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

export function BookManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const currentBook = useBookStore(state => state.currentBook);
  const initializeBook = useBookStore(state => state.initializeBook);
  const setCurrentBook = useBookStore(state => state.setCurrentBook);
  const networkRefs = useNetworkBookRefs();
  const addRef = useNetworkBookStore(state => state.addRef);
  const removeRef = useNetworkBookStore(state => state.removeRef);

  const { data: localBooks = [], loading: localLoading, refresh: refreshLocal } = useRequest(
    () => localApi.book.getAll(),
  );
  const {
    data: networkEntries = [],
    loading: networkDataLoading,
    refresh: refreshNetwork,
  } = useRequest(
    async () => {
      const settled = await Promise.allSettled(
        networkRefs.map(async ref => {
          const book = await getRemoteApi(ref.serverUrl).book.getById(
            ref.bookId,
          );
          return { ref, book };
        }),
      );
      return networkRefs.map((ref, index) => {
        const result = settled[index];
        if (result && result.status === 'fulfilled') {
          return { ref, book: result.value.book };
        }
        return {
          ref,
          error:
            result && result.status === 'rejected'
              ? getErrorMessage(result.reason, '连接失败')
              : '连接失败',
        };
      });
    },
    { refreshDeps: [JSON.stringify(networkRefs)] },
  );

  const refreshAll = useCallback(() => {
    refreshLocal();
    refreshNetwork();
  }, [refreshLocal, refreshNetwork]);

  const items: BookListItem[] = useMemo(
    () => [
      ...localBooks.map(row => ({
        entry: { kind: BOOK_TYPE.local, ...row } as BookEntry,
        ref: { kind: 'local' as const, id: row.id },
      })),
      ...networkEntries.map(({ ref, book, error }) => {
        const entry: BookEntry = book
          ? { kind: BOOK_TYPE.remote, ...book }
          : {
              background: '',
              createdTime: 0,
              description: '',
              id: ref.bookId,
              kind: BOOK_TYPE.remote,
              name: '网络账本',
              updatedTime: 0,
            };
        return {
          entry,
          error,
          networkRef: ref,
          ref: {
            kind: 'remote' as const,
            serverUrl: ref.serverUrl,
            bookId: ref.bookId,
          },
        };
      }),
    ],
    [localBooks, networkEntries],
  );

  const [menuItem, setMenuItem] = useState<BookListItem | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const [form] = TypedForm.useForm();
  const submitSucceededRef = useRef(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookRow | null>(null);
  const [formKind, setFormKind] = useState<BookFormKind>('local');
  const [networkError, setNetworkError] = useState('');
  const [serverBookList, setServerBookList] = useState<BookRow[]>([]);
  const [networkConnected, setNetworkConnected] = useState(false);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetNetworkState = useCallback(() => {
    setNetworkError('');
    setServerBookList([]);
    setNetworkConnected(false);
  }, []);

  const openCreate = useCallback(() => {
    setEditingBook(null);
    setFormKind('local');
    form.reset(EMPTY_BOOK_FORM);
    resetNetworkState();
    setNetworkLoading(false);
    setFormOpen(true);
  }, [form, resetNetworkState]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: createHeaderAddButton(openCreate),
    });
  }, [navigation, openCreate]);

  const openEdit = useCallback(
    (item: BookListItem) => {
      setEditingBook(item.entry);
      setFormKind('local');
      form.reset({
        name: item.entry.name,
        description: item.entry.description,
        backgroundImage: getImageValue(item.entry.background),
        networkServerUrl: '',
      });
      resetNetworkState();
      setNetworkLoading(false);
      setFormOpen(true);
    },
    [form, resetNetworkState],
  );

  const existingServerUrls = useMemo(() => {
    const urls = networkRefs.map(ref => ref.serverUrl);
    return Array.from(new Set(urls));
  }, [networkRefs]);

  const handleServerUrlInputChange = useCallback(() => {
    resetNetworkState();
  }, [resetNetworkState]);

  const handleSelectServerUrl = useCallback(
    (url: string) => {
      form.setFieldValue('networkServerUrl', url);
      resetNetworkState();
    },
    [form, resetNetworkState],
  );

  const handleConnect = useCallback(async () => {
    const url = form.getFieldValue('networkServerUrl').trim();
    if (!url) {
      return;
    }
    setNetworkLoading(true);
    setNetworkError('');
    try {
      const books = await getRemoteApi(url).book.getAll();
      setServerBookList(books);
      setNetworkConnected(true);
    } catch (error: unknown) {
      const message = getErrorMessage(error, '连接服务器失败');
      setServerBookList([]);
      setNetworkConnected(false);
      setNetworkError(message);
      toast.show({ messageText: message });
    } finally {
      setNetworkLoading(false);
    }
  }, [form, toast]);

  const addExistingRemoteBook = useCallback(
    (book: BookRow) => {
      addRef({
        serverUrl: form.getFieldValue('networkServerUrl').trim(),
        bookId: book.id,
      });
      toast.show({ messageText: `已添加网络账本「${book.name}」` });
      setFormOpen(false);
    },
    [addRef, form, toast],
  );

  const handleFinish = useCallback(
    async (values: BookFormValues) => {
      submitSucceededRef.current = false;
      setSubmitting(true);
      try {
        if (formKind === 'local') {
          const background = getImageUri(values.backgroundImage);
          if (editingBook) {
            const updated = await localApi.book.update({
              id: editingBook.id,
              name: values.name.trim(),
              description: values.description,
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
            await localApi.book.create({
              name: values.name.trim(),
              description: values.description,
              background,
            });
          }
          refreshAll();
          submitSucceededRef.current = true;
          return;
        }

        const url = values.networkServerUrl.trim();
        // 网络账本暂不支持上传图片，封面统一由客户端渲染为网络图标
        const created = await getRemoteApi(url).book.create({
          name: values.name.trim(),
          description: values.description,
          background: '',
        });
        addRef({ serverUrl: url, bookId: created.id });
        toast.show({ messageText: `已创建网络账本「${created.name}」` });
        submitSucceededRef.current = true;
      } catch (error: unknown) {
        toast.show({
          messageText: getErrorMessage(
            error,
            formKind === 'local' ? '操作失败' : '创建失败',
          ),
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      addRef,
      currentBook,
      editingBook,
      formKind,
      refreshAll,
      setCurrentBook,
      toast,
    ],
  );

  const handleBeforeSubmit = useCallback(
    async (values: BookFormValues): Promise<BookFormValues> => {
      const backgroundImage = values.backgroundImage;

      if (
        formKind !== 'local' ||
        backgroundImage === undefined ||
        backgroundImage.uri === editingBook?.background
      ) {
        return values;
      }

      return {
        ...values,
        backgroundImage: await ImagePicker.persistImage(backgroundImage),
      };
    },
    [editingBook, formKind],
  );

  const handlePanelOk = useCallback(async () => {
    submitSucceededRef.current = false;
    try {
      await form.handleSubmit();
    } catch (error: unknown) {
      toast.show({ messageText: getErrorMessage(error, '操作失败') });
    }
    return submitSucceededRef.current;
  }, [form, toast]);

  const handleSelectBook = useCallback(
    (ref: CurrentBookRef, entry: BookEntry) => {
      setCurrentBook(ref, entry);
      toast.show({ messageText: `已切换到${entry.name}` });
    },
    [setCurrentBook, toast],
  );

  const handleNetworkRetry = useCallback(() => {
    refreshNetwork();
    toast.show({ messageText: '正在重新连接网络账本' });
  }, [refreshNetwork, toast]);

  const handleSwipeEdit = useCallback(
    (book: BookRow) => {
      const item = items.find(
        entry =>
          entry.entry.kind === BOOK_TYPE.local && entry.entry.id === book.id,
      );
      if (item) {
        openEdit(item);
      }
    },
    [items, openEdit],
  );

  const handleSwipeDelete = useCallback(
    (id: number) => {
      const item = items.find(
        entry => entry.entry.kind === BOOK_TYPE.local && entry.entry.id === id,
      );
      if (item) {
        setConfirmState({ item, kind: 'delete' });
      }
    },
    [items],
  );

  const handleSwipeRemove = useCallback(
    (networkRef: NetworkBookRef) => {
      const item = items.find(
        entry =>
          entry.networkRef?.serverUrl === networkRef.serverUrl &&
          entry.networkRef.bookId === networkRef.bookId,
      );
      if (item) {
        setConfirmState({ item, kind: 'remove' });
      }
    },
    [items],
  );

  const menuActions = useMemo(() => {
    if (!menuItem) {
      return [];
    }
    if (menuItem.entry.kind === BOOK_TYPE.remote) {
      return [{ text: '移除缓存', icon: 'trash' as const, danger: true }];
    }
    return [
      { text: '编辑账本', icon: 'edit' as const },
      { text: '删除账本', icon: 'trash' as const, danger: true },
    ];
  }, [menuItem]);

  const handleMenuAction = useCallback(
    (_action: { text: string }, index: number) => {
      const item = menuItem;
      setMenuItem(null);
      if (!item) {
        return;
      }
      if (item.entry.kind === BOOK_TYPE.remote) {
        setConfirmState({ kind: 'remove', item });
        return;
      }
      if (index === 0) {
        openEdit(item);
      } else {
        setConfirmState({ kind: 'delete', item });
      }
    },
    [menuItem, openEdit],
  );

  const handleConfirm = useCallback(async () => {
    const state = confirmState;
    if (!state) {
      return;
    }
    if (state.kind === 'remove') {
      const networkRef = state.item.networkRef;
      if (networkRef) {
        removeRef(networkRef.serverUrl, networkRef.bookId);
        if (
          currentBook?.kind === BOOK_TYPE.remote &&
          currentBook.id === networkRef.bookId
        ) {
          await initializeBook();
        }
      }
      setConfirmState(null);
      toast.show({ messageText: '已移除网络账本缓存' });
      return;
    }

    await localApi.book.delete(state.item.entry.id);
    if (
      currentBook?.kind === BOOK_TYPE.local &&
      currentBook.id === state.item.entry.id
    ) {
      await initializeBook();
    }
    setConfirmState(null);
    refreshAll();
  }, [
    confirmState,
    currentBook,
    initializeBook,
    refreshAll,
    removeRef,
    toast,
  ]);

  const confirmIsCurrent =
    confirmState !== null &&
    currentBook?.kind === confirmState.item.entry.kind &&
    currentBook?.id === confirmState.item.entry.id;

  const formTitle = editingBook
    ? '编辑账本'
    : formKind === 'local'
      ? '新增本地账本'
      : '新增网络账本';
  const okText = editingBook ? '保存' : '创建账本';

  const serverBookRows = serverBookList.map((book, index) => (
    <ManageRow
      hasDivider={index > 0}
      key={book.id}
      icon={<Icon color="secondary" icon="list" size="large" />}
      onPress={() => addExistingRemoteBook(book)}
      subtitle={book.description || '服务器上的账本'}
      title={book.name}
    />
  ));

  return (
    <Column style={styles.container}>
      <BookList
        currentBook={currentBook}
        items={items}
        loading={localLoading || networkDataLoading}
        mode="manage"
        onBookMenu={setMenuItem}
        onBookSelect={handleSelectBook}
        onBookDelete={handleSwipeDelete}
        onBookEdit={handleSwipeEdit}
        onNetworkRemove={handleSwipeRemove}
        onNetworkRetry={handleNetworkRetry}
      />

      <FormFloatingPanel
        onOk={handlePanelOk}
        onOpenChange={open => {
          if (!open) {
            setFormOpen(false);
          }
        }}
        open={formOpen}
        submitLoading={submitting}
        submitText={okText}
        titleText={formTitle}
      >
        <TypedForm
          beforeSubmit={handleBeforeSubmit}
          form={form}
          labelMode="child"
          onFinish={handleFinish}
        >
          <Column>
            <Segmented
              block
              onChange={value => setFormKind(value as BookFormKind)}
              options={[
                { label: '本地账本', value: 'local' },
                {
                  disabled: editingBook !== null,
                  label: '网络账本',
                  value: 'remote',
                },
              ]}
              value={formKind}
            />
          </Column>

          <TypedForm.Item
            name="name"
            labelText="名称"
            required
            requiredMessage="请输入账本名称"
          >
            <Input placeholder="例如：家庭账本" />
          </TypedForm.Item>
          <TypedForm.Item name="description" labelText="描述（可选）">
            <Input placeholder="一句话说明这本账用在哪儿" />
          </TypedForm.Item>

          {formKind === 'local' ? (
            <TypedForm.Item name="backgroundImage" labelText="封面">
              <ImagePicker />
            </TypedForm.Item>
          ) : (
            <>
              <TypedForm.Item
                name="networkServerUrl"
                labelText="服务器地址"
                required
                requiredMessage="请输入服务器地址"
              >
                <Input
                  onChange={handleServerUrlInputChange}
                  placeholder="http://192.168.1.12:8787"
                />
              </TypedForm.Item>
              <TypedForm.Subscribe
                selector={state => state.values.networkServerUrl}
              >
                {networkServerUrl => (
                  <>
                    {networkError ? (
                      <Text color="errorText" size="xs">
                        {networkError}
                      </Text>
                    ) : null}
                    {existingServerUrls.length > 0 ? (
                      <Column gap="small">
                        <Text size="xs" color="tertiary">
                          最近使用
                        </Text>
                        <Row gap="small" wrap>
                          {existingServerUrls.map(url => (
                            <Tag
                              key={url}
                              color="default"
                              onPress={() => handleSelectServerUrl(url)}
                              size="small"
                              variant="filled"
                            >
                              {url}
                            </Tag>
                          ))}
                        </Row>
                      </Column>
                    ) : null}
                    <Button
                      block
                      disabled={!networkServerUrl.trim() || networkLoading}
                      onPress={handleConnect}
                      size="small"
                      type="dashed"
                    >
                      {networkLoading
                        ? '连接中…'
                        : networkConnected
                          ? '重新读取服务器账本'
                          : '连接并读取服务器账本'}
                    </Button>
                    {networkLoading ? (
                      <Column style={styles.remoteLoading}>
                        <Loading size="small" text="连接中..." />
                      </Column>
                    ) : null}
                    {networkConnected ? (
                      serverBookList.length > 0 ? (
                        <Column gap="small">
                          <Text size="xs" color="tertiary">
                            服务器上的账本 · 轻点添加到本机
                          </Text>
                          <ManageCard>{serverBookRows}</ManageCard>
                        </Column>
                      ) : (
                        <Text size="xs" color="tertiary">
                          该服务器暂无账本，可直接创建。
                        </Text>
                      )
                    ) : null}
                    <Text size="xs" color="tertiary">
                      网络账本的封面统一使用网络图标，由服务器返回的账本信息决定
                    </Text>
                  </>
                )}
              </TypedForm.Subscribe>
            </>
          )}
        </TypedForm>
      </FormFloatingPanel>

      <ActionSheet
        actions={menuActions}
        cancelText="取消"
        onAction={handleMenuAction}
        onOpenChange={open => {
          if (!open) {
            setMenuItem(null);
          }
        }}
        open={menuItem !== null}
        titleText={menuItem?.entry.name}
      />

      <ManageConfirmDialog
        messageText={
          confirmState?.kind === 'remove'
            ? '只会从本机列表移除，不会删除服务器上的账本。'
            : '删除后账本内的记录与配置将一并移除，且无法恢复。'
        }
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
        open={confirmState !== null}
        titleText={
          confirmState?.kind === 'remove'
            ? `移除「${confirmState.item.entry.name}」缓存？`
            : confirmState
              ? `删除「${confirmState.item.entry.name}」？`
              : '删除账本'
        }
        warningText={
          confirmIsCurrent
            ? '这是当前账本，操作完成后会重新初始化账本。'
            : undefined
        }
      />
    </Column>
  );
}
