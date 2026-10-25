import React, { useCallback, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Column,
  Dialog,
  DisplayInput,
  Icon,
  Input,
  Popup,
  Row,
  Segmented,
  Text,
  useToast,
  type ActionSheetAction,
} from '@pennyspring/ui';
import {
  RECORD_TYPE_CATEGORY,
  type TypeRow,
  type RecordTypeCategoryValue,
} from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/theme';
import { CategoryGrid, CategoryItem } from '../../component/CategoryGrid';
import { PhosphorIconPicker } from '../../component/PhosphorIconPicker';
import { getPhosphorIconComponent } from '../../constants/typeIconTree';
import { PlusSquareIcon } from 'phosphor-react-native';
import { ScrollView } from 'react-native';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';

const CATEGORY_OPTIONS = [
  { value: RECORD_TYPE_CATEGORY.expense, label: '支出' },
  { value: RECORD_TYPE_CATEGORY.income, label: '收入' },
  { value: RECORD_TYPE_CATEGORY.transfer, label: '转账' },
];

const TYPE_ACTIONS: ActionSheetAction[] = [{ text: '编辑' }, { text: '删除', danger: true }];

const TYPE_DELETE_ERROR_HINTS = [
  { keyword: 'Type is in use', message: '该类型已被记录使用，无法删除' },
  { keyword: 'Type has children', message: '请先删除该类型下的二级类型' },
];

function getTypeDeleteErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  const hint = TYPE_DELETE_ERROR_HINTS.find(v => message.includes(v.keyword));
  return hint?.message ?? (message || '删除失败');
}

const useStyles = createUseSheetStyle(token => ({
  container: { flex: 1, backgroundColor: token.colorBgLayout },
  segmented: { padding: token.padding },
  hint: {
    paddingHorizontal: token.padding,
    paddingBottom: token.paddingSM,
  },
  contentScroll: { flex: 1 },
  categoryGrid: { marginHorizontal: token.marginMD },
  dialogBody: {
    flex: 1,
    gap: token.marginSM,
    paddingHorizontal: token.padding,
  },
}));

export function TypeManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();

  const [category, setCategory] = useState<RecordTypeCategoryValue>(
    RECORD_TYPE_CATEGORY.expense,
  );

  const { data: allTypes = [], refresh } = useRequest(
    () => {
      if (!currentBook) return Promise.resolve([]);
      return globalApi.type.getByCategory(category, currentBook.id);
    },
    { refreshDeps: [category, currentBook] },
  );

  const realTypes = useMemo(() => {
    const parentTypes = allTypes.filter(v => v.parentId === 0);
    const dummyBooksId = currentBook?.id ?? 0;
    return [
      {
        id: 0,
        booksId: dummyBooksId,
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
            booksId: dummyBooksId,
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
  }, [allTypes, category, currentBook]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [editingType, setEditingType] = useState<TypeRow | null>(null);
  const [isCreatingParent, setIsCreatingParent] = useState(false);
  const [createParentId, setCreateParentId] = useState(0);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('DotsThreeCircle');

  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TypeRow | null>(null);
  const [pendingDeleteType, setPendingDeleteType] = useState<TypeRow | null>(null);

  const openCreateParentDialog = useCallback(() => {
    setEditingType(null);
    setIsCreatingParent(true);
    setCreateParentId(0);
    setName('');
    setIcon('DotsThreeCircle');
    setDialogOpen(true);
  }, []);

  const openCreateChildDialog = useCallback((parentId: number) => {
    setEditingType(null);
    setIsCreatingParent(false);
    setCreateParentId(parentId);
    setName('');
    setIcon('DotsThreeCircle');
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((type: TypeRow) => {
    setEditingType(type);
    setIsCreatingParent(type.parentId === 0);
    setCreateParentId(type.parentId);
    setName(type.name);
    setIcon(type.icon);
    setDialogOpen(true);
  }, []);

  const handleItemLongPress = useCallback(
    (id: number) => {
      const type = allTypes.find(v => v.id === id);
      if (!type) return;
      setSelectedType(type);
      setActionSheetOpen(true);
    },
    [allTypes],
  );

  const handleOk = useCallback(async () => {
    if (!currentBook) {
      toast.show({ messageText: '未找到当前账本' });
      return;
    }
    try {
      const parentId = isCreatingParent ? 0 : createParentId;
      if (editingType) {
        await globalApi.type.update({
          id: editingType.id,
          booksId: currentBook.id,
          name,
          icon,
          typeCategory: category,
          parentId: editingType.parentId,
        });
      } else {
        await globalApi.type.create({
          booksId: currentBook.id,
          name,
          icon,
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
    currentBook,
    editingType,
    name,
    icon,
    category,
    isCreatingParent,
    createParentId,
    refresh,
    toast,
  ]);

  const confirmDelete = useCallback(async () => {
    const target = pendingDeleteType;
    setPendingDeleteType(null);
    if (!target || !currentBook) return;
    try {
      await globalApi.type.delete(target.id, currentBook.id);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: getTypeDeleteErrorMessage(e) });
    }
  }, [pendingDeleteType, currentBook, refresh, toast]);

  const handleActionSheetAction = useCallback(
    (_action: ActionSheetAction, index: number) => {
      if (!selectedType) return;
      setActionSheetOpen(false);
      if (index === 0) {
        openEditDialog(selectedType);
      } else if (index === 1) {
        setPendingDeleteType(selectedType);
      }
    },
    [selectedType, openEditDialog],
  );

  const dialogTitle = useMemo(() => {
    if (editingType) return '编辑类型';
    return isCreatingParent ? '新增一级类型' : '新增二级类型';
  }, [editingType, isCreatingParent]);
  const SelectedIconComponent = getPhosphorIconComponent(icon);

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
      <Row style={styles.hint}>
        <Text size="xs" color="tertiary">
          长按类型可编辑或删除
        </Text>
      </Row>

      <ScrollView style={styles.contentScroll}>
        <CategoryGrid
          style={styles.categoryGrid}
          categories={realTypes}
          onSelect={id => {
            if (id === 0) {
              openCreateParentDialog();
            } else if (id < 0) {
              openCreateChildDialog(-id);
            }
          }}
          onItemLongPress={handleItemLongPress}
        />
      </ScrollView>

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={open => {
          if (!open) setActionSheetOpen(false);
        }}
        titleText={selectedType?.name}
        actions={TYPE_ACTIONS}
        onAction={handleActionSheetAction}
        cancelText="取消"
      />

      <Dialog
        open={pendingDeleteType !== null}
        titleText="删除类型"
        okText="删除"
        cancelText="取消"
        onOk={confirmDelete}
        onCancel={() => setPendingDeleteType(null)}
      >
        <Text size="md" color="secondary">
          确定删除「{pendingDeleteType?.name}」吗？删除后无法恢复。
        </Text>
      </Dialog>

      <Popup.FloatingPanel
        keyboardAvoiding
        open={dialogOpen}
        onOpenChange={open => {
          if (!open) setDialogOpen(false);
        }}
        titleText={dialogTitle}
        onOk={handleOk}
        okText={editingType ? '保存' : '新增'}
        okDisabled={!name.trim()}
        styles={{ panelBody: styles.dialogBody }}
      >
        <Column>
          <Input
            labelText="类型"
            placeholder="类型名称"
            value={name}
            onChange={setName}
          />
          <DisplayInput
            labelText="图标"
            valueText={icon}
            prefix={<Icon icon={SelectedIconComponent} size="small" />}
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
