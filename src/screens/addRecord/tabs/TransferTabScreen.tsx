import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
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
import {
  createUseSheetStyle,
  ThemeProvider,
  useTheme,
} from '@pennyspring/theme';
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
  useMediaStore,
} from '../../../media';

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
    intoAssetId,
    recordTime,
    remark,
    reset,
    setAssetId,
    setCharge,
    setIntoAssetId,
    setImages,
    setRecordTime,
    setTags,
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
  } = useCategoryItems(RECORD_TYPE_CATEGORY.transfer);
  const {
    assetsLoading,
    currentBook,
    tags: allTags,
    tagsLoading,
    visibleAssets,
  } = useAddRecordResources();
  const selectedType = useMemo(
    () => categories.find(category => category.id === (typeId ?? categories[0]?.id)),
    [categories, typeId],
  );
  const selectedTypeId = selectedType?.id;
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

  const handleTypeChange = useCallback((nextTypeId: number | undefined) => {
    setTypeId(nextTypeId);
    if (assetsLoading) return;

    const nextType = categories.find(category => category.id === nextTypeId);
    const nextFromAssets = filterTransferAssets(visibleAssets, nextType, 'from');
    const nextToAssets = filterTransferAssets(visibleAssets, nextType, 'to');
    if (assetId !== null && !nextFromAssets.some(asset => asset.id === assetId)) {
      setAssetId(null);
    }
    if (intoAssetId !== null && !nextToAssets.some(asset => asset.id === intoAssetId)) {
      setIntoAssetId(null);
    }
  }, [assetId, assetsLoading, categories, intoAssetId, setAssetId, setIntoAssetId, setTypeId, visibleAssets]);

  const handleSave = useCallback(async () => {
    const draft = {
      booksId: currentBook?.id,
      amount,
      charge,
      typeId: selectedTypeId,
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
      const validationMessage = validateTemplateDraft(
        templateName,
        'transfer',
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
        const payload = buildNewQuickTemplate('transfer', draft, {
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

    const validationMessage = validateAddRecordDraft('transfer', draft);
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
        'transfer',
        { ...draft, imagePaths: persisted.imagePaths },
        editingRecordId,
      );
      reset();
      toast.show({
        messageText:
          editingRecordId !== undefined ? '已更新转账' : '已新增转账',
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
    charge,
    currentBook,
    editingRecordId,
    editingTemplateId,
    images,
    intoAssetId,
    media,
    navigation,
    recordTime,
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
    <ThemeProvider config={{ token: { colorPrimary: token.blue10 } }}>
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
                onChange={value => setIntoAssetId(toNumberValue(value) ?? null)}
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
          <Button
            block
            loading={submitting}
            onPress={handleSave}
            type="primary"
          >
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
