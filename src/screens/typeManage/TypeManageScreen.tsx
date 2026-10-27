import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Button,
  Column,
  Empty,
  Input,
  ListPicker,
  Row,
  Segmented,
  Text,
  useToast,
} from '@pennyspring/ui';
import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  type RecordTypeCategoryValue,
  type TypeRow,
} from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/theme';
import { CategoryGrid } from '../../component/CategoryGrid';
import { FormIconGrid, TYPE_FORM_ICONS } from '../../component/FormIconGrid';
import { PhosphorIconPicker } from '../../component/PhosphorIconPicker';
import { createHeaderAddButton } from '../../components/HeaderAddButton';
import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { FormFloatingPanel } from '../../components/FormFloatingPanel';
import { ManageSkeleton } from '../../components/ManageSkeleton';
import { useNavigation } from '../../navigation';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';

type TypeLevel = 'parent' | 'child';

const CATEGORY_OPTIONS = [
  { value: RECORD_TYPE_CATEGORY.expense, label: '支出' },
  { value: RECORD_TYPE_CATEGORY.income, label: '收入' },
  { value: RECORD_TYPE_CATEGORY.transfer, label: '转账' },
];

const DEFAULT_ICON = 'DotsThreeCircle';

const TYPE_DELETE_ERROR_HINTS = [
  { keyword: 'Type is in use', message: '该类型已被记录使用，先调整这些记录再删除。' },
  {
    keyword: 'Type has children',
    message: '该类型下还有二级类型，先处理后再删除。',
  },
];

function getTypeDeleteErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  const hint = TYPE_DELETE_ERROR_HINTS.find(v => message.includes(v.keyword));
  return hint?.message ?? (message || '删除失败');
}

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  segmented: {
    paddingHorizontal: token.padding,
    paddingTop: token.padding,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    gap: token.marginSM,
    padding: token.padding,
    paddingBottom: token.paddingXL,
  },
  metaLine: {
    alignItems: 'center',
    gap: token.marginXXS,
    paddingHorizontal: token.paddingXXS,
  },
  listEnd: {
    color: token.colorTextTertiary,
    lineHeight: token.lineHeight,
    textAlign: 'center',
  },
  formBody: {
    gap: token.marginMD,
  },
  levelWarn: {
    backgroundColor: token.colorWarningBg,
    borderRadius: token.borderRadiusSM,
    marginTop: token.marginXS,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  iconMore: {
    alignItems: 'flex-start',
  },
  dangerZone: {
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
    paddingTop: token.paddingSM,
  },
}));

export function TypeManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();

  const [category, setCategory] = useState<RecordTypeCategoryValue>(
    RECORD_TYPE_CATEGORY.expense,
  );
  const [expandedByCategory, setExpandedByCategory] = useState<
    Record<string, number | undefined>
  >({});

  const { data: allTypes = [], loading, refresh } = useRequest(
    () => {
      if (!currentBook) return Promise.resolve<TypeRow[]>([]);
      return globalApi.type.getByCategory(category, currentBook.id);
    },
    { refreshDeps: [category, currentBook] },
  );

  const parents = useMemo(
    () => allTypes.filter(type => type.parentId === 0),
    [allTypes],
  );
  const children = useMemo(
    () => allTypes.filter(type => type.parentId !== 0),
    [allTypes],
  );
  const expandedId = expandedByCategory[category];

  const setExpandedId = useCallback(
    (id?: number) => {
      setExpandedByCategory(prev => ({ ...prev, [category]: id }));
    },
    [category],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<TypeRow | null>(null);
  const [level, setLevel] = useState<TypeLevel>('parent');
  const [parentId, setParentId] = useState<number | undefined>();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [parentMenu, setParentMenu] = useState<TypeRow | null>(null);
  const [pendingDeleteType, setPendingDeleteType] = useState<TypeRow | null>(
    null,
  );

  const availableParents = useMemo(
    () => parents.filter(parent => parent.id !== editingType?.id),
    [editingType?.id, parents],
  );
  const editingChildrenCount = useMemo(() => {
    if (!editingType) {
      return 0;
    }
    return allTypes.filter(type => type.parentId === editingType.id).length;
  }, [allTypes, editingType]);
  const childLevelDisabled =
    editingChildrenCount > 0 || availableParents.length === 0;
  const childLevelReason =
    editingChildrenCount > 0
      ? `「${editingType?.name}」下还有 ${editingChildrenCount} 个二级类型，先移走或删除后才能转为二级。`
      : availableParents.length === 0
        ? '还没有其它一级类型可以作为上级。'
        : '';

  const formIconValues = useMemo(() => {
    if (
      icon &&
      !(TYPE_FORM_ICONS as readonly string[]).includes(icon)
    ) {
      return [icon, ...TYPE_FORM_ICONS];
    }
    return TYPE_FORM_ICONS;
  }, [icon]);

  const openCreateParent = useCallback(() => {
    setEditingType(null);
    setLevel('parent');
    setParentId(undefined);
    setName('');
    setIcon(DEFAULT_ICON);
    setFormOpen(true);
  }, []);

  const openCreateChild = useCallback((parent: TypeRow) => {
    setEditingType(null);
    setLevel('child');
    setParentId(parent.id);
    setName('');
    setIcon(DEFAULT_ICON);
    setFormOpen(true);
  }, []);

  const openEditType = useCallback((type: TypeRow) => {
    setEditingType(type);
    setLevel(type.parentId === 0 ? 'parent' : 'child');
    setParentId(type.parentId > 0 ? type.parentId : undefined);
    setName(type.name);
    setIcon(type.icon || DEFAULT_ICON);
    setFormOpen(true);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: createHeaderAddButton(openCreateParent),
    });
  }, [navigation, openCreateParent]);

  const handleLevelChange = useCallback(
    (next: string | number) => {
      if (next === 'child' && childLevelDisabled) {
        return;
      }
      const nextLevel = next as TypeLevel;
      setLevel(nextLevel);
      if (
        nextLevel === 'child' &&
        !availableParents.some(parent => parent.id === parentId)
      ) {
        setParentId(availableParents[0]?.id);
      }
    },
    [availableParents, childLevelDisabled, parentId],
  );

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!currentBook) {
      toast.show({ messageText: '未找到当前账本' });
      return false;
    }
    if (!name.trim()) {
      toast.show({ messageText: '请输入类型名称' });
      return false;
    }
    const resolvedParentId = level === 'child' ? parentId : 0;
    if (level === 'child' && !resolvedParentId) {
      toast.show({ messageText: '请选择上级类型' });
      return false;
    }
    setSubmitting(true);
    try {
      const convertingChildToParent =
        editingType !== null &&
        editingType.parentId !== 0 &&
        level === 'parent';
      const nextSort = convertingChildToParent
        ? Math.max(0, ...parents.map(parent => parent.sort)) + 1
        : editingType?.sort ?? 1;
      const payload = {
        booksId: currentBook.id,
        icon,
        isSystem: editingType?.isSystem ?? SYSTEM_STATUS.custom,
        name: name.trim(),
        parentId: resolvedParentId,
        sort: nextSort,
        specialBehavior:
          editingType?.specialBehavior ?? RECORD_TYPE_SPECIAL_BEHAVIOR.none,
        typeCategory: category,
      };
      if (editingType) {
        await globalApi.type.update({ ...payload, id: editingType.id });
        if (
          editingType.parentId === 0 &&
          level === 'child' &&
          expandedId === editingType.id
        ) {
          setExpandedId(undefined);
        }
      } else {
        await globalApi.type.create(payload);
      }
      refresh();
      return true;
    } catch (error: unknown) {
      toast.show({
        messageText:
          error instanceof Error && error.message
            ? error.message
            : '保存失败',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [
    category,
    currentBook,
    editingType,
    expandedId,
    globalApi.type,
    icon,
    level,
    name,
    parentId,
    parents,
    refresh,
    setExpandedId,
    toast,
  ]);

  const handleDelete = useCallback(async () => {
    const target = pendingDeleteType;
    if (!target || !currentBook) {
      return;
    }
    try {
      await globalApi.type.delete(target.id, currentBook.id);
    } catch (error: unknown) {
      throw new Error(getTypeDeleteErrorMessage(error));
    }
    if (expandedId === target.id) {
      setExpandedId(undefined);
    }
    if (editingType?.id === target.id) {
      setFormOpen(false);
    }
    if (parentMenu?.id === target.id) {
      setParentMenu(null);
    }
    setPendingDeleteType(null);
    refresh();
  }, [
    currentBook,
    editingType?.id,
    expandedId,
    globalApi.type,
    parentMenu?.id,
    pendingDeleteType,
    refresh,
    setExpandedId,
  ]);

  const menuActions = useMemo(
    () => [
      { text: '编辑类型', icon: 'edit' as const },
      { text: '新增二级类型', icon: 'add' as const },
      { text: '删除类型', icon: 'trash' as const, danger: true },
    ],
    [],
  );

  const handleMenuAction = useCallback(
    (_action: { text: string }, index: number) => {
      const parent = parentMenu;
      setParentMenu(null);
      if (!parent) {
        return;
      }
      if (index === 0) {
        openEditType(parent);
      } else if (index === 1) {
        openCreateChild(parent);
      } else {
        setPendingDeleteType(parent);
      }
    },
    [openCreateChild, openEditType, parentMenu],
  );

  const handleGridAddChild = useCallback(
    (targetParentId: number) => {
      const parent = parents.find(item => item.id === targetParentId);
      if (parent) {
        openCreateChild(parent);
      }
    },
    [openCreateChild, parents],
  );

  const handleChildPress = useCallback(
    (childId: number) => {
      const child = allTypes.find(type => type.id === childId);
      if (child) {
        openEditType(child);
      }
    },
    [allTypes, openEditType],
  );

  const formTitle = editingType
    ? '编辑类型'
    : level === 'child'
      ? '新增二级类型'
      : '新增一级类型';
  const nameLabel =
    level === 'child'
      ? `二级类型名称${parentId ? ` · ${parents.find(parent => parent.id === parentId)?.name ?? ''}` : ''}`
      : '类型名称';
  const okText = editingType ? '保存' : '新增';
  const okDisabled =
    submitting ||
    !name.trim() ||
    (level === 'child' && (!parentId || childLevelDisabled));
  const deleteChildCount = pendingDeleteType
    ? allTypes.filter(type => type.parentId === pendingDeleteType.id).length
    : 0;
  const deleteBlocked = deleteChildCount > 0;
  const canDeleteFromForm =
    editingType !== null && editingType.parentId !== 0;

  return (
    <Column style={styles.container}>
      <Row style={styles.segmented}>
        <Segmented
          block
          onChange={value => setCategory(value as RecordTypeCategoryValue)}
          options={CATEGORY_OPTIONS}
          value={category}
        />
      </Row>

      <ScrollView style={styles.contentScroll}>
        <Column style={styles.content}>
          <Row style={styles.metaLine}>
            <Text color="secondary" size="xs" weight="semibold">
              {parents.length}
            </Text>
            <Text color="tertiary" size="xs">
              个一级类型 ·
            </Text>
            <Text color="secondary" size="xs" weight="semibold">
              {children.length}
            </Text>
            <Text color="tertiary" size="xs">
              个二级类型
            </Text>
          </Row>

          {loading && allTypes.length === 0 ? (
            <ManageSkeleton rows={3} />
          ) : parents.length === 0 ? (
            <Empty descriptionText="暂无类型" />
          ) : (
            <CategoryGrid
              categories={allTypes}
              expandedId={expandedId}
              manage
              onAddChild={handleGridAddChild}
              onChildPress={handleChildPress}
              onExpandedChange={setExpandedId}
              onItemLongPress={typeId => {
                const parent = parents.find(item => item.id === typeId);
                if (parent) {
                  setParentMenu(parent);
                }
              }}
              onMorePress={parentIdValue => {
                const parent = parents.find(
                  item => item.id === parentIdValue,
                );
                setParentMenu(parent ?? null);
              }}
            />
          )}

          <Text size="xs" style={styles.listEnd}>
            轻点一级类型展开二级 · 展开区「⋯」编辑或删除{'\n'}
            轻点二级类型编辑，删除在浮层底部
          </Text>
        </Column>
      </ScrollView>

      <FormFloatingPanel
        onOk={handleSave}
        onOpenChange={open => {
          if (!open) {
            setFormOpen(false);
          }
        }}
        open={formOpen}
        panelBodyStyle={styles.formBody}
        submitDisabled={okDisabled}
        submitLoading={submitting}
        submitText={okText}
        titleText={formTitle}
      >
        <Input
          labelText={nameLabel}
          onChange={setName}
          placeholder="例如：餐饮"
          value={name}
        />

        <Column>
          <Text color="tertiary" size="xs">
            层级
          </Text>
          <Segmented
            block
            onChange={handleLevelChange}
            options={[
              { label: '一级类型', value: 'parent' },
              {
                disabled: childLevelDisabled,
                label: '二级类型',
                value: 'child',
              },
            ]}
            value={level}
          />
          {childLevelReason ? (
            <Column style={styles.levelWarn}>
              <Text color="warningText" size="xs">
                {childLevelReason}
              </Text>
            </Column>
          ) : null}
        </Column>

        {level === 'child' ? (
          <ListPicker
            labelText="上级类型"
            onChange={value =>
              setParentId(typeof value === 'number' ? value : undefined)
            }
            options={availableParents.map(parent => ({
              labelText: parent.name,
              value: parent.id,
            }))}
            value={parentId}
          />
        ) : null}

        <Column>
          <Text color="tertiary" size="xs">
            图标
          </Text>
          <FormIconGrid
            onChange={setIcon}
            value={icon}
            values={formIconValues}
          />
          <Column style={styles.iconMore}>
            <Button
              onPress={() => setIconPickerOpen(true)}
              size="small"
              type="link"
            >
              更多图标
            </Button>
          </Column>
        </Column>

        <Text color="tertiary" size="xs">
          类型可在两级之间转换；带二级类型的一级类型需先处理子类型
        </Text>

        {canDeleteFromForm ? (
          <Column style={styles.dangerZone}>
            <Button
              block
              onPress={() => setPendingDeleteType(editingType)}
              type="danger"
              variant="filled"
            >
              删除这个类型
            </Button>
          </Column>
        ) : null}
      </FormFloatingPanel>

      <PhosphorIconPicker
        onChange={setIcon}
        onOpenChange={setIconPickerOpen}
        open={iconPickerOpen}
        value={icon}
      />

      <ActionSheet
        actions={menuActions}
        cancelText="取消"
        onAction={handleMenuAction}
        onOpenChange={open => {
          if (!open) {
            setParentMenu(null);
          }
        }}
        open={parentMenu !== null}
        titleText={parentMenu?.name}
      />

      <ManageConfirmDialog
        messageText={
          deleteBlocked
            ? `「${pendingDeleteType?.name ?? ''}」下还有 ${deleteChildCount} 个二级类型，暂不能删除。`
            : `删除后无法恢复；历史记录会保留，但失去「${pendingDeleteType?.name ?? ''}」分类。`
        }
        okDisabled={deleteBlocked}
        onCancel={() => setPendingDeleteType(null)}
        onConfirm={handleDelete}
        open={pendingDeleteType !== null}
        titleText={
          pendingDeleteType
            ? `删除「${pendingDeleteType.name}」？`
            : '删除类型'
        }
        warningText={
          deleteBlocked
            ? '请先删除或移走这些二级类型，再删除这个一级类型。'
            : undefined
        }
      />
    </Column>
  );
}
