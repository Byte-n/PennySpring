import React from 'react';
import { Pressable } from 'react-native';
import { Button, Column, Row, Text } from '@pennyspring/ui';
import {
  RECORD_TYPE_CATEGORY,
  type AssetRow,
  type DraftItem,
  type TypeRow,
} from '@pennyspring/api';

import {
  DRAFT_MISSING_AMOUNT_TEXT,
  DRAFT_MISSING_FROM_ASSET_TEXT,
  DRAFT_MISSING_INTO_ASSET_TEXT,
  DRAFT_MISSING_TYPE_TEXT,
  formatDraftAmount,
  getDraftItemMissingLabels,
  getDraftItemTypeLabel,
  isDraftItemComplete,
  isDraftTypeInBook,
} from '../../../../features/quickBookDraft/draftLogic';
import { useDraftTabStyles } from './draftTabStyles';

export type DraftFillField = 'type' | 'amount' | 'asset' | 'intoAsset';

const MISS_CHIP_HIT_SLOP = 9;

interface DraftItemRowProps {
  item: DraftItem;
  booksId: number;
  typeMap: ReadonlyMap<number, TypeRow>;
  assetMap: ReadonlyMap<number, AssetRow>;
  isBusy: boolean;
  isConfirming: boolean;
  isBookMissing: boolean;
  onFill: (field: DraftFillField) => void;
  onEdit: () => void;
  onConfirm: () => void;
}

interface MissingChipProps {
  label: string;
  disabled: boolean;
  onPress: () => void;
}

function MissingChip({
  label,
  disabled,
  onPress,
}: MissingChipProps): React.ReactElement {
  const styles = useDraftTabStyles();
  return (
    <Pressable
      disabled={disabled}
      hitSlop={MISS_CHIP_HIT_SLOP}
      onPress={onPress}
      style={({ pressed }) => [
        styles.missChip,
        disabled ? styles.missChipDisabled : null,
        pressed && !disabled ? styles.missChipPressed : null,
      ]}
    >
      <Text color="warningText" size="xs" weight="medium">
        {`+ ${label}`}
      </Text>
    </Pressable>
  );
}

function getFirstFillField(
  item: DraftItem,
  type: TypeRow | undefined,
  booksId: number,
): DraftFillField | null {
  if (!isDraftTypeInBook(type, booksId)) {
    return 'type';
  }
  if (item.amountCents === null || item.amountCents <= 0) {
    return 'amount';
  }
  if (type.typeCategory === RECORD_TYPE_CATEGORY.transfer) {
    if (item.assetId <= 0) {
      return 'asset';
    }
    if (item.intoAssetId <= 0 || item.assetId === item.intoAssetId) {
      return 'intoAsset';
    }
  }
  return null;
}

function getExtraMissingText(
  item: DraftItem,
  type: TypeRow | undefined,
  booksId: number,
): string {
  return getDraftItemMissingLabels(item, type, booksId)
    .filter(
      label =>
        label !== DRAFT_MISSING_AMOUNT_TEXT &&
        label !== DRAFT_MISSING_TYPE_TEXT &&
        label !== DRAFT_MISSING_FROM_ASSET_TEXT &&
        label !== DRAFT_MISSING_INTO_ASSET_TEXT,
    )
    .join(' · ');
}

export function DraftItemRow({
  item,
  booksId,
  typeMap,
  assetMap,
  isBusy,
  isConfirming,
  isBookMissing,
  onFill,
  onEdit,
  onConfirm,
}: DraftItemRowProps): React.ReactElement {
  const styles = useDraftTabStyles();
  const chipsDisabled = isBusy || isBookMissing;
  const type = typeMap.get(item.typeId);
  const isTypeValid = isDraftTypeInBook(type, booksId);
  const isConfirmed = item.status === 'confirmed';
  const isComplete = isDraftItemComplete(item, type, booksId);
  const firstFill = isComplete ? null : getFirstFillField(item, type, booksId);
  const needsFullForm = !isComplete && firstFill === null;
  const isTransfer =
    isTypeValid && type.typeCategory === RECORD_TYPE_CATEGORY.transfer;
  const assetName = assetMap.get(item.assetId)?.name ?? item.assetName;
  const intoAssetName =
    assetMap.get(item.intoAssetId)?.name ?? item.intoAssetName;
  const assetsConflict =
    isTransfer && item.assetId > 0 && item.assetId === item.intoAssetId;
  const amountMissing = item.amountCents === null || item.amountCents <= 0;
  const extraMissing = isConfirmed
    ? ''
    : getExtraMissingText(item, type, booksId);
  const metaGroups: React.ReactNode[] = [];

  if (extraMissing) {
    metaGroups.push(
      <Text color="warningText" key="missing" size="xs">
        {extraMissing}
      </Text>,
    );
  }

  if (isTransfer) {
    metaGroups.push(
      <Row align="center" gap="small" key="route">
        {assetName ? (
          <Text color="tertiary" size="xs">
            {assetName}
          </Text>
        ) : (
          <MissingChip
            disabled={chipsDisabled}
            label="转出资产"
            onPress={() => onFill('asset')}
          />
        )}
        <Text color="tertiary" size="xs">
          →
        </Text>
        {intoAssetName && !assetsConflict ? (
          <Text color="tertiary" size="xs">
            {intoAssetName}
          </Text>
        ) : (
          <MissingChip
            disabled={chipsDisabled}
            label="转入资产"
            onPress={() => onFill('intoAsset')}
          />
        )}
      </Row>,
    );
  } else if (assetName) {
    metaGroups.push(
      <Text key="asset" color="tertiary" size="xs">
        {assetName}
      </Text>,
    );
  }

  if (item.remark) {
    metaGroups.push(
      <Text
        key="remark"
        color="tertiary"
        numberOfLines={1}
        size="xs"
        style={styles.remark}
      >
        {`备注：${item.remark}`}
      </Text>,
    );
  }

  const handlePrimaryPress = (): void => {
    if (isComplete) {
      onConfirm();
      return;
    }
    if (firstFill) {
      onFill(firstFill);
      return;
    }
    onEdit();
  };

  const showMetaRow =
    metaGroups.length > 0 || (isComplete === false && needsFullForm === false);

  return (
    <Column style={styles.itemBlock}>
      <Row align="center" gap="small" justify="between" style={styles.itemRow}>
        <Row align="center" gap="small" style={styles.itemCopy}>
          {isTypeValid ? (
            <Text
              color={isConfirmed ? 'tertiary' : 'default'}
              numberOfLines={1}
              size="sm"
              style={styles.itemType}
              weight={isConfirmed ? 'regular' : 'medium'}
            >
              {getDraftItemTypeLabel(type, typeMap)}
            </Text>
          ) : (
            <MissingChip
              disabled={chipsDisabled}
              label="选择类型"
              onPress={() => onFill('type')}
            />
          )}
          {isConfirmed ? (
            <Text color="successText" size="xs">
              已记账
            </Text>
          ) : null}
        </Row>
        <Row align="center" gap="small" style={styles.itemRight}>
          {amountMissing ? (
            <MissingChip
              disabled={chipsDisabled}
              label="填写金额"
              onPress={() => onFill('amount')}
            />
          ) : (
            <Text
              color={isConfirmed ? 'tertiary' : 'heading'}
              numberOfLines={1}
              size="md"
              style={styles.num}
              weight={isConfirmed ? 'regular' : 'semibold'}
            >
              {formatDraftAmount(item.amountCents)}
            </Text>
          )}
          {isConfirmed ? null : (
            <Button
              disabled={chipsDisabled}
              hitSlop={6}
              loading={isConfirming}
              onPress={handlePrimaryPress}
              size="small"
              type="primary"
            >
              {isComplete ? '确定记账' : needsFullForm ? '新建记录' : '补全'}
            </Button>
          )}
        </Row>
      </Row>

      {showMetaRow ? (
        <Row
          align="center"
          gap="small"
          justify="between"
          style={styles.itemMetaRow}
        >
          <Row align="center" gap="small" style={styles.itemMeta} wrap>
            {metaGroups.map((group, metaIndex) => (
              <React.Fragment key={metaIndex}>
                {metaIndex > 0 ? (
                  <Text color="quaternary" size="xs">
                    ·
                  </Text>
                ) : null}
                {group}
              </React.Fragment>
            ))}
          </Row>
          {isConfirmed || needsFullForm ? null : (
            <Button
              color="default"
              disabled={chipsDisabled}
              hitSlop={6}
              onPress={onEdit}
              size="small"
              type="text"
            >
              新建记录
            </Button>
          )}
        </Row>
      ) : null}
    </Column>
  );
}
