import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Column,
  Dialog,
  Empty,
  FloatingActionGroup,
  Input,
  Row,
  Segmented,
  SwipeAction,
  Text,
  useToast,
} from '@pennyspring/component';
import { api, ICON, RECORD_TYPE_CATEGORY, SYSTEM_STATUS, type TypeRow, type RecordTypeCategoryValue } from '@pennyspring/data';
import { createUseSheetStyle } from '@pennyspring/theme';

const CATEGORY_OPTIONS = [
  { value: RECORD_TYPE_CATEGORY.expense, label: '支出' },
  { value: RECORD_TYPE_CATEGORY.income, label: '收入' },
  { value: RECORD_TYPE_CATEGORY.transfer, label: '转账' },
];

const useStyles = createUseSheetStyle(token => ({
  container: { flex: 1, backgroundColor: token.colorBgLayout },
  segmented: { padding: token.padding },
  tabScroll: { paddingHorizontal: token.padding, paddingVertical: token.paddingXS },
  tabRow: { gap: token.marginXS },
  contentScroll: { flex: 1 },
  tab: {
    paddingVertical: token.paddingXS,
    paddingHorizontal: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorBgContainer,
  },
  tabActive: {
    backgroundColor: token.colorPrimaryBg,
  },
  tabText: { fontSize: token.fontSizeSM, color: token.colorText },
  tabTextActive: { color: token.colorPrimary },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: token.padding,
    gap: token.marginSM,
  },
  gridItem: {
    alignItems: 'center',
    width: 56,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: token.colorBgContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridName: {
    fontSize: token.fontSizeSM,
    color: token.colorText,
    marginTop: token.marginXXS,
    textAlign: 'center',
  },
  dialogBody: { gap: token.marginSM },
}));

export function TypeManageScreen() {
  const styles = useStyles();
  const toast = useToast();

  const [category, setCategory] = useState<RecordTypeCategoryValue>(RECORD_TYPE_CATEGORY.expense);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  const { data: allTypes = [], refresh } = useRequest(
    () => api.type.getByCategory(category),
    { refreshDeps: [category] },
  );

  const parentTypes = useMemo(() => allTypes.filter(t => t.parentId === 0), [allTypes]);
  const childTypes = useMemo(
    () => selectedParentId ? allTypes.filter(t => t.parentId === selectedParentId) : [],
    [allTypes, selectedParentId],
  );

  useEffect(() => {
    if (parentTypes.length > 0 && !parentTypes.find(p => p.id === selectedParentId)) {
      setSelectedParentId(parentTypes[0].id);
    }
  }, [parentTypes, selectedParentId]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<TypeRow | null>(null);
  const [isCreatingParent, setIsCreatingParent] = useState(false);
  const [name, setName] = useState('');

  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<TypeRow | null>(null);

  const openCreateChildDialog = useCallback(() => {
    setEditingType(null);
    setIsCreatingParent(false);
    setName('');
    setDialogOpen(true);
  }, []);

  const openCreateParentDialog = useCallback(() => {
    setEditingType(null);
    setIsCreatingParent(true);
    setName('');
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((type: TypeRow) => {
    setEditingType(type);
    setIsCreatingParent(type.parentId === 0);
    setName(type.name);
    setDialogOpen(true);
  }, []);

  const handleParentLongPress = useCallback((parent: TypeRow) => {
    if (parent.isSystem === SYSTEM_STATUS.system) return;
    setSelectedParent(parent);
    setActionSheetOpen(true);
  }, []);

  const handleOk = useCallback(async () => {
    try {
      const parentId = isCreatingParent ? 0 : (selectedParentId ?? 0);
      if (editingType) {
        await api.type.update({ id: editingType.id, name, icon: editingType.icon, typeCategory: category, parentId: editingType.parentId });
      } else {
        await api.type.create({ name, icon: ICON.other, typeCategory: category, parentId });
      }
      setDialogOpen(false);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '操作失败' });
    }
  }, [editingType, name, category, isCreatingParent, selectedParentId, refresh, toast]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await api.type.delete(id);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '删除失败' });
    }
  }, [refresh, toast]);

  const handleParentAction = useCallback(
    (_action: { text: string }, index: number) => {
      if (!selectedParent) return;
      setActionSheetOpen(false);
      if (index === 0) {
        openEditDialog(selectedParent);
      } else if (index === 1) {
        handleDelete(selectedParent.id);
      }
    },
    [selectedParent, openEditDialog, handleDelete],
  );

  const dialogTitle = useMemo(() => {
    if (editingType) return '编辑类型';
    return isCreatingParent ? '新增一级类型' : '新增二级类型';
  }, [editingType, isCreatingParent]);

  return (
    <Column style={styles.container}>
      <Row style={styles.segmented}>
        <Segmented
          block
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={v => setCategory(v as RecordTypeCategoryValue)}
        />
      </Row>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <Row style={styles.tabRow}>
          {parentTypes.map(parent => (
            <Pressable
              key={parent.id}
              style={[styles.tab, parent.id === selectedParentId && styles.tabActive]}
              onPress={() => setSelectedParentId(parent.id)}
              onLongPress={() => handleParentLongPress(parent)}
            >
              <Text style={[styles.tabText, parent.id === selectedParentId && styles.tabTextActive]}>
                {parent.name}
              </Text>
            </Pressable>
          ))}
        </Row>
      </ScrollView>

      <ScrollView style={styles.contentScroll}>
        {childTypes.length === 0 ? (
          <Empty />
        ) : (
          <View style={styles.grid}>
            {childTypes.map(child => {
              const isSystem = child.isSystem === SYSTEM_STATUS.system;
              if (isSystem) {
                return (
                  <Column key={child.id} style={styles.gridItem}>
                    <View style={styles.gridIcon}>
                      <Text>{child.icon}</Text>
                    </View>
                    <Text style={styles.gridName} numberOfLines={1}>{child.name}</Text>
                  </Column>
                );
              }
              return (
                <SwipeAction
                  key={child.id}
                  rightActions={[
                    { key: 'edit', text: '编辑', color: 'primary', onPress: () => openEditDialog(child) },
                    { key: 'delete', text: '删除', color: 'danger', onPress: () => handleDelete(child.id) },
                  ]}
                >
                  <Column style={styles.gridItem}>
                    <View style={styles.gridIcon}>
                      <Text>{child.icon}</Text>
                    </View>
                    <Text style={styles.gridName} numberOfLines={1}>{child.name}</Text>
                  </Column>
                </SwipeAction>
              );
            })}
          </View>
        )}
      </ScrollView>

      <FloatingActionGroup
        actions={[
          { key: 'create-child', icon: 'add', label: '新增子类型', onPress: openCreateChildDialog },
          { key: 'create-parent', icon: 'add', label: '新增一级类型', onPress: openCreateParentDialog },
        ]}
      />

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={open => { if (!open) setActionSheetOpen(false); }}
        actions={[{ text: '编辑' }, { text: '删除', danger: true }]}
        onAction={handleParentAction}
        cancelText="取消"
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={open => { if (!open) setDialogOpen(false); }}
        titleText={dialogTitle}
        onOk={handleOk}
        okDisabled={!name.trim()}
      >
        <Column style={styles.dialogBody}>
          <Input placeholder="类型名称" value={name} onChangeText={setName} />
        </Column>
      </Dialog>
    </Column>
  );
}
