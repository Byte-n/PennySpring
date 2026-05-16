import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import {
  Column,
  Dialog,
  Empty,
  FloatingActionButton,
  Icon,
  Input,
  ListItem,
  Row,
  Spacer,
  SwipeAction,
  Switch,
  Text,
  useToast,
} from '@pennyspring/component';
import { api, VISIBILITY, type TagRow } from '@pennyspring/data';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  list: {
    backgroundColor: token.colorBgContainer,
  },
  hiddenIndicator: {
    color: token.colorTextTertiary,
  },
}));

export function TagManageScreen() {
  const styles = useStyles();
  const { token } = useTheme();
  const toast = useToast();

  const { data, loading, refresh } = useRequest(() => api.tag.getAll());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);
  const [name, setName] = useState('');
  const [isHidden, setIsHidden] = useState(false);

  const openCreateDialog = useCallback(() => {
    setEditingTag(null);
    setName('');
    setIsHidden(false);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((tag: TagRow) => {
    setEditingTag(tag);
    setName(tag.name);
    setIsHidden(tag.invisible === VISIBILITY.hidden);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.show({ messageText: '请输入标签名称' });
      return;
    }

    try {
      const invisible = isHidden ? VISIBILITY.hidden : VISIBILITY.visible;
      if (editingTag) {
        await api.tag.update({ id: editingTag.id, name: name.trim(), invisible });
      } else {
        await api.tag.create({ name: name.trim(), invisible });
      }
      setDialogOpen(false);
      refresh();
    } catch (error) {
      toast.show({
        messageText: error instanceof Error ? error.message : '操作失败',
      });
    }
  }, [name, isHidden, editingTag, refresh, toast]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await api.tag.delete(id);
        refresh();
      } catch (error) {
        toast.show({
          messageText: error instanceof Error ? error.message : '删除失败',
        });
      }
    },
    [refresh, toast],
  );

  const tags = data ?? [];

  return (
    <Column style={styles.container}>
      <ScrollView style={styles.list}>
        {tags.length === 0 && !loading ? (
          <Empty />
        ) : (
          tags.map(tag => (
            <SwipeAction
              key={tag.id}
              rightActions={[
                {
                  key: 'delete',
                  text: '删除',
                  color: 'danger',
                  onPress: () => handleDelete(tag.id),
                },
              ]}
            >
              <ListItem
                titleText={tag.name}
                right={
                  tag.invisible === VISIBILITY.hidden ? (
                    <Text size="sm" style={styles.hiddenIndicator}>
                      已隐藏
                    </Text>
                  ) : null
                }
                onPress={() => openEditDialog(tag)}
              />
            </SwipeAction>
          ))
        )}
      </ScrollView>

      <FloatingActionButton icon={<Icon icon="add" />} onPress={openCreateDialog} />

      <Dialog
        open={dialogOpen}
        onOpenChange={open => setDialogOpen(open)}
        titleText={editingTag ? '编辑标签' : '新建标签'}
        okText="保存"
        cancelText="取消"
        onOk={handleSave}
      >
        <Column>
          <Input placeholder="标签名称" value={name} onChangeText={setName} />
          <Spacer size={token.marginMD} />
          <Row>
            <Text>隐藏标签</Text>
            <Spacer size={token.marginSM} />
            <Switch value={isHidden} onChange={setIsHidden} />
          </Row>
        </Column>
      </Dialog>
    </Column>
  );
}
