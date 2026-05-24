import React, { useCallback, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import {
  Column,
  Dialog,
  Input,
  Row,
  Segmented,
  useToast,
} from '@pennyspring/ui';
import {
  api,
  ICON,
  RECORD_TYPE_CATEGORY,
  type TypeRow,
  type RecordTypeCategoryValue,
} from '@pennyspring/data';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { CategoryGrid, CategoryItem } from '../../component/CategoryGrid';
import { PlusSquareIcon } from 'phosphor-react-native';
import { ScrollView } from 'react-native';

const CATEGORY_OPTIONS = [
  { value: RECORD_TYPE_CATEGORY.expense, label: '支出' },
  { value: RECORD_TYPE_CATEGORY.income, label: '收入' },
  { value: RECORD_TYPE_CATEGORY.transfer, label: '转账' },
];

const useStyles = createUseSheetStyle(token => ({
  container: { flex: 1, backgroundColor: token.colorBgLayout },
  segmented: { padding: token.padding },
  contentScroll: { flex: 1 },
  dialogBody: { gap: token.marginSM },
}));

export function TypeManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const { token } = useTheme()

  const [category, setCategory] = useState<RecordTypeCategoryValue>(
    RECORD_TYPE_CATEGORY.expense,
  );

  const { data: allTypes = [], refresh } = useRequest(
    () => api.type.getByCategory(category),
    { refreshDeps: [category] },
  );

  const realTypes = useMemo(() => {
    const parentTypes = allTypes.filter(v => v.parentId === 0);
    return [
      {
        id: 0,
        name: '新增',
        parentId: 0,
        icon: PlusSquareIcon,
        updatedTime: Date.now(),
        createdTime: Date.now(),
        typeCategory: category,
        isSystem: 'system',
        specialBehavior: '',
        sort: 0,
        expand: false,
      } satisfies CategoryItem,
      ...parentTypes.map(
        v =>
          ({
            id: -v.id,
            name: '新增',
            parentId: v.id,
            icon: PlusSquareIcon,
            updatedTime: Date.now(),
            createdTime: Date.now(),
            typeCategory: category,
            isSystem: 'system',
            specialBehavior: '',
            sort: 0,
            expand: false,
          } satisfies CategoryItem),
      ),
      ...allTypes,
    ];
  }, [allTypes]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<TypeRow | null>(null);
  const [isCreatingParent, setIsCreatingParent] = useState(false);
  const [createParentId, setCreateParentId] = useState(0);
  const [name, setName] = useState('');

  const openCreateParentDialog = useCallback(() => {
    setEditingType(null);
    setIsCreatingParent(true);
    setName('');
    setDialogOpen(true);
  }, []);

  const openCreateChildDialog = useCallback((parentId: number) => {
    setEditingType(null);
    setIsCreatingParent(false);
    setCreateParentId(parentId);
    setName('');
    setDialogOpen(true);
  }, []);

  const handleOk = useCallback(async () => {
    try {
      const parentId = isCreatingParent ? 0 : createParentId;
      if (editingType) {
        await api.type.update({
          id: editingType.id,
          name,
          icon: editingType.icon,
          typeCategory: category,
          parentId: editingType.parentId,
        });
      } else {
        await api.type.create({
          name,
          icon: ICON.other,
          typeCategory: category,
          parentId,
        });
      }
      setDialogOpen(false);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '操作失败' });
    }
  }, [
    editingType,
    name,
    category,
    isCreatingParent,
    createParentId,
    refresh,
    toast,
  ]);

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

      <ScrollView style={styles.contentScroll}>
        <CategoryGrid
          style={{ marginHorizontal: token.marginMD }}
          categories={realTypes}
          onSelect={id => {
            if (id === 0) {
              openCreateParentDialog();
            } else if (id < 0) {
              openCreateChildDialog(-id);
            }
          }}
        />
      </ScrollView>

      <Dialog
        open={dialogOpen}
        onOpenChange={open => {
          if (!open) setDialogOpen(false);
        }}
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
