import React, { useCallback, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import type { ImageStyle, StyleProp, TextStyle } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Column,
  Dialog,
  Empty,
  FloatingActionGroup,
  ImagePicker,
  Input,
  Row,
  SwipeAction,
  Tag,
  Text,
  useToast,
} from '@pennyspring/ui';
import type { ImagePickerValue } from '@pennyspring/ui';
import { api, type BookRow } from '@pennyspring/data';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';

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
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.padding,
    gap: token.marginSM,
    ...toShadowStyle(token.boxShadowTertiary),
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
  cardDesc: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorTextDescription,
  },
  cardDescEmpty: {
    color: token.colorTextTertiary,
  },
  cardTimeSummary: {
    gap: token.marginXS,
    paddingTop: token.paddingSM,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorBorderSecondary,
  },
  cardTimeText: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorTextSecondary,
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
  const { data: books = [], refresh } = useRequest(() => api.book.getAll());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookRow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundImage, setBackgroundImage] = useState<ImagePickerValue | undefined>();

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
        await api.book.update({ id: editingBook.id, name, description, background });
      } else {
        await api.book.create({ name, description, background });
      }
      setDialogOpen(false);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '操作失败' });
    }
  }, [backgroundImage, editingBook, name, description, refresh, toast]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await api.book.delete(id);
        refresh();
      } catch (e: unknown) {
        toast.show({ messageText: e instanceof Error ? e.message : '删除失败' });
      }
    },
    [refresh, toast],
  );

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {books.length === 0 ? (
          <Empty />
        ) : (
          books.map(book => (
            <SwipeAction
              key={book.id}
              rightActions={[
                {
                  key: 'edit',
                  text: '编辑',
                  color: 'primary',
                  onPress: () => openEditDialog(book),
                },
                {
                  key: 'delete',
                  text: '删除',
                  color: 'danger',
                  onPress: () => handleDelete(book.id),
                },
              ]}
            >
              <Column style={styles.card}>
                <Row align="center" style={styles.cardMain}>
                  <Column style={styles.cardInfo}>
                    <Row style={styles.cardTitle}>
                      <Text numberOfLines={1} style={styles.cardName}>
                        {book.name}
                      </Text>
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
                    >
                      {book.description || '暂无描述'}
                    </Text>
                    <Column style={styles.cardTimeSummary}>
                      <Text style={styles.cardTimeText}>
                        {`创建：${formatBookTime(book.createdTime)}`}
                      </Text>
                      <Text style={styles.cardTimeText}>
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
              </Column>
            </SwipeAction>
          ))
        )}
      </ScrollView>

      <FloatingActionGroup
        actions={[
          { key: 'create-book', icon: 'add', onPress: openCreateDialog },
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
          <Input placeholder="账本名称" value={name} onChangeText={setName} />
          <Input
            placeholder="描述(可选)"
            value={description}
            onChangeText={setDescription}
          />
          <ImagePicker
            label="图片"
            onChange={setBackgroundImage}
            placeholder="选择图片"
            value={backgroundImage}
          />
        </Column>
      </Dialog>
    </Column>
  );
}
