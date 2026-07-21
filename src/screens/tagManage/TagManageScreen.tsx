import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Column,
  DisplayInput,
  Icon,
  Input,
  Popup,
  Row,
  Tag,
  Text,
  useToast,
} from '@pennyspring/ui';
import { api, VISIBILITY, type TagRow } from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PhosphorIconPicker } from '../../component/PhosphorIconPicker';
import { getPhosphorIconComponent } from '../../constants/typeIconTree';

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
    flex: 1,
    gap: token.marginSM,
    paddingHorizontal: token.padding,
  },
  tagContent: {
    gap: token.marginXXS,
  },
}));

export function TagManageScreen() {
  const styles = useStyles();
  const toast = useToast();

  const { data, refresh } = useRequest(() => api.tag.getAll());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');

  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagRow | null>(null);

  const openCreateDialog = useCallback(() => {
    setEditingTag(null);
    setName('');
    setIcon('');
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((tag: TagRow) => {
    setEditingTag(tag);
    setName(tag.name);
    setIcon(tag.icon);
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
        await api.tag.update({ id: editingTag.id, name: name.trim(), icon });
      } else {
        await api.tag.create({ name: name.trim(), icon });
      }
      setDialogOpen(false);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '操作失败' });
    }
  }, [name, icon, editingTag, refresh, toast]);

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
        await api.tag.update({
          id: tag.id,
          name: tag.name,
          icon: tag.icon,
          invisible,
        });
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
              <Row align="center" style={styles.tagContent}>
                {tag.icon ? (
                  <Icon icon={getPhosphorIconComponent(tag.icon)} size="small" />
                ) : null}
                <Text size="sm">{tag.name}</Text>
              </Row>
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

      <Popup.FloatingPanel
        height="85%"
        keyboardAvoiding
        open={dialogOpen}
        onOpenChange={open => {
          if (!open) setDialogOpen(false);
        }}
        titleText={editingTag ? '编辑标签' : '新增标签'}
        onOk={handleSave}
        okText={editingTag ? '保存' : '新增'}
        okDisabled={!name.trim()}
        styles={{ panelBody: styles.dialogBody }}
      >
        <Column>
          <Input placeholder="标签名称" value={name} onChange={setName} />
          <DisplayInput
            labelText="图标"
            placeholder="未选图标"
            valueText={icon}
            prefix={
              icon ? (
                <Icon icon={getPhosphorIconComponent(icon)} size="small" />
              ) : null
            }
            onPress={() => setIconPickerOpen(true)}
          />
        </Column>
        <PhosphorIconPicker
          open={iconPickerOpen}
          value={icon}
          onChange={setIcon}
          onOpenChange={setIconPickerOpen}
        />
      </Popup.FloatingPanel>
    </Column>
  );
}
