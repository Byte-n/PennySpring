import React from 'react';
import { Pressable } from 'react-native';
import { Button, Column, Icon, Row, Switch, Text } from '@pennyspring/ui';
import {
  RECORD_TYPE_CATEGORY,
  type AssetRow,
  type DraftItem,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';

import {
  formatDraftAmount,
  formatDraftItemTime,
  getDraftItemTypeLabel,
  getDraftItemWarningTexts,
  isAbsorptionDraftType,
  isDraftItemComplete,
  isDraftTypeInBook,
} from '../../../../features/quickBookDraft/draftLogic';
import { useDraftTabStyles } from './draftTabStyles';

const CHIP_HIT_SLOP = 12;
const SWITCH_HIT_SLOP = 5;

type DraftItemFillTarget = 'type' | 'amount' | 'edit';

interface DraftItemRowProps {
  item: DraftItem;
  booksId: number;
  headerTime: number;
  fallbackAttachImage: boolean;
  typeMap: ReadonlyMap<number, TypeRow>;
  assetMap: ReadonlyMap<number, AssetRow>;
  tagMap: ReadonlyMap<number, TagRow>;
  isFirst: boolean;
  isBusy: boolean;
  isConfirming: boolean;
  isBookMissing: boolean;
  onEditType: () => void;
  onEditAmount: () => void;
  onEditTags: () => void;
  onEditTime: () => void;
  onToggleAttach: (next: boolean) => void;
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
      hitSlop={CHIP_HIT_SLOP}
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

function getFirstFillTarget(
  item: DraftItem,
  type: TypeRow | undefined,
  booksId: number,
): DraftItemFillTarget {
  if (!isDraftTypeInBook(type, booksId)) {
    return 'type';
  }
  if (isAbsorptionDraftType(type)) {
    return 'edit';
  }
  if (item.amountCents === null || item.amountCents <= 0) {
    return 'amount';
  }
  if (
    type.typeCategory === RECORD_TYPE_CATEGORY.transfer &&
    (item.assetId <= 0 ||
      item.intoAssetId <= 0 ||
      item.assetId === item.intoAssetId)
  ) {
    return 'edit';
  }
  return 'edit';
}

interface ItemTagsProps {
  tags: readonly TagRow[];
  extraCount: number;
  disabled: boolean;
  isReadonly: boolean;
  onPress: () => void;
}

function ItemTags({
  tags,
  extraCount,
  disabled,
  isReadonly,
  onPress,
}: ItemTagsProps): React.ReactElement {
  const styles = useDraftTabStyles();
  const content =
    tags.length === 0 ? (
      <Text color="tertiary" size="xs">
        + 标签
      </Text>
    ) : (
      <>
        <Text color="tertiary" size="xs">
          标签
        </Text>
        {tags.map(tag => (
          <Row key={tag.id} style={styles.tagChip}>
            <Text
              color="secondary"
              numberOfLines={1}
              size="xs"
              style={styles.tagText}
            >
              {tag.name}
            </Text>
          </Row>
        ))}
        {extraCount > 0 ? (
          <Text color="tertiary" size="xs">{`+${extraCount}`}</Text>
        ) : null}
      </>
    );

  if (isReadonly) {
    return (
      <Row style={styles.itemTags}>{tags.length > 0 ? content : null}</Row>
    );
  }

  return (
    <Pressable
      disabled={disabled}
      hitSlop={CHIP_HIT_SLOP}
      onPress={onPress}
      style={({ pressed }) => [
        styles.itemTags,
        pressed && !disabled && tags.length > 0 ? styles.itemTagsPressed : null,
      ]}
    >
      {content}
    </Pressable>
  );
}

export function DraftItemRow({
  item,
  booksId,
  headerTime,
  fallbackAttachImage,
  typeMap,
  assetMap,
  tagMap,
  isFirst,
  isBusy,
  isConfirming,
  isBookMissing,
  onEditType,
  onEditAmount,
  onEditTags,
  onEditTime,
  onToggleAttach,
  onEdit,
  onConfirm,
}: DraftItemRowProps): React.ReactElement {
  const styles = useDraftTabStyles();
  const type = typeMap.get(item.typeId);
  const isTypeValid = isDraftTypeInBook(type, booksId);
  const isConfirmed = item.status === 'confirmed';
  const isComplete = isDraftItemComplete(item, type, booksId);
  const isAbsorption = isAbsorptionDraftType(type);
  const isTransfer =
    isTypeValid && type.typeCategory === RECORD_TYPE_CATEGORY.transfer;
  const chipsDisabled = isBusy || isBookMissing;
  const timeText = formatDraftItemTime(item.recordTime, headerTime);
  const amountMissing = item.amountCents === null || item.amountCents <= 0;
  const attachImage = item.attachImage ?? fallbackAttachImage;
  const tags = item.tagIds
    .map(tagId => tagMap.get(tagId))
    .filter((tag): tag is TagRow => tag !== undefined);
  const visibleTags = tags.slice(0, 2);
  const extraTagCount = tags.length - visibleTags.length;
  const warnings = isConfirmed
    ? []
    : getDraftItemWarningTexts(item, type, booksId);
  const firstFill = isComplete ? null : getFirstFillTarget(item, type, booksId);
  const primaryLabel = isAbsorption
    ? '去关联'
    : isComplete
      ? '确定记账'
      : '补全';
  const primaryAction = isComplete
    ? onConfirm
    : isAbsorption || firstFill === 'edit'
      ? onEdit
      : firstFill === 'amount'
        ? onEditAmount
        : onEditType;

  const assetName = assetMap.get(item.assetId)?.name ?? item.assetName;
  const intoAssetName =
    assetMap.get(item.intoAssetId)?.name ?? item.intoAssetName;
  const metaNodes: React.ReactNode[] = [];

  function addMeta(node: React.ReactNode, key: string): void {
    if (metaNodes.length > 0) {
      metaNodes.push(
        <Text color="quaternary" key={`sep-${key}`} size="xs">
          ·
        </Text>,
      );
    }
    metaNodes.push(node);
  }

  if (isTransfer) {
    addMeta(
      <Row align="center" gap="small" key="route">
        {assetName ? (
          <Text color="tertiary" size="xs">
            {assetName}
          </Text>
        ) : (
          <MissingChip
            disabled={chipsDisabled || isConfirmed}
            label="转出资产"
            onPress={onEdit}
          />
        )}
        <Text color="quaternary" size="xs">
          →
        </Text>
        {intoAssetName && item.assetId !== item.intoAssetId ? (
          <Text color="tertiary" size="xs">
            {intoAssetName}
          </Text>
        ) : (
          <MissingChip
            disabled={chipsDisabled || isConfirmed}
            label="转入资产"
            onPress={onEdit}
          />
        )}
      </Row>,
      'route',
    );
  } else if (assetName) {
    addMeta(
      <Text color="tertiary" key="asset" size="xs">
        {assetName}
      </Text>,
      'asset',
    );
  }

  if (isAbsorption && !isConfirmed) {
    addMeta(
      <Row key="related" style={styles.metaBadge}>
        <Text color="warningText" size="xs">
          需关联支出
        </Text>
      </Row>,
      'related',
    );
  }

  if (item.remark) {
    addMeta(
      <Text
        color="tertiary"
        key="remark"
        numberOfLines={1}
        size="xs"
        style={styles.metaRemark}
      >
        {`备注：${item.remark}`}
      </Text>,
      'remark',
    );
  }

  if (item.chargeCents > 0) {
    addMeta(
      <Text
        color="warningText"
        key="charge"
        size="xs"
        style={styles.metaCharge}
      >
        {`手续费 ${formatDraftAmount(item.chargeCents)}`}
      </Text>,
      'charge',
    );
  }

  if (item.reimbursable) {
    addMeta(
      <Row key="reimb" style={styles.metaBadge}>
        <Text color="warningText" size="xs">
          可报销
        </Text>
      </Row>,
      'reimb',
    );
  }

  return (
    <Column style={[styles.itemBlock, isFirst ? null : styles.itemDivider]}>
      <Row align="center" gap="small" justify="between" style={styles.itemRow}>
        <Row align="center" gap="small" style={styles.itemCopy}>
          {isTypeValid ? (
            isConfirmed ? (
              <Text
                color="tertiary"
                numberOfLines={1}
                size="sm"
                style={styles.itemType}
              >
                {getDraftItemTypeLabel(type, typeMap)}
              </Text>
            ) : (
              <Pressable
                disabled={chipsDisabled}
                hitSlop={CHIP_HIT_SLOP}
                onPress={onEditType}
                style={({ pressed }) => [
                  styles.inlinePressable,
                  pressed && !chipsDisabled ? styles.textPressed : null,
                ]}
              >
                <Text
                  numberOfLines={1}
                  size="sm"
                  style={styles.itemType}
                  weight="medium"
                >
                  {getDraftItemTypeLabel(type, typeMap)}
                </Text>
              </Pressable>
            )
          ) : (
            <MissingChip
              disabled={chipsDisabled || isConfirmed}
              label="选择类型"
              onPress={onEditType}
            />
          )}
          {timeText ? (
            isConfirmed ? (
              <Row style={styles.timeChip}>
                <Text color="tertiary" size="xs">
                  {timeText}
                </Text>
              </Row>
            ) : (
              <Pressable
                disabled={chipsDisabled}
                hitSlop={CHIP_HIT_SLOP}
                onPress={onEditTime}
                style={({ pressed }) => [
                  styles.timeChip,
                  pressed && !chipsDisabled ? styles.timeChipPressed : null,
                ]}
              >
                <Text color="tertiary" size="xs">
                  {timeText}
                </Text>
              </Pressable>
            )
          ) : null}
          {isConfirmed ? (
            <Text color="successText" size="xs">
              已记账
            </Text>
          ) : null}
        </Row>
        <Row align="center" gap="small" style={styles.itemRight}>
          {amountMissing ? (
            <MissingChip
              disabled={chipsDisabled || isConfirmed}
              label="填写金额"
              onPress={onEditAmount}
            />
          ) : isConfirmed ? (
            <Text
              color="tertiary"
              numberOfLines={1}
              size="md"
              style={styles.num}
            >
              {formatDraftAmount(item.amountCents)}
            </Text>
          ) : (
            <Pressable
              disabled={chipsDisabled}
              hitSlop={CHIP_HIT_SLOP}
              onPress={onEditAmount}
              style={({ pressed }) => [
                styles.amountPressable,
                pressed && !chipsDisabled ? styles.textPressed : null,
              ]}
            >
              <Text
                color="heading"
                numberOfLines={1}
                size="md"
                style={styles.num}
                weight="semibold"
              >
                {formatDraftAmount(item.amountCents)}
              </Text>
            </Pressable>
          )}
          {isConfirmed ? null : (
            <Button
              disabled={chipsDisabled}
              loading={isConfirming}
              onPress={primaryAction}
              size="small"
              type="primary"
            >
              {primaryLabel}
            </Button>
          )}
        </Row>
      </Row>

      {metaNodes.length > 0 ? (
        <Row align="center" gap="small" style={styles.itemMeta}>
          {metaNodes}
        </Row>
      ) : null}

      <Row align="center" gap="small" style={styles.itemToolbar}>
        <ItemTags
          disabled={chipsDisabled}
          extraCount={extraTagCount}
          isReadonly={isConfirmed}
          onPress={onEditTags}
          tags={visibleTags}
        />
        {isConfirmed ? (
          <Row style={styles.attachStatic}>
            <Icon color="tertiary" icon="image" size="small" />
            <Text color="tertiary" size="xs">
              {attachImage ? '已带图' : '未带图'}
            </Text>
          </Row>
        ) : (
          <Switch
            checkedText="带图"
            disabled={chipsDisabled}
            hitSlop={SWITCH_HIT_SLOP}
            onChange={onToggleAttach}
            size="small"
            uncheckedText="带图"
            value={attachImage}
          />
        )}
        {isConfirmed ? null : (
          <Pressable
            disabled={chipsDisabled}
            hitSlop={CHIP_HIT_SLOP}
            onPress={onEdit}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && !chipsDisabled ? styles.iconButtonPressed : null,
            ]}
          >
            <Icon color="tertiary" icon="edit" size="small" />
          </Pressable>
        )}
      </Row>

      {warnings.length > 0 ? (
        <Row align="start" style={styles.warningRow}>
          <Icon color="warningText" icon="warning" size="small" />
          <Text
            color="warningText"
            numberOfLines={2}
            size="xs"
            style={styles.warningText}
          >
            {warnings.join('；')}
          </Text>
        </Row>
      ) : null}
    </Column>
  );
}
