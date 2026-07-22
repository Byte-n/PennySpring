import React, { useCallback, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import type { ImageStyle, StyleProp, TextStyle } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Card,
  Column,
  Dialog,
  Empty,
  FloatingActionGroup,
  Icon,
  ImagePicker,
  Input,
  Row,
  SwipeAction,
  Tag,
  Text,
  useToast,
} from '@pennyspring/ui';
import type { ImagePickerValue } from '@pennyspring/ui';
import { localApi, type BookRow } from '@pennyspring/api';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import { useBookStore } from '../../stores/bookStore';

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
  item: {
    ...toShadowStyle(token.boxShadowTertiary),
    borderRadius: token.borderRadiusLG,
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
  cardPressed: {
    backgroundColor: token.colorFillTertiary,
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

export function BookManageScreen() {
  const styles = useStyles();
  const cardCoverImageStyle = styles.cardCoverImage as StyleProp<ImageStyle>;
  const toast = useToast();
  const { data: books = [], refresh } = useRequest(() => localApi.book.getAll());
  const currentBook = useBookStore(state => state.currentBook);
  const initializeBook = useBookStore(state => state.initializeBook);
  const setCurrentBook = useBookStore(state => state.setCurrentBook);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookRow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundImage, setBackgroundImage] = useState<
    ImagePickerValue | undefined
  >();

  const openCreateDialog = useCallback(() => {
    setEditingBook(null);
    setName('');
    setDescription('');
    setBackgroundImage(undefined);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((book: BookRow) => {
    setEditingBook(book);
    setName(book.name);
    setDescription(book.description);
    setBackgroundImage(getImageValue(book.background));
    setDialogOpen(true);
  }, []);

  const handleOk = useCallback(async () => {
    const background = getImageUri(backgroundImage);

    try {
      if (editingBook) {
        const updatedBook = await localApi.book.update({
          id: editingBook.id,
          name,
          description,
          background,
        });
        if (currentBook?.id === updatedBook.id) {
          setCurrentBook(updatedBook);
        }
      } else {
        await localApi.book.create({ name, description, background });
      }
      setDialogOpen(false);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '操作失败' });
    }
  }, [
    backgroundImage,
    currentBook,
    editingBook,
    name,
    description,
    refresh,
    setCurrentBook,
    toast,
  ]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await localApi.book.delete(id);
        if (currentBook?.id === id) {
          await initializeBook();
        }
        refresh();
      } catch (e: unknown) {
        toast.show({
          messageText: e instanceof Error ? e.message : '删除失败',
        });
      }
    },
    [currentBook, initializeBook, refresh, toast],
  );

  const handleSelectBook = useCallback(
    (book: BookRow) => {
      setCurrentBook(book);
      toast.show({ messageText: `已切换到${book.name}` });
    },
    [setCurrentBook, toast],
  );

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {books.length === 0 ? (
          <Empty />
        ) : (
          books.map(book => {
            const isCurrentBook = currentBook?.id === book.id;

            return (
              <SwipeAction
                key={book.id}
                leftActions={[
                  {
                    key: 'select',
                    actionText: isCurrentBook ? '当前' : '选择',
                    color: isCurrentBook ? 'weak' : 'success',
                    disabled: isCurrentBook,
                    onPress: () => handleSelectBook(book),
                  },
                ]}
                rightActions={[
                  {
                    key: 'edit',
                    actionText: '编辑',
                    color: 'primary',
                    onPress: () => openEditDialog(book),
                  },
                  {
                    key: 'delete',
                    actionText: '删除',
                    color: 'danger',
                    onPress: () => handleDelete(book.id),
                  },
                ]}
              >
                <Card
                  style={[styles.card, isCurrentBook && styles.cardSelected]}
                >
                  <Row align="center" style={styles.cardMain}>
                    <Column style={styles.cardInfo}>
                      <Row style={styles.cardTitle}>
                        <Text numberOfLines={1} style={styles.cardName}>
                          {book.name}
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
                          styles={{ content: styles.cardIdTagText }}
                        >
                          {`#${book.id}`}
                        </Tag>
                      </Row>
                      <Text
                        style={[
                          styles.cardDesc,
                          !book.description && styles.cardDescEmpty,
                        ]}
                        color="tertiary"
                      >
                        {book.description || '暂无描述'}
                      </Text>
                      <Column style={styles.cardTimeSummary}>
                        <Text color="quaternary" size="sm">
                          {`创建：${formatBookTime(book.createdTime)}`}
                        </Text>
                        <Text color="quaternary" size="sm">
                          {`更新：${formatBookTime(book.updatedTime)}`}
                        </Text>
                      </Column>
                    </Column>
                    <Column style={styles.cardCover}>
                      {book.background ? (
                        <Image
                          resizeMode="cover"
                          source={{ uri: book.background }}
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
            onPress: openCreateDialog,
            buttonProps: { color: 'orange' },
          },
        ]}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={open => {
          if (!open) setDialogOpen(false);
        }}
        titleText={editingBook ? '编辑账本' : '新增账本'}
        onOk={handleOk}
        okDisabled={!name.trim()}
      >
        <Column style={styles.dialogBody}>
          <Input
            labelText="账本名称"
            placeholder="请输入"
            value={name}
            onChange={setName}
          />
          <Input
            labelText="aa"
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
      </Dialog>
    </Column>
  );
}
