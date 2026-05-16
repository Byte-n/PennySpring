import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import {
  Column,
  Dialog,
  Empty,
  FloatingActionButton,
  Input,
  List,
  ListItem,
  SwipeAction,
  useToast,
} from '@pennyspring/component';
import { api, ICON, SYSTEM_STATUS, type TypeRow, type RecordTypeCategoryValue } from '@pennyspring/data';
import { createUseSheetStyle } from '@pennyspring/theme';

import type { RootStackParamList } from '../../navigation/types';

type TypeChildrenRouteProp = RouteProp<RootStackParamList, 'TypeChildren'>;

const useStyles = createUseSheetStyle(token => ({
  container: { flex: 1, backgroundColor: token.colorBgLayout },
  content: { flex: 1 },
  dialogBody: { gap: token.marginSM },
}));

export function TypeChildrenScreen() {
  const styles = useStyles();
  const toast = useToast();
  const route = useRoute<TypeChildrenRouteProp>();
  const { parentId, typeCategory } = route.params;

  const { data: allTypes = [], refresh } = useRequest(() => api.type.getByCategory(typeCategory as RecordTypeCategoryValue));

  const childTypes = useMemo(() => allTypes.filter(t => t.parentId === parentId), [allTypes, parentId]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<TypeRow | null>(null);
  const [name, setName] = useState('');

  const openCreateDialog = useCallback(() => {
    setEditingType(null);
    setName('');
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((type: TypeRow) => {
    setEditingType(type);
    setName(type.name);
    setDialogOpen(true);
  }, []);

  const handleOk = useCallback(async () => {
    try {
      if (editingType) {
        await api.type.update({ id: editingType.id, name, icon: editingType.icon, typeCategory: typeCategory as RecordTypeCategoryValue, parentId });
      } else {
        await api.type.create({ name, icon: ICON.other, typeCategory: typeCategory as RecordTypeCategoryValue, parentId });
      }
      setDialogOpen(false);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '操作失败' });
    }
  }, [editingType, name, typeCategory, parentId, refresh, toast]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await api.type.delete(id);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '删除失败' });
    }
  }, [refresh, toast]);

  return (
    <Column style={styles.container}>
      <ScrollView style={styles.content}>
        {childTypes.length === 0 ? (
          <Empty />
        ) : (
          <List divider="inset">
            {childTypes.map(type => {
              const isSystem = type.isSystem === SYSTEM_STATUS.system;

              if (isSystem) {
                return <ListItem key={type.id} titleText={type.name} />;
              }

              return (
                <SwipeAction
                  key={type.id}
                  rightActions={[
                    { key: 'delete', text: '删除', color: 'danger', onPress: () => handleDelete(type.id) },
                  ]}
                >
                  <ListItem titleText={type.name} onPress={() => openEditDialog(type)} />
                </SwipeAction>
              );
            })}
          </List>
        )}
      </ScrollView>

      <FloatingActionButton onPress={openCreateDialog} />

      <Dialog
        open={dialogOpen}
        onOpenChange={open => { if (!open) setDialogOpen(false); }}
        titleText={editingType ? '编辑类型' : '新增类型'}
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
