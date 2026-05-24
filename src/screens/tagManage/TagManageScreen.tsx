import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Column,
  Dialog,
  Input,
  Row,
  Tag,
  useToast,
} from '@pennyspring/ui';
import { api, VISIBILITY, type TagRow } from '@pennyspring/data';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  content: {
    flex: 1,
    padding: token.padding,
  },
  grid: {
    flexWrap: 'wrap',
    gap: token.marginSM,
  },
  chipHidden: {
    opacity: 0.5,
  },
  dialogBody: {
    gap: token.marginSM,
  },
}));

export function TagManageScreen() {
  const styles = useStyles();
  const toast = useToast();

  const { data, refresh } = useRequest(() => api.tag.getAll());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);
  const [name, setName] = useState('');

  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagRow | null>(null);

  const openCreateDialog = useCallback(() => {
    setEditingTag(null);
    setName('');
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((tag: TagRow) => {
    setEditingTag(tag);
    setName(tag.name);
    setDialogOpen(true);
  }, []);

  const handleLongPress = useCallback((tag: TagRow) => {
    setSelectedTag(tag);
    setActionSheetOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.show({ messageText: '请输入标签名称' });
      return;
    }
    try {
      if (editingTag) {
        await api.tag.update({ id: editingTag.id, name: name.trim() });
      } else {
        await api.tag.create({ name: name.trim() });
      }
      setDialogOpen(false);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '操作失败' });
    }
  }, [name, editingTag, refresh, toast]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await api.tag.delete(id);
        refresh();
      } catch (e: unknown) {
        toast.show({
          messageText: e instanceof Error ? e.message : '删除失败',
        });
      }
    },
    [refresh, toast],
  );

  const handleToggleVisibility = useCallback(
    async (tag: TagRow) => {
      try {
        const invisible =
          tag.invisible === VISIBILITY.hidden
            ? VISIBILITY.visible
            : VISIBILITY.hidden;
        await api.tag.update({ id: tag.id, name: tag.name, invisible });
        refresh();
      } catch (e: unknown) {
        toast.show({
          messageText: e instanceof Error ? e.message : '操作失败',
        });
      }
    },
    [refresh, toast],
  );

  const handleActionSheetAction = useCallback(
    (_action: { text: string }, index: number) => {
      if (!selectedTag) return;
      setActionSheetOpen(false);
      if (index === 0) {
        openEditDialog(selectedTag);
      } else if (index === 1) {
        handleToggleVisibility(selectedTag);
      } else if (index === 2) {
        handleDelete(selectedTag.id);
      }
    },
    [selectedTag, openEditDialog, handleToggleVisibility, handleDelete],
  );

  const tags = data ?? [];
  const actionSheetActions = selectedTag
    ? [
        { text: '编辑' },
        { text: selectedTag.invisible === VISIBILITY.hidden ? '显示' : '隐藏' },
        { text: '删除', danger: true },
      ]
    : [];

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Row style={styles.grid}>
          <Tag variant="outlined" onPress={openCreateDialog}>
            + 新增标签
          </Tag>
          {tags.map(tag => (
            <Tag
              key={tag.id}
              variant="outlined"
              style={[tag.invisible === VISIBILITY.hidden && styles.chipHidden]}
              onLongPress={() => handleLongPress(tag)}
            >
              {tag.name}
            </Tag>
          ))}
        </Row>
      </ScrollView>

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={open => {
          if (!open) setActionSheetOpen(false);
        }}
        actions={actionSheetActions}
        onAction={handleActionSheetAction}
        cancelText="取消"
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={open => {
          if (!open) setDialogOpen(false);
        }}
        titleText={editingTag ? '编辑标签' : '新增标签'}
        onOk={handleSave}
        okDisabled={!name.trim()}
      >
        <Column style={styles.dialogBody}>
          <Input placeholder="标签名称" value={name} onChangeText={setName} />
        </Column>
      </Dialog>
    </Column>
  );
}
