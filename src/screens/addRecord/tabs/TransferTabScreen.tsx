import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Column,
  ImagePicker,
  KeyboardAwareFormScroll,
  Row,
  ListPicker,
  useToast,
} from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import { createUseSheetStyle, ThemeProvider, useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryField } from '../components/CategoryField';
import { RemarkInput } from '../components/RemarkInput';
import { TagPicker } from '../components/TagPicker';
import { useCategoryItems } from '../useCategoryItems';
import { useAddRecordContext } from '../AddRecordContext';
import { MoneyField } from '../components/MoneyField';
import { RecordDateTimeField } from '../components/RecordDateTimeField';
import {
  filterTransferAssets,
  saveAddRecordDraft,
  validateAddRecordDraft,
} from '../addRecordDraft';
import { buildNewQuickTemplate, validateTemplateDraft } from '../templateDraft';
import { toAssetOptions } from '../recordOptions';
import { toNumberValue } from '../selectValues';
import { useAddRecordResources } from '../useAddRecordResources';
import { useInitialTypeId } from '../useInitialTypeId';
import { useNavigation } from '../../../navigation';
import { useQuickTemplateStore } from '../../quickTemplate/quickTemplateStore';

export function TransferTabScreen() {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const {
    amount,
    assetId,
    charge,
    editingRecordId,
    editingTemplateId,
    images,
    initialIntoAssetId,
    initialTypeId,
    recordTime,
    remark,
    reset,
    setAssetId,
    setCharge,
    setImages,
    setRecordTime,
    setTags,
    tags: selectedTagIds,
    template,
    templateName,
  } = useAddRecordContext();
  const [typeId, setTypeId] = useState<number>();
  const [intoAssetId, setIntoAssetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const addTemplate = useQuickTemplateStore(state => state.addTemplate);
  const updateTemplate = useQuickTemplateStore(state => state.updateTemplate);
  const {
    categories,
    error: categoriesError,
    loading: categoriesLoading,
    refresh: refreshCategories,
  } = useCategoryItems(
    RECORD_TYPE_CATEGORY.transfer,
  );
  const {
    assetsLoading,
    currentBook,
    tags: allTags,
    tagsLoading,
    visibleAssets,
  } = useAddRecordResources();
  const selectedType = useMemo(
    () => categories.find(category => category.id === typeId),
    [categories, typeId],
  );
  useInitialTypeId(initialTypeId, categories, setTypeId);
  const fromAssets = useMemo(
    () => filterTransferAssets(visibleAssets, selectedType, 'from'),
    [selectedType, visibleAssets],
  );
  const toAssets = useMemo(
    () => filterTransferAssets(visibleAssets, selectedType, 'to'),
    [selectedType, visibleAssets],
  );
  const fromAssetOptions = useMemo(
    () => toAssetOptions(fromAssets, intoAssetId),
    [fromAssets, intoAssetId],
  );
  const intoAssetOptions = useMemo(
    () => toAssetOptions(toAssets, assetId),
    [assetId, toAssets],
  );

  useEffect(() => {
    if (assetId !== null && !fromAssets.some(asset => asset.id === assetId)) {
      setAssetId(null);
    }
  }, [assetId, fromAssets, setAssetId]);

  const intoAssetInitializedRef = useRef(false);
  useEffect(() => {
    if (intoAssetInitializedRef.current) return;
    if (initialIntoAssetId === undefined || initialIntoAssetId === null) return;
    if (!toAssets.some(asset => asset.id === initialIntoAssetId)) return;
    intoAssetInitializedRef.current = true;
    setIntoAssetId(initialIntoAssetId);
  }, [initialIntoAssetId, toAssets]);

  useEffect(() => {
    if (
      intoAssetId !== null &&
      !toAssets.some(asset => asset.id === intoAssetId)
    ) {
      setIntoAssetId(null);
    }
  }, [intoAssetId, toAssets]);

  const handleSave = useCallback(async () => {
    const draft = {
      booksId: currentBook?.id,
      amount,
      charge,
      typeId,
      selectedType,
      assetId,
      intoAssetId,
      recordTime,
      remark,
      tagIds: selectedTagIds,
      imagePaths: images.map(image => image.uri),
      relatedRecordIds: [],
    };

    if (template) {
      const validationMessage = validateTemplateDraft(templateName, 'transfer', draft);
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
        const payload = buildNewQuickTemplate('transfer', draft, {
          booksId: currentBook.id,
          name: templateName,
        });
        if (editingTemplateId !== undefined) {
          updateTemplate(currentBook.id, editingTemplateId, payload);
        } else {
          addTemplate(currentBook.id, payload);
        }
        reset();
        toast.show({
          messageText: editingTemplateId !== undefined ? '已更新模板' : '已新增模板',
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

    const validationMessage = validateAddRecordDraft('transfer', draft);
    if (validationMessage !== undefined) {
      toast.show({ messageText: validationMessage });
      return;
    }

    try {
      setSubmitting(true);
      await saveAddRecordDraft('transfer', draft, editingRecordId);
      reset();
      toast.show({ messageText: editingRecordId !== undefined ? '已更新转账' : '已新增转账' });
      navigation.goBack();
    } catch (error: unknown) {
      toast.show({
        messageText: error instanceof Error ? error.message : '保存失败',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    addTemplate,
    amount,
    assetId,
    charge,
    currentBook,
    editingRecordId,
    editingTemplateId,
    images,
    intoAssetId,
    navigation,
    recordTime,
    remark,
    reset,
    selectedTagIds,
    selectedType,
    template,
    templateName,
    toast,
    typeId,
    updateTemplate,
  ]);

  return (
    <ThemeProvider config={{ token: { colorPrimary: token.blue10 } }}>
      <KeyboardAwareFormScroll
        extraBottomInset={token.paddingXL}
        focusedInputBottomOffset={token.paddingXL}
        styles={{ content: styles.page }}
      >
        <Column gap={token.marginMD}>
          <AmountDisplay />
          <Card variant="elevated">
            <CategoryField
              categories={categories}
              error={categoriesError}
              loading={categoriesLoading}
              onRetry={refreshCategories}
              value={typeId}
              onChange={setTypeId}
            />
          </Card>
          <Card variant="elevated">
            <Row wrap gap={token.marginSM}>
              <ListPicker
                labelText="转出资产"
                loading={assetsLoading}
                onChange={value => setAssetId(toNumberValue(value) ?? null)}
                options={fromAssetOptions}
                searchable
                style={styles.formField}
                texts={{
                  headerText: '选择转出资产',
                  searchLabelText: '转出资产',
                  searchPlaceholder: '搜索资产',
                  emptyText: '暂无可用转出资产',
                }}
                value={assetId ?? undefined}
              />
              <ListPicker
                labelText="转入资产"
                loading={assetsLoading}
                onChange={value =>
                  setIntoAssetId(toNumberValue(value) ?? null)
                }
                options={intoAssetOptions}
                searchable
                style={styles.formField}
                texts={{
                  headerText: '选择转入资产',
                  searchLabelText: '转入资产',
                  searchPlaceholder: '搜索资产',
                  emptyText: '暂无可用转入资产',
                }}
                value={intoAssetId ?? undefined}
              />
              <MoneyField
                labelText="手续费"
                value={charge}
                onChange={setCharge}
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
              )}
              <TagPicker
                loading={tagsLoading}
                onChange={setTags}
                style={styles.formField}
                tags={allTags}
                value={selectedTagIds}
              />
            </Row>
          </Card>
          <Card variant="elevated">
            <RemarkInput />
          </Card>
          <Button block loading={submitting} onPress={handleSave} type="primary">
            {template ? '保存模板' : '保存转账'}
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
