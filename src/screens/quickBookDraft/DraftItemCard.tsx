import React from 'react';
import { View } from 'react-native';
import { Button, Column, Icon, Image, Row, Tag, Text } from '@pennyspring/ui';
import {
  RECORD_TYPE_CATEGORY,
  type AssetRow,
  type DraftItem,
  type QuickBookDraftRow,
  type RecordTypeCategoryValue,
  type TypeRow,
} from '@pennyspring/api';

import { getPhosphorIconComponent } from '../../constants/typeIconTree';
import {
  amountColor,
  formatRecordDateParts,
} from '../home/tabs/detail/detailData';
import { InfoRow, RouteRow } from '../home/tabs/detail/RecordDetailContent';
import { useRecordDetailStyles } from '../home/tabs/detail/recordDetailStyles';
import {
  formatDraftAmount,
  formatDraftAmountParts,
  getDraftItemCategory,
  getDraftItemMissingLabels,
  isDraftItemComplete,
} from '../../features/quickBookDraft/draftLogic';
import { useDraftDetailStyles } from './draftDetailStyles';

const FALLBACK_TYPE_ICON = 'DotsThreeCircle';

function getCategoryLabel(category: RecordTypeCategoryValue): string {
  if (category === RECORD_TYPE_CATEGORY.income) {
    return '收入';
  }
  if (category === RECORD_TYPE_CATEGORY.transfer) {
    return '转账';
  }
  return '支出';
}

interface DraftItemCardProps {
  draft: QuickBookDraftRow;
  item: DraftItem;
  index: number;
  typeMap: ReadonlyMap<number, TypeRow>;
  assetMap: ReadonlyMap<number, AssetRow>;
  isGroupConfirmed: boolean;
  isBusy: boolean;
  isBookMissing: boolean;
  isConfirming: boolean;
  onConfirmNavigate: () => void;
  onDirectConfirm: () => void;
}

interface DraftHeroProps {
  item: DraftItem;
  type: TypeRow | undefined;
  typeMap: ReadonlyMap<number, TypeRow>;
}

function DraftHero({ item, type, typeMap }: DraftHeroProps) {
  const recordStyles = useRecordDetailStyles();
  const detailStyles = useDraftDetailStyles();
  const category = getDraftItemCategory(type);
  const isTransfer = category === RECORD_TYPE_CATEGORY.transfer;
  const isIncome = category === RECORD_TYPE_CATEGORY.income;
  const iconColor = isIncome ? 'success' : isTransfer ? 'primary' : 'error';
  const typeIconStyle = isTransfer
    ? recordStyles.typeIconTransfer
    : isIncome
      ? recordStyles.typeIconIncome
      : recordStyles.typeIconExpense;
  const CategoryIcon = getPhosphorIconComponent(
    type?.icon ?? FALLBACK_TYPE_ICON,
  );
  const parentType = type?.parentId ? typeMap.get(type.parentId) : undefined;
  const amountTone = amountColor(category);
  const parts =
    item.amountCents === null || item.amountCents <= 0
      ? null
      : formatDraftAmountParts(item.amountCents);
  const date = formatRecordDateParts(item.recordTime);
  const sign = isIncome ? '+' : isTransfer ? '' : '-';

  return (
    <Column style={recordStyles.hero}>
      <Row
        align="center"
        justify="between"
        gap="small"
        style={recordStyles.heroTop}
      >
        <Row align="center" gap="small" style={recordStyles.heroType}>
          <Row
            align="center"
            justify="center"
            style={[recordStyles.typeIcon, typeIconStyle]}
          >
            <Icon color={iconColor} icon={CategoryIcon} size="large" />
          </Row>
          <Column style={recordStyles.heroText}>
            {type ? (
              isTransfer ? (
                <Text
                  color="heading"
                  numberOfLines={1}
                  size="sm"
                  weight="medium"
                >
                  转账
                </Text>
              ) : (
                <Text
                  color="tertiary"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  size="sm"
                >
                  <Text color="tertiary" size="sm">
                    {getCategoryLabel(category)}
                  </Text>
                  <Text color="quaternary" size="sm">
                    {' / '}
                  </Text>
                  {parentType ? (
                    <>
                      <Text color="tertiary" size="sm">
                        {parentType.name}
                      </Text>
                      <Text color="quaternary" size="sm">
                        {' / '}
                      </Text>
                    </>
                  ) : null}
                  <Text color="heading" size="sm" weight="medium">
                    {type.name}
                  </Text>
                </Text>
              )
            ) : (
              <Text color="warningText" size="sm">
                待选择类型
              </Text>
            )}
          </Column>
        </Row>
        {item.reimbursable ? (
          <Row align="center" style={recordStyles.badge}>
            <View style={recordStyles.badgeDot} />
            <Text color="heading" size="xs">
              可报销
            </Text>
          </Row>
        ) : null}
      </Row>
      <Row
        align="end"
        justify="between"
        gap="normal"
        style={recordStyles.amountRow}
      >
        {parts === null ? (
          <Text
            color="warningText"
            size="h2"
            style={[
              recordStyles.num,
              recordStyles.amountInteger,
              detailStyles.missingAmount,
            ]}
            weight="semibold"
          >
            金额待确认
          </Text>
        ) : (
          <Text
            color={amountTone}
            numberOfLines={1}
            size="h2"
            style={[
              recordStyles.num,
              recordStyles.amountText,
              recordStyles.amountInteger,
            ]}
            weight="semibold"
          >
            {sign ? (
              <Text
                color={amountTone}
                size="xl"
                style={[recordStyles.num, recordStyles.amountAffix]}
                weight="semibold"
              >
                {sign}
              </Text>
            ) : null}
            <Text
              color={amountTone}
              size="lg"
              style={[recordStyles.num, recordStyles.amountAffix]}
              weight="semibold"
            >
              ¥
            </Text>
            <Text
              color={amountTone}
              size="h2"
              style={[recordStyles.num, recordStyles.amountInteger]}
              weight="semibold"
            >
              {parts.integer}
            </Text>
            <Text
              color={amountTone}
              size="xl"
              style={[recordStyles.num, recordStyles.amountAffix]}
              weight="semibold"
            >
              .{parts.decimal}
            </Text>
          </Text>
        )}
        <Column align="end">
          <Text color="tertiary" size="xs">
            {date.date}
          </Text>
          <Text color="quaternary" size="xs">
            {date.time}
          </Text>
        </Column>
      </Row>
    </Column>
  );
}

interface DraftItemInfoProps {
  draft: QuickBookDraftRow;
  item: DraftItem;
  type: TypeRow | undefined;
  assetMap: ReadonlyMap<number, AssetRow>;
  isGroupConfirmed: boolean;
}

function DraftItemInfo({
  draft,
  item,
  type,
  assetMap,
  isGroupConfirmed,
}: DraftItemInfoProps) {
  const recordStyles = useRecordDetailStyles();
  const detailStyles = useDraftDetailStyles();
  const isTransfer = type?.typeCategory === RECORD_TYPE_CATEGORY.transfer;
  const assetName = assetMap.get(item.assetId)?.name ?? item.assetName;
  const intoAssetName =
    assetMap.get(item.intoAssetId)?.name ?? item.intoAssetName;
  const rows: React.ReactNode[] = [];

  if (!isTransfer && assetName) {
    rows.push(
      <InfoRow key="account" label="账户" showDivider={rows.length > 0}>
        <Text color="default" size="sm">
          {assetName}
        </Text>
      </InfoRow>,
    );
  }

  rows.push(
    <InfoRow key="image" label="图片" showDivider={rows.length > 0}>
      {isGroupConfirmed ? (
        <Text color="tertiary" size="sm">
          已存入记录
        </Text>
      ) : (
        <Image
          preview
          radius="small"
          src={{ uri: draft.imagePath }}
          style={detailStyles.recordImageThumb}
        />
      )}
    </InfoRow>,
  );

  if (item.chargeCents > 0) {
    rows.push(
      <InfoRow key="charge" label="手续费" showDivider={rows.length > 0}>
        <Text color="default" size="sm">
          {formatDraftAmount(item.chargeCents)}
        </Text>
      </InfoRow>,
    );
  }

  if (item.remark) {
    rows.push(
      <InfoRow isBlock key="remark" label="备注" showDivider={rows.length > 0}>
        <Text color="default" size="sm">
          {item.remark}
        </Text>
      </InfoRow>,
    );
  }

  return (
    <>
      {isTransfer ? (
        <Column style={recordStyles.flowCard}>
          <RouteRow
            isOutline={false}
            label="转出"
            name={assetName || '未选择转出资产'}
          />
          <RouteRow
            isOutline
            label="转入"
            name={intoAssetName || '未选择转入资产'}
          />
        </Column>
      ) : null}
      <Column style={recordStyles.infoCard}>{rows}</Column>
    </>
  );
}

export function DraftItemCard({
  draft,
  item,
  index,
  typeMap,
  assetMap,
  isGroupConfirmed,
  isBusy,
  isBookMissing,
  isConfirming,
  onConfirmNavigate,
  onDirectConfirm,
}: DraftItemCardProps): React.ReactElement {
  const detailStyles = useDraftDetailStyles();
  const type = typeMap.get(item.typeId);
  const isConfirmed = item.status === 'confirmed';
  const isComplete = isDraftItemComplete(item, type, draft.booksId);
  const missingLabels = getDraftItemMissingLabels(item, type, draft.booksId);
  const statusLabel = isConfirmed ? '已记账' : isComplete ? '完整' : '待补全';
  const statusColor = isConfirmed ? 'success' : isComplete ? 'info' : 'warning';
  const noticeText =
    !isConfirmed && missingLabels.length > 0
      ? `${missingLabels.join('、')}；暂不显示“确定”，可点“确认”补全。`
      : '';
  const warningsText = item.warnings.join('；');

  return (
    <Column style={detailStyles.itemCard}>
      <Row justify="between" style={detailStyles.itemHead}>
        <Text color="heading" size="sm" weight="semibold">
          {`第 ${index + 1} 笔`}
        </Text>
        <Tag color={statusColor} size="small">
          {statusLabel}
        </Tag>
      </Row>

      <DraftHero item={item} type={type} typeMap={typeMap} />
      <DraftItemInfo
        assetMap={assetMap}
        draft={draft}
        isGroupConfirmed={isGroupConfirmed}
        item={item}
        type={type}
      />

      {warningsText ? (
        <Column style={detailStyles.itemNotice}>
          <Text color="warningText" size="xs">
            {warningsText}
          </Text>
        </Column>
      ) : null}
      {noticeText ? (
        <Column style={detailStyles.itemNotice}>
          <Text color="warningText" size="xs">
            {noticeText}
          </Text>
        </Column>
      ) : null}

      {isConfirmed ? null : (
        <Row style={detailStyles.itemActions}>
          <Button
            disabled={isBusy || isBookMissing}
            onPress={onConfirmNavigate}
            type="default"
          >
            确认
          </Button>
          {isComplete ? (
            <Button
              disabled={isBusy || isBookMissing}
              loading={isConfirming}
              onPress={onDirectConfirm}
              type="primary"
            >
              确定
            </Button>
          ) : null}
        </Row>
      )}
    </Column>
  );
}
