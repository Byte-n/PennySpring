import React, { useCallback, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
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
    minHeight: token.controlHeightLG * 2,
    ...toShadowStyle(token.boxShadowTertiary),
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: token.padding,
  },
  cardName: {
    fontSize: token.fontSize,
    fontWeight: '500',
    color: token.colorText,
  },
  cardDesc: {
    fontSize: token.fontSizeSM,
    color: token.colorTextSecondary,
    marginTop: token.marginXXS,
  },
  cardCover: {
    width: token.controlHeightLG * 2,
    height: token.controlHeightLG * 2,
    borderRadius: token.borderRadius,
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

function getImageValue(background: string): ImagePickerValue | undefined {
  return background ? { uri: background } : undefined;
}

export function BookManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const { data: books = [], refresh } = useRequest(() => api.book.getAll());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookRow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState('');

  const openCreateDialog = useCallback(() => {
    setEditingBook(null);
    setName('');
    setDescription('');
    setBackground('');
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((book: BookRow) => {
    setEditingBook(book);
    setName(book.name);
    setDescription(book.description);
    setBackground(book.background);
    setDialogOpen(true);
  }, []);

  const handleOk = useCallback(async () => {
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
  }, [editingBook, name, description, background, refresh, toast]);

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
              <Row align="stretch" style={styles.card}>
                <Column style={styles.cardInfo}>
                  <Text style={styles.cardName}>{book.name}</Text>
                  {book.description ? <Text style={styles.cardDesc}>{book.description}</Text> : null}
                </Column>
                <View style={styles.cardCover}>
                  {book.background ? (
                    <Image resizeMode="cover" source={{ uri: book.background }} style={styles.cardCoverImage} />
                  ) : (
                    <View style={styles.cardCoverPlaceholder}>
                      <Text style={styles.cardCoverPlaceholderText}>暂无图片</Text>
                    </View>
                  )}
                </View>
              </Row>
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
            onChange={value => setBackground(value.uri)}
            placeholder="选择图片"
            value={getImageValue(background)}
          />
        </Column>
      </Dialog>
    </Column>
  );
}
