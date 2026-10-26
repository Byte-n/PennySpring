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
  Text,
  useToast,
} from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import { createUseSheetStyle, ThemeProvider, useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryField } from '../components/CategoryField';
import { RemarkInput } from '../components/RemarkInput';
import { useCategoryItems } from '../useCategoryItems';
import { useAddRecordContext } from '../AddRecordContext';
import { RecordDateTimeField } from '../components/RecordDateTimeField';
import { saveAddRecordDraft, validateAddRecordDraft } from '../addRecordDraft';
import { buildNewQuickTemplate, validateTemplateDraft } from '../templateDraft';
import { toAssetOptions, toTagOptions } from '../recordOptions';
import { toNumberValue, toNumberValues } from '../selectValues';
import { useAddRecordResources } from '../useAddRecordResources';
import { useInitialTypeId } from '../useInitialTypeId';
import { useNavigation } from '../../../navigation';
import { useQuickTemplateStore } from '../../quickTemplate/quickTemplateStore';

export function ExpenseTabScreen() {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
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
    tags,
    template,
    templateName,
  } = useAddRecordContext();
  const [typeId, setTypeId] = useState<number>();
  const [submitting, setSubmitting] = useState(false);
  const addTemplate = useQuickTemplateStore(state => state.addTemplate);
  const updateTemplate = useQuickTemplateStore(state => state.updateTemplate);
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
    tagsLoading,
    visibleAssets,
    visibleTags,
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
  const tagOptions = useMemo(() => toTagOptions(visibleTags), [visibleTags]);

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
      tagIds: tags,
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

    const validationMessage = validateAddRecordDraft('expense', draft);
    if (validationMessage !== undefined) {
      toast.show({ messageText: validationMessage });
      return;
    }

    try {
      setSubmitting(true);
      await saveAddRecordDraft('expense', draft, editingRecordId);
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
    addTemplate,
    amount,
    assetId,
    currentBook,
    editingRecordId,
    editingTemplateId,
    images,
    navigation,
    recordTime,
    remark,
    reset,
    reimbursable,
    selectedType,
    tags,
    template,
    templateName,
    toast,
    typeId,
    updateTemplate,
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
              <ListPicker
                displayMode="tag"
                labelText="标签"
                loading={tagsLoading}
                mode="multiple"
                onChange={value => setTags(toNumberValues(value))}
                options={tagOptions}
                searchable
                texts={{
                  headerText: '选择标签',
                  searchLabelText: '标签',
                  searchPlaceholder: '搜索标签',
                  emptyText: '暂无标签',
                  confirmText: '确定',
                }}
                value={tags}
              />
              <Row justify="center" align="center" style={styles.switchCell}>
                <Checkbox value={reimbursable} onChange={setReimbursable}>
                  <Text>报销</Text>
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
