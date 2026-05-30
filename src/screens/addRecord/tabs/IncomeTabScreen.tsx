import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  Column,
  ImagePicker,
  KeyboardAwareFormScroll,
  Row,
  SelectionList,
  Text,
  useToast,
} from '@pennyspring/ui';
import { api, RECORD_TYPE_CATEGORY } from '@pennyspring/data';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryGrid } from '../../../component/CategoryGrid';
import { RemarkInput } from '../components/RemarkInput';
import { useCategoryItems } from '../useCategoryItems';
import { useAddRecordContext } from '../AddRecordContext';
import { MoneyField } from '../components/MoneyField';
import { RecordDateTimeField } from '../components/RecordDateTimeField';
import {
  buildCreateRecordInput,
  getRelatedExpenseCandidates,
  isAbsorptionIncomeType,
  validateAddRecordDraft,
} from '../addRecordDraft';
import {
  toAssetOptions,
  toRelatedRecordOptions,
  toTagOptions,
} from '../recordOptions';
import { toNumberValue, toNumberValues } from '../selectValues';
import { useAddRecordResources } from '../useAddRecordResources';
import { useNavigation } from '../../../navigation';

export function IncomeTabScreen() {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const {
    amount,
    images,
    recordTime,
    remark,
    reset,
    setImages,
    setRecordTime,
    setTags,
    tags,
  } = useAddRecordContext();
  const [typeId, setTypeId] = useState<number>();
  const [assetId, setAssetId] = useState<number | null>(null);
  const [charge, setCharge] = useState(0);
  const [relatedRecordIds, setRelatedRecordIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { categories, loading: categoriesLoading } = useCategoryItems(
    RECORD_TYPE_CATEGORY.income,
  );
  const { categories: expenseTypes } = useCategoryItems(
    RECORD_TYPE_CATEGORY.expense,
  );
  const {
    assetsLoading,
    currentBook,
    tagsLoading,
    visibleAssets,
    visibleTags,
  } = useAddRecordResources();
  const { data: records = [], loading: recordsLoading } = useRequest(
    () =>
      currentBook ? api.record.getByBook(currentBook.id) : Promise.resolve([]),
    { refreshDeps: [currentBook?.id] },
  );
  const selectedType = useMemo(
    () => categories.find(category => category.id === typeId),
    [categories, typeId],
  );
  const isAbsorption = isAbsorptionIncomeType(selectedType);
  const expenseTypeLookup = useMemo(
    () => new Map(expenseTypes.map(typeRow => [typeRow.id, typeRow])),
    [expenseTypes],
  );
  const relatedExpenseOptions = useMemo(
    () =>
      toRelatedRecordOptions(
        getRelatedExpenseCandidates(records, expenseTypes, selectedType),
        expenseTypeLookup,
      ),
    [expenseTypeLookup, expenseTypes, records, selectedType],
  );
  const assetOptions = useMemo(
    () => toAssetOptions(visibleAssets),
    [visibleAssets],
  );
  const tagOptions = useMemo(() => toTagOptions(visibleTags), [visibleTags]);

  useEffect(() => {
    if (!isAbsorption && relatedRecordIds.length > 0) {
      setRelatedRecordIds([]);
    }
  }, [isAbsorption, relatedRecordIds.length]);

  const handleSave = useCallback(async () => {
    const draft = {
      booksId: currentBook?.id,
      amount,
      charge,
      typeId,
      selectedType,
      assetId,
      recordTime,
      remark,
      tagIds: tags,
      imagePaths: images.map(image => image.uri),
      relatedRecordIds,
    };
    const validationMessage = validateAddRecordDraft('income', draft);
    if (validationMessage !== undefined) {
      toast.show({ messageText: validationMessage });
      return;
    }

    try {
      setSubmitting(true);
      await api.record.create(buildCreateRecordInput('income', draft));
      reset();
      toast.show({ messageText: '已新增收入' });
      navigation.goBack();
    } catch (error: unknown) {
      toast.show({
        messageText: error instanceof Error ? error.message : '保存失败',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    amount,
    assetId,
    charge,
    currentBook,
    images,
    navigation,
    recordTime,
    relatedRecordIds,
    remark,
    reset,
    selectedType,
    tags,
    toast,
    typeId,
  ]);

  return (
    <KeyboardAwareFormScroll
      extraBottomInset={token.paddingXL}
      focusedInputBottomOffset={token.paddingXL}
      styles={{ content: styles.page }}
    >
      <Column gap={token.marginMD}>
        <AmountDisplay labelText="收入金额" />
        <CategoryGrid
          categories={categories}
          value={typeId}
          onChange={setTypeId}
        />
        {categoriesLoading ? (
          <Text color="description" size="sm">
            分类加载中
          </Text>
        ) : null}
        <Card titleText="更多信息">
          <Row wrap gap={token.marginXXS}>
            <SelectionList
              loading={assetsLoading}
              onChange={value => setAssetId(toNumberValue(value) ?? null)}
              options={assetOptions}
              placeholder="收款资产"
              searchable
              texts={{
                headerText: '选择收款资产',
                searchPlaceholder: '搜索资产',
                emptyText: '暂无可用资产',
              }}
              value={assetId ?? undefined}
            />
            <MoneyField
              placeholder="手续费"
              value={charge}
              onChange={setCharge}
            />
            {isAbsorption ? (
              <SelectionList
                displayMode="tag"
                loading={recordsLoading}
                mode="multiple"
                onChange={value => setRelatedRecordIds(toNumberValues(value))}
                options={relatedExpenseOptions}
                placeholder="关联支出"
                searchable
                texts={{
                  headerText: '选择关联支出',
                  searchPlaceholder: '搜索支出',
                  emptyText: '暂无可关联支出',
                  confirmText: '确定',
                }}
                value={relatedRecordIds}
              />
            ) : null}
            <RecordDateTimeField
              placeholder="记账时间"
              value={recordTime}
              onChange={setRecordTime}
            />
            <SelectionList
              displayMode="tag"
              loading={tagsLoading}
              mode="multiple"
              onChange={value => setTags(toNumberValues(value))}
              options={tagOptions}
              placeholder="标签"
              searchable
              texts={{
                headerText: '选择标签',
                searchPlaceholder: '搜索标签',
                emptyText: '暂无标签',
                confirmText: '确定',
              }}
              value={tags}
            />
            <ImagePicker
              multiple
              maxCount={3}
              onError={(error: unknown) => {
                toast.show({
                  messageText:
                    error instanceof Error ? error.message : '选择图片失败',
                });
              }}
              placeholder="图片"
              value={images}
              onChange={setImages}
            />
          </Row>
        </Card>
        <Card titleText="备注">
          <RemarkInput />
        </Card>
        <Button block loading={submitting} onPress={handleSave} type="primary">
          保存收入
        </Button>
      </Column>
    </KeyboardAwareFormScroll>
  );
}

const useStyles = createUseSheetStyle(token => ({
  page: {
    backgroundColor: token.colorBgLayout,
  },
}));
