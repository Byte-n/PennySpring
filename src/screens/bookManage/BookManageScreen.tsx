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
  cardName: {
    fontSize: token.fontSizeLG,
    lineHeight: token.lineHeightLG,
    fontWeight: token.fontWeightStrong as TextStyle['fontWeight'],
    color: token.colorTextHeading,
  },
  cardDesc: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorTextDescription,
  },
  cardDescEmpty: {
    color: token.colorTextTertiary,
  },
  cardMetaGrid: {
    gap: token.marginXS,
    paddingTop: token.paddingSM,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorBorderSecondary,
  },
  cardMetaRow: {
    gap: token.marginXS,
  },
  cardMetaItem: {
    flex: 1,
    gap: token.marginXXS,
    minHeight: token.controlHeightSM,
    paddingVertical: token.paddingXS,
    paddingHorizontal: token.paddingSM,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillQuaternary,
  },
  cardMetaLabel: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorTextTertiary,
  },
  cardMetaValue: {
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
  cardCoverStatus: {
    alignSelf: 'flex-start',
    paddingVertical: token.paddingXXS,
    paddingHorizontal: token.paddingXS,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorPrimaryBg,
  },
  cardCoverStatusEmpty: {
    backgroundColor: token.colorFillTertiary,
  },
  cardCoverStatusText: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorPrimaryText,
  },
  cardCoverStatusTextEmpty: {
    color: token.colorTextTertiary,
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

type BookManageStyles = ReturnType<typeof useStyles>;

interface BookMetaProps {
  label: string;
  styles: BookManageStyles;
  value: string;
}

function BookMeta({ label, styles, value }: BookMetaProps) {
  return (
    <Column style={styles.cardMetaItem}>
      <Text style={styles.cardMetaLabel}>{label}</Text>
      <Text style={styles.cardMetaValue}>{value}</Text>
    </Column>
  );
}

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
                { key: 'edit', text: '编辑', color: 'primary', onPress: () => openEditDialog(book) },
                { key: 'delete', text: '删除', color: 'danger', onPress: () => handleDelete(book.id) },
              ]}
            >
              <Column style={styles.card}>
                <Row align="stretch" style={styles.cardMain}>
                  <Column style={styles.cardInfo}>
                    <Text style={styles.cardName}>{book.name}</Text>
                    <Text style={[styles.cardDesc, !book.description && styles.cardDescEmpty]}>
                      {book.description || '暂无描述'}
                    </Text>
                    <Column
                      style={[
                        styles.cardCoverStatus,
                        !book.background && styles.cardCoverStatusEmpty,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cardCoverStatusText,
                          !book.background && styles.cardCoverStatusTextEmpty,
                        ]}
                      >
                        {book.background ? '已设置封面' : '未设置封面'}
                      </Text>
                    </Column>
                  </Column>
                  <Column style={styles.cardCover}>
                    {book.background ? (
                      <Image resizeMode="cover" source={{ uri: book.background }} style={cardCoverImageStyle} />
                    ) : (
                      <Column style={styles.cardCoverPlaceholder}>
                        <Text style={styles.cardCoverPlaceholderText}>暂无图片</Text>
                      </Column>
                    )}
                  </Column>
                </Row>
                <Column style={styles.cardMetaGrid}>
                  <Row align="stretch" style={styles.cardMetaRow}>
                    <BookMeta label="账本编号" styles={styles} value={`#${book.id}`} />
                    <BookMeta label="创建时间" styles={styles} value={formatBookTime(book.createdTime)} />
                  </Row>
                  <Row align="stretch" style={styles.cardMetaRow}>
                    <BookMeta label="更新时间" styles={styles} value={formatBookTime(book.updatedTime)} />
                    <BookMeta label="封面数据" styles={styles} value={book.background ? '已保存 URI' : '空'} />
                  </Row>
                </Column>
              </Column>
            </SwipeAction>
          ))
        )}
      </ScrollView>

      <FloatingActionGroup actions={[{ key: 'create-book', icon: 'add', onPress: openCreateDialog }]} />

      <Dialog
        open={dialogOpen}
        onOpenChange={open => { if (!open) setDialogOpen(false); }}
        titleText={editingBook ? '编辑账本' : '新增账本'}
        onOk={handleOk}
        okDisabled={!name.trim()}
      >
        <Column style={styles.dialogBody}>
          <Input placeholder="账本名称" value={name} onChangeText={setName} />
          <Input placeholder="描述(可选)" value={description} onChangeText={setDescription} />
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
