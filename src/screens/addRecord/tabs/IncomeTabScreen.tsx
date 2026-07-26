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
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import { createUseSheetStyle, ThemeProvider, useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryGrid } from '../../../component/CategoryGrid';
import { RemarkInput } from '../components/RemarkInput';
import { useCategoryItems } from '../useCategoryItems';
import { useAddRecordContext } from '../AddRecordContext';
import { RecordDateTimeField } from '../components/RecordDateTimeField';
import {
  getRelatedExpenseCandidates,
  isAbsorptionIncomeType,
  saveAddRecordDraft,
  validateAddRecordDraft,
} from '../addRecordDraft';
import {
  toAssetOptions,
  toRelatedRecordOptions,
  toTagOptions,
} from '../recordOptions';
import { toNumberValue, toNumberValues } from '../selectValues';
import { useAddRecordResources } from '../useAddRecordResources';
import { useInitialTypeId } from '../useInitialTypeId';
import { useNavigation } from '../../../navigation';
import { useGlobalApi } from '../../../stores/bookStore';

export function IncomeTabScreen() {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const globalApi = useGlobalApi();
  const {
    amount,
    assetId,
    editingRecordId,
    images,
    initialTypeId,
    recordTime,
    remark,
    reset,
    setAssetId,
    setImages,
    setRecordTime,
    setTags,
    tags,
  } = useAddRecordContext();
  const [typeId, setTypeId] = useState<number>();
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
      currentBook ? globalApi.record.getByBook(currentBook.id) : Promise.resolve([]),
    { refreshDeps: [currentBook?.id] },
  );
  const selectedType = useMemo(
    () => categories.find(category => category.id === typeId),
    [categories, typeId],
  );
  const isAbsorption = isAbsorptionIncomeType(selectedType);
  useInitialTypeId(initialTypeId, categories, setTypeId);
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
      charge: 0,
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
      await saveAddRecordDraft('income', draft, editingRecordId);
      reset();
      toast.show({ messageText: editingRecordId !== undefined ? '已更新收入' : '已新增收入' });
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
    currentBook,
    editingRecordId,
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
    <ThemeProvider config={{ token: { colorPrimary: token.green10 } }}>
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
          <Card>
            <Row wrap gap={10}>
              <SelectionList
                labelText="收款资产（可选）"
                loading={assetsLoading}
                onChange={value => setAssetId(toNumberValue(value) ?? null)}
                options={assetOptions}
                searchable
                style={styles.formField}
                texts={{
                  headerText: '选择收款资产',
                  searchPlaceholder: '搜索资产',
                  emptyText: '暂无可用资产',
                }}
                value={assetId ?? undefined}
              />
              <RecordDateTimeField
                value={recordTime}
                onChange={setRecordTime}
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
                labelText="图片"
                value={images}
                onChange={setImages}
                style={styles.formField}
              />
              <SelectionList
                displayMode="tag"
                labelText="标签"
                loading={tagsLoading}
                mode="multiple"
                onChange={value => setTags(toNumberValues(value))}
                options={tagOptions}
                searchable
                style={styles.formField}
                texts={{
                  headerText: '选择标签',
                  searchPlaceholder: '搜索标签',
                  emptyText: '暂无标签',
                  confirmText: '确定',
                }}
                value={tags}
              />
              {isAbsorption ? (
                <SelectionList
                  displayMode="tag"
                  labelText="关联支出"
                  loading={recordsLoading}
                  mode="multiple"
                  onChange={value =>
                    setRelatedRecordIds(toNumberValues(value))
                  }
                  options={relatedExpenseOptions}
                  searchable
                  style={styles.formField}
                  texts={{
                    headerText: '选择关联支出',
                    searchPlaceholder: '搜索支出',
                    emptyText: '暂无可关联支出',
                    confirmText: '确定',
                  }}
                  value={relatedRecordIds}
                />
              ) : null}
            </Row>
          </Card>
          <RemarkInput />
          <Button block loading={submitting} onPress={handleSave} type="primary">
            保存收入
          </Button>
        </Column>
      </KeyboardAwareFormScroll>
    </ThemeProvider>
  );
}

const useStyles = createUseSheetStyle(token => ({
  page: {
    backgroundColor: token.colorBgLayout,
    paddingTop: token.paddingMD,
  },
  formField: {
    minWidth: token.controlHeight * 3,
    flex: 1,
  },
}));
