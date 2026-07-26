import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
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
import { saveAddRecordDraft, validateAddRecordDraft } from '../addRecordDraft';
import { toAssetOptions, toTagOptions } from '../recordOptions';
import { toNumberValue, toNumberValues } from '../selectValues';
import { useAddRecordResources } from '../useAddRecordResources';
import { useInitialTypeId } from '../useInitialTypeId';
import { useNavigation } from '../../../navigation';

export function ExpenseTabScreen() {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
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
  const [isReimbursable, setIsReimbursable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { categories, loading: categoriesLoading } = useCategoryItems(
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
      reimbursable: isReimbursable,
      recordTime,
      remark,
      tagIds: tags,
      imagePaths: images.map(image => image.uri),
      relatedRecordIds: [],
    };
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
    amount,
    assetId,
    currentBook,
    editingRecordId,
    images,
    isReimbursable,
    navigation,
    recordTime,
    remark,
    reset,
    selectedType,
    tags,
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
          <AmountDisplay labelText="支出金额" />
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
                labelText="付款资产（可选）"
                loading={assetsLoading}
                onChange={value => setAssetId(toNumberValue(value) ?? null)}
                options={assetOptions}
                searchable
                texts={{
                  headerText: '选择付款资产',
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
              />
              <SelectionList
                displayMode="tag"
                labelText="标签"
                loading={tagsLoading}
                mode="multiple"
                onChange={value => setTags(toNumberValues(value))}
                options={tagOptions}
                searchable
                texts={{
                  headerText: '选择标签',
                  searchPlaceholder: '搜索标签',
                  emptyText: '暂无标签',
                  confirmText: '确定',
                }}
                value={tags}
              />
              <Row justify="center" align="center" style={styles.switchCell}>
                <Checkbox value={isReimbursable} onChange={setIsReimbursable}>
                  <Text>报销</Text>
                </Checkbox>
              </Row>
            </Row>
          </Card>
          <RemarkInput />
          <Button block loading={submitting} onPress={handleSave} type="primary">
            保存支出
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
