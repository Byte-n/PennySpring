import React, { useCallback, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  Column,
  ImagePicker,
  KeyboardAwareFormScroll,
  Sticky,
  StickyLayout,
  Row,
  ListPicker,
  useToast,
} from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY, localApi } from '@pennyspring/api';
import { createUseSheetStyle, ThemeProvider, useTheme } from '@pennyspring/ui';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryField } from '../components/CategoryField';
import { RemarkInput } from '../components/RemarkInput';
import { TagPicker } from '../components/TagPicker';
import { useCategoryItems } from '../useCategoryItems';
import { useAddRecordContext } from '../AddRecordContext';
import { RecordDateTimeField } from '../components/RecordDateTimeField';
import {
  getRelatedExpenseCandidates,
  isAbsorptionIncomeType,
  saveAddRecordDraft,
  validateAddRecordDraft,
} from '../addRecordDraft';
import { persistRecordImages } from '../persistRecordImages';
import { buildNewQuickTemplate, validateTemplateDraft } from '../templateDraft';
import { toAssetOptions, toRelatedRecordOptions } from '../recordOptions';
import { toNumberValue, toNumberValues } from '../selectValues';
import { useAddRecordResources } from '../useAddRecordResources';
import { useNavigation } from '../../../navigation';
import { useGlobalApi } from '../../../stores/bookStore';
import { useSyncVersionStore } from '../../../stores/syncVersionStore';
import {
  MEDIA_IMAGE_MAX_DIMENSION,
  MEDIA_IMAGE_QUALITY,
  useMediaStore,
} from '../../../media';

export function IncomeTabScreen() {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const globalApi = useGlobalApi();
  const {
    amount,
    assetId,
    charge,
    draftTarget,
    editingRecordId,
    editingTemplateId,
    images,
    relatedRecordIds,
    recordTime,
    remark,
    reset,
    setAssetId,
    setImages,
    setRecordTime,
    setTags,
    setRelatedRecordIds,
    setTypeId,
    tags: selectedTagIds,
    template,
    templateName,
    typeId,
  } = useAddRecordContext();
  const [submitting, setSubmitting] = useState(false);
  const api = useGlobalApi();
  const media = useMediaStore();
  const bumpTemplateVersion = useSyncVersionStore(
    state => state.bumpTemplateVersion,
  );
  const {
    categories,
    error: categoriesError,
    loading: categoriesLoading,
    refresh: refreshCategories,
  } = useCategoryItems(RECORD_TYPE_CATEGORY.income, draftTarget?.booksId);
  const { categories: expenseTypes } = useCategoryItems(
    RECORD_TYPE_CATEGORY.expense,
    draftTarget?.booksId,
  );
  const {
    assetsLoading,
    booksId,
    currentBook,
    tags: allTags,
    tagsLoading,
    visibleAssets,
  } = useAddRecordResources(draftTarget?.booksId);
  const recordsApi = draftTarget ? localApi : globalApi;
  const { data: records = [], loading: recordsLoading } = useRequest(
    () =>
      booksId !== undefined
        ? recordsApi.record.getByBook(booksId)
        : Promise.resolve([]),
    { refreshDeps: [booksId, recordsApi] },
  );
  const selectedType = useMemo(
    () =>
      categories.find(
        category => category.id === (typeId ?? categories[0]?.id),
      ),
    [categories, typeId],
  );
  const isAbsorption = isAbsorptionIncomeType(selectedType);
  const selectedTypeId = selectedType?.id;
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

  const handleTypeChange = useCallback(
    (nextTypeId: number | undefined) => {
      setTypeId(nextTypeId);
      const nextType = categories.find(category => category.id === nextTypeId);
      if (!isAbsorptionIncomeType(nextType)) {
        setRelatedRecordIds([]);
      }
    },
    [categories, setRelatedRecordIds, setTypeId],
  );

  const handleSave = useCallback(async () => {
    const draft = {
      booksId,
      amount,
      charge: draftTarget ? charge : 0,
      typeId: selectedTypeId,
      selectedType,
      assetId,
      recordTime,
      remark,
      tagIds: selectedTagIds,
      imagePaths: images.map(image => image.uri),
      relatedRecordIds,
    };

    if (template) {
      if (draftTarget) {
        toast.show({ messageText: '草稿模式不支持保存模板' });
        return;
      }
      const validationMessage = validateTemplateDraft(
        templateName,
        'income',
        draft,
      );
      if (validationMessage !== undefined) {
        toast.show({ messageText: validationMessage });
        return;
      }
      if (!currentBook) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }
      try {
        setSubmitting(true);
        const payload = buildNewQuickTemplate('income', draft, {
          booksId: currentBook.id,
          name: templateName,
        });
        if (editingTemplateId !== undefined) {
          await api.quickTemplate.update({
            ...payload,
            id: editingTemplateId,
          });
        } else {
          await api.quickTemplate.create(payload);
        }
        bumpTemplateVersion();
        reset();
        toast.show({
          messageText:
            editingTemplateId !== undefined ? '已更新模板' : '已新增模板',
        });
        navigation.goBack();
      } catch (error: unknown) {
        toast.show({
          messageText: error instanceof Error ? error.message : '保存失败',
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const validationMessage = validateAddRecordDraft('income', draft);
    if (validationMessage !== undefined) {
      toast.show({ messageText: validationMessage });
      return;
    }

    const mediaStore = media;
    if (!mediaStore) {
      toast.show({ messageText: '未找到当前账本' });
      return;
    }

    try {
      setSubmitting(true);
      const persisted = await persistRecordImages(images, mediaStore);
      setImages(persisted.images);
      await saveAddRecordDraft(
        'income',
        { ...draft, imagePaths: persisted.imagePaths },
        editingRecordId,
        draftTarget ? { draft: draftTarget } : undefined,
      );
      reset();
      toast.show({
        messageText: draftTarget
          ? '已记账'
          : editingRecordId !== undefined
            ? '已更新收入'
            : '已新增收入',
      });
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
    api,
    assetId,
    booksId,
    bumpTemplateVersion,
    charge,
    currentBook,
    draftTarget,
    editingRecordId,
    editingTemplateId,
    images,
    media,
    navigation,
    recordTime,
    relatedRecordIds,
    remark,
    reset,
    selectedTagIds,
    selectedType,
    template,
    templateName,
    toast,
    selectedTypeId,
  ]);

  return (
    <ThemeProvider config={{ token: { colorPrimary: token.green10 } }}>
      <StickyLayout style={styles.tab}>
        <KeyboardAwareFormScroll
          scrollEnabled
          extraBottomInset={token.paddingXL}
          focusedInputBottomOffset={token.paddingXL}
          styles={{ content: styles.page }}
        >
          <Column gap={token.marginMD}>
            <AmountDisplay />
            <Card variant="elevated" size="small">
              <CategoryField
                categories={categories}
                error={categoriesError}
                loading={categoriesLoading}
                onRetry={refreshCategories}
                value={selectedTypeId}
                onChange={handleTypeChange}
              />
            </Card>
            <Card variant="elevated">
              <Row wrap gap={token.marginSM}>
                <ListPicker
                  labelText="付款资产（可选）"
                  loading={assetsLoading}
                  onChange={value => setAssetId(toNumberValue(value) ?? null)}
                  options={assetOptions}
                  searchable
                  texts={{
                    headerText: '选择收款资产',
                    searchLabelText: '收款资产',
                    searchPlaceholder: '搜索资产',
                    emptyText: '暂无可用资产',
                  }}
                  value={assetId ?? undefined}
                />
                {!template && (
                  <RecordDateTimeField
                    value={recordTime}
                    onChange={setRecordTime}
                  />
                )}
                {!template && (
                  <ImagePicker
                    multiple
                    maxCount={3}
                    maxHeight={MEDIA_IMAGE_MAX_DIMENSION}
                    maxWidth={MEDIA_IMAGE_MAX_DIMENSION}
                    quality={MEDIA_IMAGE_QUALITY}
                    onError={(error: unknown) => {
                      toast.show({
                        messageText:
                          error instanceof Error
                            ? error.message
                            : '选择图片失败',
                      });
                    }}
                    labelText="图片"
                    value={images}
                    onChange={setImages}
                  />
                )}
                <TagPicker
                  loading={tagsLoading}
                  onChange={setTags}
                  tags={allTags}
                  value={selectedTagIds}
                />
                {!template && isAbsorption ? (
                  <ListPicker
                    displayMode="tag"
                    labelText="关联支出"
                    loading={recordsLoading}
                    mode="multiple"
                    onChange={value =>
                      setRelatedRecordIds(toNumberValues(value))
                    }
                    options={relatedExpenseOptions}
                    searchable
                    texts={{
                      headerText: '选择关联支出',
                      searchLabelText: '关联支出',
                      searchPlaceholder: '搜索支出',
                      emptyText: '暂无可关联支出',
                      confirmText: '确定',
                    }}
                    value={relatedRecordIds}
                  />
                ) : null}
              </Row>
            </Card>
            <Card variant="elevated">
              <RemarkInput />
            </Card>
            <Sticky placement="bottom">
              <Button
                block
                loading={submitting}
                onPress={handleSave}
                type="primary"
              >
                {template ? '保存模板' : '保存收入'}
              </Button>
            </Sticky>
          </Column>
        </KeyboardAwareFormScroll>
      </StickyLayout>
    </ThemeProvider>
  );
}

const useStyles = createUseSheetStyle(token => ({
  tab: {
    flex: 1,
  },
  page: {
    backgroundColor: token.colorBgLayout,
    paddingTop: token.paddingMD,
  },
}));
