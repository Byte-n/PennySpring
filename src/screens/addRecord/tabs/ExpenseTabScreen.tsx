import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
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
import { RecordDateTimeField } from '../components/RecordDateTimeField';
import { saveAddRecordDraft, validateAddRecordDraft } from '../addRecordDraft';
import { persistRecordImages } from '../persistRecordImages';
import { buildNewQuickTemplate, validateTemplateDraft } from '../templateDraft';
import { toAssetOptions } from '../recordOptions';
import { toNumberValue } from '../selectValues';
import { useAddRecordResources } from '../useAddRecordResources';
import { useInitialTypeId } from '../useInitialTypeId';
import { useNavigation } from '../../../navigation';
import { useGlobalApi } from '../../../stores/bookStore';
import { useSyncVersionStore } from '../../../stores/syncVersionStore';
import {
  MEDIA_IMAGE_MAX_DIMENSION,
  MEDIA_IMAGE_QUALITY,
  useMediaStore,
} from '../../../media';

export function ExpenseTabScreen() {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const media = useMediaStore();
  const bumpTemplateVersion = useSyncVersionStore(
    state => state.bumpTemplateVersion,
  );
  const {
    amount,
    assetId,
    editingRecordId,
    editingTemplateId,
    images,
    initialTypeId,
    recordTime,
    remark,
    reimbursable,
    reset,
    setAssetId,
    setImages,
    setRecordTime,
    setReimbursable,
    setTags,
    tags: selectedTagIds,
    template,
    templateName,
  } = useAddRecordContext();
  const [typeId, setTypeId] = useState<number>();
  const [submitting, setSubmitting] = useState(false);
  const api = useGlobalApi();
  const {
    categories,
    error: categoriesError,
    loading: categoriesLoading,
    refresh: refreshCategories,
  } = useCategoryItems(
    RECORD_TYPE_CATEGORY.expense,
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
  const assetOptions = useMemo(
    () => toAssetOptions(visibleAssets),
    [visibleAssets],
  );

  const handleSave = useCallback(async () => {
    const draft = {
      booksId: currentBook?.id,
      amount,
      charge: 0,
      typeId,
      selectedType,
      assetId,
      reimbursable,
      recordTime,
      remark,
      tagIds: selectedTagIds,
      imagePaths: images.map(image => image.uri),
      relatedRecordIds: [],
    };

    if (template) {
      const validationMessage = validateTemplateDraft(templateName, 'expense', draft);
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
        const payload = buildNewQuickTemplate('expense', draft, {
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

    const validationMessage = validateAddRecordDraft('expense', draft);
    if (validationMessage !== undefined) {
      toast.show({ messageText: validationMessage });
      return;
    }

    if (!media) {
      toast.show({ messageText: '未找到当前账本' });
      return;
    }

    try {
      setSubmitting(true);
      const persisted = await persistRecordImages(images, media);
      setImages(persisted.images);
      await saveAddRecordDraft(
        'expense',
        { ...draft, imagePaths: persisted.imagePaths },
        editingRecordId,
      );
      reset();
      toast.show({
        messageText:
          editingRecordId !== undefined ? '已更新支出' : '已新增支出',
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
    bumpTemplateVersion,
    currentBook,
    editingRecordId,
    editingTemplateId,
    images,
    media,
    navigation,
    recordTime,
    remark,
    reset,
    reimbursable,
    selectedTagIds,
    selectedType,
    template,
    templateName,
    toast,
    typeId,
  ]);

  return (
    <ThemeProvider config={{ token: { colorPrimary: token.red10 } }}>
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
                labelText="付款资产（可选）"
                loading={assetsLoading}
                onChange={value => setAssetId(toNumberValue(value) ?? null)}
                options={assetOptions}
                searchable
                texts={{
                  headerText: '选择付款资产',
                  searchLabelText: '付款资产',
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
                        error instanceof Error ? error.message : '选择图片失败',
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
              <Row justify="center" align="center" style={styles.switchCell}>
                <Checkbox value={reimbursable} onChange={setReimbursable}>
                  报销
                </Checkbox>
              </Row>
            </Row>
          </Card>
          <Card variant="elevated">
            <RemarkInput />
          </Card>
          <Button block loading={submitting} onPress={handleSave} type="primary">
            {template ? '保存模板' : '保存支出'}
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
  switchCell: {
    flex: 1,
  },
}));
