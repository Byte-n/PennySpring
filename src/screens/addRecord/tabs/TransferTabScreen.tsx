import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Column,
  KeyboardAwareFormScroll,
  SelectionList,
  Text,
  useToast,
} from '@pennyspring/ui';
import { api, RECORD_TYPE_CATEGORY } from '@pennyspring/data';
import { useTheme } from '@pennyspring/theme';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryGrid } from '../../../component/CategoryGrid';
import { RemarkInput } from '../components/RemarkInput';
import { useCategoryItems } from '../useCategoryItems';
import { useAddRecordContext } from '../AddRecordContext';
import { ImageAttachmentsInput } from '../components/ImageAttachmentsInput';
import { MoneyField } from '../components/MoneyField';
import { RecordDateTimeField } from '../components/RecordDateTimeField';
import {
  buildCreateRecordInput,
  filterTransferAssets,
  validateAddRecordDraft,
} from '../addRecordDraft';
import { toAssetOptions, toTagOptions } from '../recordOptions';
import { toNumberValue, toNumberValues } from '../selectValues';
import { useAddRecordResources } from '../useAddRecordResources';
import { useNavigation } from '../../../navigation';

export function TransferTabScreen() {
  const { token } = useTheme();
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
  const [intoAssetId, setIntoAssetId] = useState<number | null>(null);
  const [charge, setCharge] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { categories, loading: categoriesLoading } = useCategoryItems(
    RECORD_TYPE_CATEGORY.transfer,
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
  const tagOptions = useMemo(
    () => toTagOptions(visibleTags),
    [visibleTags],
  );

  useEffect(() => {
    if (assetId !== null && !fromAssets.some(asset => asset.id === assetId)) {
      setAssetId(null);
    }
  }, [assetId, fromAssets]);

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
      tagIds: tags,
      imagePaths: images,
      relatedRecordIds: [],
    };
    const validationMessage = validateAddRecordDraft('transfer', draft);
    if (validationMessage !== undefined) {
      toast.show({ messageText: validationMessage });
      return;
    }

    try {
      setSubmitting(true);
      await api.record.create(buildCreateRecordInput('transfer', draft));
      reset();
      toast.show({ messageText: '已新增转账' });
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
    intoAssetId,
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
    <KeyboardAwareFormScroll
      extraBottomInset={token.paddingXL}
      focusedInputBottomOffset={token.paddingXL}
    >
      <Column gap={token.marginMD}>
        <AmountDisplay />
        <CategoryGrid
          categories={categories}
          value={typeId}
          onChange={setTypeId}
        />
        {categoriesLoading ? (
          <Text color="description" size="sm">分类加载中</Text>
        ) : null}
        <SelectionList
          label="转出资产"
          loading={assetsLoading}
          onChange={value => setAssetId(toNumberValue(value) ?? null)}
          options={fromAssetOptions}
          placeholder="请选择转出资产"
          searchable
          texts={{
            headerText: '选择转出资产',
            searchPlaceholder: '搜索资产',
            emptyText: '暂无可用转出资产',
          }}
          value={assetId ?? undefined}
        />
        <SelectionList
          label="转入资产"
          loading={assetsLoading}
          onChange={value => setIntoAssetId(toNumberValue(value) ?? null)}
          options={intoAssetOptions}
          placeholder="请选择转入资产"
          searchable
          texts={{
            headerText: '选择转入资产',
            searchPlaceholder: '搜索资产',
            emptyText: '暂无可用转入资产',
          }}
          value={intoAssetId ?? undefined}
        />
        <MoneyField labelText="手续费" value={charge} onChange={setCharge} />
        <RecordDateTimeField value={recordTime} onChange={setRecordTime} />
        <SelectionList
          displayMode="tag"
          label="标签"
          loading={tagsLoading}
          mode="multiple"
          onChange={value => setTags(toNumberValues(value))}
          options={tagOptions}
          placeholder="请选择标签"
          searchable
          texts={{
            headerText: '选择标签',
            searchPlaceholder: '搜索标签',
            emptyText: '暂无标签',
            confirmText: '确定',
          }}
          value={tags}
        />
        <ImageAttachmentsInput value={images} onChange={setImages} />
        <RemarkInput />
        <Button
          block
          loading={submitting}
          onPress={handleSave}
          type="primary"
        >
          保存转账
        </Button>
      </Column>
    </KeyboardAwareFormScroll>
  );
}
