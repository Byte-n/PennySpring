import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Button,
  Checkbox,
  Column,
  Empty,
  FloatingActionGroup,
  Icon,
  Input,
  Popup,
  Row,
  SelectionList,
  SwipeAction,
  Tag,
  Text,
  Textarea,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import {
  RECORD_TYPE_CATEGORY,
  type RecordTypeCategoryValue,
  type TypeRow,
} from '@pennyspring/api';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { CategoryGrid } from '../../component/CategoryGrid';
import { useAddRecordResources } from '../addRecord/useAddRecordResources';
import { useCategoryItems } from '../addRecord/useCategoryItems';
import { toAssetOptions, toTagOptions } from '../addRecord/recordOptions';
import { toNumberValue, toNumberValues } from '../addRecord/selectValues';
import {
  formatAmount,
  validateAddRecordDraft,
  yuanToCents,
} from '../addRecord/addRecordDraft';
import { getPhosphorIconComponent } from '../../constants/typeIconTree';
import { tabTypeFor } from './buildDraft';
import {
  useQuickTemplateStore,
  useQuickTemplates,
} from './quickTemplateStore';
import { type NewQuickTemplate, type QuickTemplate } from './types';

const CENTS_PER_YUAN = 100;

function formatCurrency(cents: number): string {
  return `¥${formatAmount(cents)}`;
}

function yuanTextToCents(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') {
    return 0;
  }
  return yuanToCents(Number.parseFloat(trimmed) || 0);
}

function centsToYuanText(cents: number): string {
  return (cents / CENTS_PER_YUAN).toFixed(2);
}

const CATEGORY_OPTIONS = RECORD_TYPE_CATEGORY.options();

export function QuickTemplateManageScreen() {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const templates = useQuickTemplates();
  const addTemplate = useQuickTemplateStore(state => state.addTemplate);
  const updateTemplate = useQuickTemplateStore(state => state.updateTemplate);
  const deleteTemplate = useQuickTemplateStore(state => state.deleteTemplate);

  const bookId = currentBook?.id;
  const { data: allTypes = [] } = useRequest<TypeRow[], []>(
    () => (bookId ? globalApi.type.getAll(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId] },
  );
  const typeMap = useMemo(
    () => new Map(allTypes.map(type => [type.id, type])),
    [allTypes],
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [typeCategory, setTypeCategory] = useState<RecordTypeCategoryValue>(
    RECORD_TYPE_CATEGORY.expense,
  );
  const [typeId, setTypeId] = useState<number>(0);
  const [amountText, setAmountText] = useState('');
  const [chargeText, setChargeText] = useState('');
  const [remark, setRemark] = useState('');
  const [assetId, setAssetId] = useState<number>(0);
  const [intoAssetId, setIntoAssetId] = useState<number>(0);
  const [reimbursable, setReimbursable] = useState(false);
  const [tagIds, setTagIds] = useState<number[]>([]);

  const { categories, loading: categoriesLoading } = useCategoryItems(typeCategory);
  const { visibleAssets, visibleTags, assetsLoading, tagsLoading } =
    useAddRecordResources();

  const selectedType = useMemo(
    () => categories.find(category => category.id === typeId),
    [categories, typeId],
  );
  const assetOptions = useMemo(() => toAssetOptions(visibleAssets), [visibleAssets]);
  const tagOptions = useMemo(() => toTagOptions(visibleTags), [visibleTags]);
  const isTransfer = typeCategory === RECORD_TYPE_CATEGORY.transfer;
  const isExpense = typeCategory === RECORD_TYPE_CATEGORY.expense;

  const resetForm = useCallback(() => {
    setName('');
    setTypeCategory(RECORD_TYPE_CATEGORY.expense);
    setTypeId(0);
    setAmountText('');
    setChargeText('');
    setRemark('');
    setAssetId(0);
    setIntoAssetId(0);
    setReimbursable(false);
    setTagIds([]);
  }, []);

  const openCreate = useCallback(() => {
    setEditingId(null);
    resetForm();
    setPanelOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((tpl: QuickTemplate) => {
    setEditingId(tpl.id);
    setName(tpl.name);
    setTypeCategory(tpl.typeCategory);
    setTypeId(tpl.typeId);
    setAmountText(centsToYuanText(tpl.amount));
    setChargeText(tpl.charge > 0 ? centsToYuanText(tpl.charge) : '');
    setRemark(tpl.remark);
    setAssetId(tpl.assetId);
    setIntoAssetId(tpl.intoAssetId);
    setReimbursable(tpl.reimbursable);
    setTagIds(tpl.tagIds);
    setPanelOpen(true);
  }, []);

  const handleCategoryChange = useCallback((next: RecordTypeCategoryValue) => {
    setTypeCategory(next);
    setTypeId(0);
  }, []);

  const handleSave = useCallback(() => {
    if (!currentBook) {
      toast.show({ messageText: '未找到当前账本' });
      return;
    }
    if (!name.trim()) {
      toast.show({ messageText: '请输入模板名称' });
      return;
    }
    if (!selectedType) {
      toast.show({ messageText: '请选择分类' });
      return;
    }

    const amount = yuanTextToCents(amountText);
    const charge = yuanTextToCents(chargeText);
    const validationMessage = validateAddRecordDraft(tabTypeFor(selectedType), {
      booksId: currentBook.id,
      typeId,
      selectedType,
      amount,
      charge,
      assetId: assetId > 0 ? assetId : null,
      intoAssetId: intoAssetId > 0 ? intoAssetId : null,
      reimbursable,
      recordTime: Date.now(),
      remark: remark.trim(),
      tagIds,
      imagePaths: [],
      relatedRecordIds: [],
    });
    if (validationMessage !== undefined) {
      toast.show({ messageText: validationMessage });
      return;
    }

    const payload: NewQuickTemplate = {
      booksId: currentBook.id,
      name: name.trim(),
      typeCategory,
      typeId,
      amount,
      charge,
      remark: remark.trim(),
      assetId,
      intoAssetId,
      reimbursable,
      tagIds,
    };

    if (editingId !== null) {
      updateTemplate(currentBook.id, editingId, payload);
      toast.show({ messageText: '已更新模板' });
    } else {
      addTemplate(currentBook.id, payload);
      toast.show({ messageText: '已新增模板' });
    }
    setPanelOpen(false);
  }, [
    currentBook,
    name,
    selectedType,
    amountText,
    chargeText,
    assetId,
    intoAssetId,
    reimbursable,
    remark,
    tagIds,
    typeId,
    typeCategory,
    editingId,
    addTemplate,
    updateTemplate,
    toast,
  ]);

  const handleDelete = useCallback(
    (id: string) => {
      if (!currentBook) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }
      deleteTemplate(currentBook.id, id);
      toast.show({ messageText: '已删除模板' });
    },
    [currentBook, deleteTemplate, toast],
  );

  const hasTemplates = templates.length > 0;

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {!hasTemplates ? (
          <Empty messageText="暂无快捷模板，点右下角加号添加" style={styles.state} />
        ) : (
          <Column style={styles.group}>
            {templates.map((tpl, idx) => {
              const typeRow = typeMap.get(tpl.typeId);
              const iconComp = getPhosphorIconComponent(typeRow?.icon ?? 'Plus');
              return (
                <React.Fragment key={tpl.id}>
                  {idx > 0 && <Column style={styles.divider} />}
                  <SwipeAction
                    rightActions={[
                      {
                        key: 'edit',
                        actionText: '编辑',
                        color: 'primary',
                        onPress: () => openEdit(tpl),
                      },
                      {
                        key: 'delete',
                        actionText: '删除',
                        color: 'danger',
                        onPress: () => handleDelete(tpl.id),
                      },
                    ]}
                  >
                    <Row style={styles.item}>
                      <Column style={styles.itemIcon}>
                        <Icon color="primary" icon={iconComp} size="normal" />
                      </Column>
                      <Column style={styles.itemMain}>
                        <Row style={styles.itemNameRow}>
                          <Text numberOfLines={1} weight="semibold" style={styles.itemName}>
                            {tpl.name}
                          </Text>
                          <Tag color="blue" size="small" variant="outlined">
                            {RECORD_TYPE_CATEGORY.label(tpl.typeCategory)}
                          </Tag>
                        </Row>
                        <Text color="secondary" numberOfLines={1} size="sm">
                          {`${typeRow?.name ?? '分类已失效'} · ${formatCurrency(tpl.amount)}`}
                        </Text>
                      </Column>
                    </Row>
                  </SwipeAction>
                </React.Fragment>
              );
            })}
          </Column>
        )}
      </ScrollView>

      <FloatingActionGroup
        actions={[
          {
            key: 'create-template',
            icon: 'plus',
            onPress: openCreate,
          },
        ]}
      />

      <Popup.FloatingPanel
        open={panelOpen}
        onOpenChange={open => {
          if (!open) {
            setPanelOpen(false);
          }
        }}
        position="bottom"
        keyboardAvoiding
        height="70%"
        titleText={editingId !== null ? '编辑模板' : '新增模板'}
        okText={editingId !== null ? '保存' : '新增'}
        onOk={handleSave}
        styles={{ panelBody: styles.panelContent }}
      >
        <Input placeholder="模板名称（如：通勤支出）" value={name} onChange={setName} />
        <Row gap={token.marginXS}>
          {CATEGORY_OPTIONS.map(option => (
            <Button
              key={option.value}
              type={typeCategory === option.value ? 'primary' : 'default'}
              onPress={() => handleCategoryChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </Row>
        {categoriesLoading ? (
          <Text color="description" size="sm">
            分类加载中
          </Text>
        ) : categories.length === 0 ? (
          <Text color="description" size="sm">
            该分类下暂无类型，请先在类型管理中创建
          </Text>
        ) : (
          <Column style={styles.categoryGrid}>
            <CategoryGrid
              categories={categories}
              value={typeId}
              onChange={id => setTypeId(id ?? 0)}
            />
          </Column>
        )}
        <Input
          placeholder="金额(元)"
          value={amountText}
          onChange={setAmountText}
          keyboardType="numeric"
        />
        <Input
          placeholder="手续费(元，可选)"
          value={chargeText}
          onChange={setChargeText}
          keyboardType="numeric"
        />
        <SelectionList
          labelText={isTransfer ? '转出资产' : '付款/收款资产（可选）'}
          loading={assetsLoading}
          onChange={value => setAssetId(toNumberValue(value) ?? 0)}
          options={assetOptions}
          searchable
          texts={{
            headerText: '选择资产',
            searchPlaceholder: '搜索资产',
            emptyText: '暂无可用资产',
          }}
          value={assetId > 0 ? assetId : undefined}
        />
        {isTransfer && (
          <SelectionList
            labelText="转入资产"
            loading={assetsLoading}
            onChange={value => setIntoAssetId(toNumberValue(value) ?? 0)}
            options={toAssetOptions(visibleAssets, assetId)}
            searchable
            texts={{
              headerText: '选择转入资产',
              searchPlaceholder: '搜索资产',
              emptyText: '暂无可用资产',
            }}
            value={intoAssetId > 0 ? intoAssetId : undefined}
          />
        )}
        {isExpense && (
          <Row align="center">
            <Checkbox value={reimbursable} onChange={setReimbursable}>
              <Text>可报销</Text>
            </Checkbox>
          </Row>
        )}
        <SelectionList
          displayMode="tag"
          labelText="标签"
          loading={tagsLoading}
          mode="multiple"
          onChange={value => setTagIds(toNumberValues(value))}
          options={tagOptions}
          searchable
          texts={{
            headerText: '选择标签',
            searchPlaceholder: '搜索标签',
            emptyText: '暂无标签',
            confirmText: '确定',
          }}
          value={tagIds}
        />
        <Textarea
          placeholder="备注(可选)"
          value={remark}
          onChangeText={setRemark}
        />
      </Popup.FloatingPanel>
    </Column>
  );
}

const useStyles = createUseSheetStyle(token => ({
  container: { flex: 1, backgroundColor: token.colorBgLayout },
  content: {
    flex: 1,
    gap: token.marginMD,
    padding: token.padding,
  },
  state: {
    flexGrow: 1,
    paddingVertical: token.paddingLG,
  },
  group: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    borderColor: token.colorBorderSecondary,
    borderWidth: token.lineWidth,
    overflow: 'hidden',
  },
  item: {
    alignItems: 'flex-start',
    gap: token.marginSM,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  itemIcon: {
    alignItems: 'center',
    backgroundColor: token.colorPrimaryBg,
    borderRadius: token.borderRadiusLG,
    height: token.controlHeight,
    justifyContent: 'center',
    width: token.controlHeight,
  },
  itemMain: {
    flex: 1,
    gap: token.marginXXS,
  },
  itemNameRow: {
    alignItems: 'center',
    gap: token.marginXS,
  },
  itemName: {
    flex: 1,
  },
  divider: {
    backgroundColor: token.colorBorderSecondary,
    height: token.lineWidth,
    marginLeft: token.padding,
  },
  panelContent: { padding: token.padding, gap: token.marginMD },
  categoryGrid: {
    borderRadius: token.borderRadius,
    overflow: 'hidden',
  },
}));
