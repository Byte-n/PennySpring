import React, { useCallback, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import {
  Column,
  DisplayInput,
  Icon,
  Input,
  Popup,
  Row,
  Segmented,
  useToast,
} from '@pennyspring/ui';
import {
  api,
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
import { useBookStore } from '../../stores/bookStore';

const CATEGORY_OPTIONS = [
  { value: RECORD_TYPE_CATEGORY.expense, label: '支出' },
  { value: RECORD_TYPE_CATEGORY.income, label: '收入' },
  { value: RECORD_TYPE_CATEGORY.transfer, label: '转账' },
];

const useStyles = createUseSheetStyle(token => ({
  container: { flex: 1, backgroundColor: token.colorBgLayout },
  segmented: { padding: token.padding },
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

  const [category, setCategory] = useState<RecordTypeCategoryValue>(
    RECORD_TYPE_CATEGORY.expense,
  );

  const { data: allTypes = [], refresh } = useRequest(
    () => {
      if (!currentBook) return Promise.resolve([]);
      return api.type.getByCategory(category, currentBook.id);
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

  const handleOk = useCallback(async () => {
    if (!currentBook) {
      toast.show({ messageText: '未找到当前账本' });
      return;
    }
    try {
      const parentId = isCreatingParent ? 0 : createParentId;
      if (editingType) {
        await api.type.update({
          id: editingType.id,
          booksId: currentBook.id,
          name,
          icon,
          typeCategory: category,
          parentId: editingType.parentId,
        });
      } else {
        await api.type.create({
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
        />
      </ScrollView>

      <Popup.FloatingPanel
        height="85%"
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
          <Input placeholder="类型名称" value={name} onChange={setName} />
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
