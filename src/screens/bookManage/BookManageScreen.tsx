import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Column,
  Dialog,
  Empty,
  FloatingActionGroup,
  Input,
  List,
  ListItem,
  SwipeAction,
  useToast,
} from '@pennyspring/component';
import { api, type BookRow } from '@pennyspring/data';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: token.padding,
  },
  dialogBody: {
    gap: token.marginSM,
  },
}));

export function BookManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const { data: books = [], refresh } = useRequest(() => api.book.getAll());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookRow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openCreateDialog = useCallback(() => {
    setEditingBook(null);
    setName('');
    setDescription('');
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((book: BookRow) => {
    setEditingBook(book);
    setName(book.name);
    setDescription(book.description);
    setDialogOpen(true);
  }, []);

  const handleOk = useCallback(async () => {
    try {
      if (editingBook) {
        await api.book.update({ id: editingBook.id, name, description });
      } else {
        await api.book.create({ name, description });
      }
      setDialogOpen(false);
      refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '操作失败';
      toast.show({ messageText: msg });
    }
  }, [editingBook, name, description, refresh, toast]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await api.book.delete(id);
        refresh();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '删除失败';
        toast.show({ messageText: msg });
      }
    },
    [refresh, toast],
  );

  return (
    <Column style={styles.container}>
      <ScrollView style={styles.content}>
        {books.length === 0 ? (
          <Empty />
        ) : (
          <List divider="inset">
            {books.map(book => (
              <SwipeAction
                key={book.id}
                rightActions={[
                  {
                    key: 'delete',
                    text: '删除',
                    color: 'danger',
                    onPress: () => handleDelete(book.id),
                  },
                ]}
              >
                <ListItem
                  titleText={book.name}
                  descriptionText={book.description}
                  onPress={() => openEditDialog(book)}
                />
              </SwipeAction>
            ))}
          </List>
        )}
      </ScrollView>

      <FloatingActionGroup actions={[{ key: 'create-book', icon: 'add', onPress: openCreateDialog }]} />

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
        </Column>
      </Dialog>
    </Column>
  );
}
