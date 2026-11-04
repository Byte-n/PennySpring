import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Column,
  ImagePicker,
  KeyboardAwareFormScroll,
  Sticky,
  StickyLayout,
  Row,
  ListPicker,
  useToast,
} from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import { createUseSheetStyle, ThemeProvider, useTheme } from '@pennyspring/ui';
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
import { useNavigation } from '../../../navigation';
import { useGlobalApi } from '../../../stores/bookStore';
import { useSyncVersionStore } from '../../../stores/syncVersionStore';
import {
  MEDIA_IMAGE_MAX_DIMENSION,
  MEDIA_IMAGE_QUALITY,
  createMediaStore,
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
    charge,
    draftTarget,
    editingRecordId,
    editingTemplateId,
    images,
    recordTime,
    remark,
    reimbursable,
    reset,
    setAssetId,
    setTypeId,
    typeId,
    setImages,
    setRecordTime,
    setReimbursable,
    setTags,
    tags: selectedTagIds,
    template,
    templateName,
  } = useAddRecordContext();
  const [submitting, setSubmitting] = useState(false);
  const api = useGlobalApi();
  const {
    categories,
    error: categoriesError,
    loading: categoriesLoading,
    refresh: refreshCategories,
  } = useCategoryItems(RECORD_TYPE_CATEGORY.expense, draftTarget?.booksId);
  const {
    assetsLoading,
    booksId,
    currentBook,
    tags: allTags,
    tagsLoading,
    visibleAssets,
  } = useAddRecordResources(draftTarget?.booksId);
  const draftMedia = useMemo(
    () =>
      draftTarget
        ? createMediaStore({ kind: 'local', booksId: draftTarget.booksId })
        : null,
    [draftTarget],
  );
  const selectedType = useMemo(
    () =>
      categories.find(
        category => category.id === (typeId ?? categories[0]?.id),
      ),
    [categories, typeId],
  );
  const selectedTypeId = selectedType?.id;
  const assetOptions = useMemo(
    () => toAssetOptions(visibleAssets),
    [visibleAssets],
  );

  const handleSave = useCallback(async () => {
    const draft = {
      booksId,
      amount,
      charge: draftTarget ? charge : 0,
      typeId: selectedTypeId,
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
      if (draftTarget) {
        toast.show({ messageText: '草稿模式不支持保存模板' });
        return;
      }
      const validationMessage = validateTemplateDraft(
        templateName,
        'expense',
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

    const validationMessage = validateAddRecordDraft('expense', draft);
    if (validationMessage !== undefined) {
      toast.show({ messageText: validationMessage });
      return;
    }

    const mediaStore = draftMedia ?? media;
    if (!mediaStore) {
      toast.show({ messageText: '未找到当前账本' });
      return;
    }

    try {
      setSubmitting(true);
      const persisted = await persistRecordImages(images, mediaStore);
      setImages(persisted.images);
      await saveAddRecordDraft(
        'expense',
        { ...draft, imagePaths: persisted.imagePaths },
        editingRecordId,
        draftTarget ? { draft: draftTarget } : undefined,
      );
      reset();
      toast.show({
        messageText: draftTarget
          ? '已记账'
          : editingRecordId !== undefined
            ? '已更新支出'
            : '已新增支出',
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
    draftMedia,
    draftTarget,
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
    selectedTypeId,
  ]);

  return (
    <ThemeProvider config={{ token: { colorPrimary: token.red10 } }}>
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
            <Sticky placement="bottom">
              <Button
                block
                loading={submitting}
                onPress={handleSave}
                type="primary"
              >
                {template ? '保存模板' : '保存支出'}
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
  switchCell: {
    flex: 1,
  },
}));
