import React from 'react';
import { View } from 'react-native';
import { Column, Icon, Row, Text } from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY, REIMBURSABLE } from '@pennyspring/api';
import { getPhosphorIconComponent } from '../../../../constants/typeIconTree';
import {
  amountColor,
  formatAmountParts,
  formatCurrency,
  formatRecordDateParts,
  formatRecordTime,
  formatSignedAmount,
  type DetailRecordView,
} from './detailData';
import { RecordImages } from './RecordImages';
import { useRecordDetailStyles } from './recordDetailStyles';

const HIDDEN_AMOUNT_TEXT = '••••';

function getCategoryLabel(category: DetailRecordView['category']): string {
  if (category === RECORD_TYPE_CATEGORY.income) {
    return '收入';
  }

  if (category === RECORD_TYPE_CATEGORY.transfer) {
    return '转账';
  }

  return '支出';
}

function RecordHero({
  view,
  hidden,
}: {
  view: DetailRecordView;
  hidden: boolean;
}) {
  const styles = useRecordDetailStyles();
  const isTransfer = view.category === RECORD_TYPE_CATEGORY.transfer;
  const isIncome = view.category === RECORD_TYPE_CATEGORY.income;
  const isReimbursable =
    view.record.reimbursable === REIMBURSABLE.reimbursable;
  const CategoryIcon = view.iconValue
    ? getPhosphorIconComponent(view.iconValue)
    : null;
  const iconColor = isIncome ? 'success' : isTransfer ? 'primary' : 'error';
  const typeIconStyle = isTransfer
    ? styles.typeIconTransfer
    : isIncome
      ? styles.typeIconIncome
      : styles.typeIconExpense;
  const amountTone = amountColor(view.category);
  const amount = formatAmountParts(view.finalAmount);
  const date = formatRecordDateParts(view.record.recordTime);
  const sign = isIncome ? '+' : isTransfer ? '' : '-';
  const categoryLabel = getCategoryLabel(view.category);

  const crumb = isTransfer ? (
    <Text
      size="sm"
      weight="medium"
      color="heading"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      转账
    </Text>
  ) : (
    <Text size="sm" color="tertiary" numberOfLines={1} ellipsizeMode="tail">
      <Text size="sm" color="tertiary">
        {categoryLabel}
      </Text>
      <Text size="sm" color="quaternary">
        {' / '}
      </Text>
      {view.parentTypeName ? (
        <>
          <Text size="sm" color="tertiary">
            {view.parentTypeName}
          </Text>
          <Text size="sm" color="quaternary">
            {' / '}
          </Text>
        </>
      ) : null}
      <Text size="sm" weight="medium" color="heading">
        {view.typeName}
      </Text>
    </Text>
  );

  return (
    <Column style={styles.hero}>
      <Row
        align="center"
        justify="between"
        gap="small"
        style={styles.heroTop}
      >
        <Row align="center" gap="small" style={styles.heroType}>
          <Row
            align="center"
            justify="center"
            style={[styles.typeIcon, typeIconStyle]}
          >
            {CategoryIcon ? (
              <Icon icon={CategoryIcon} size="large" color={iconColor} />
            ) : null}
          </Row>
          <Column style={styles.heroText}>
            {crumb}
          </Column>
        </Row>
        {isReimbursable ? (
          <Row align="center" style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text size="xs" color="heading">
              可报销
            </Text>
          </Row>
        ) : null}
      </Row>
      <Row align="end" justify="between" gap="normal" style={styles.amountRow}>
        <Text
          size="h2"
          weight="semibold"
          color={hidden ? 'heading' : amountTone}
          numberOfLines={1}
          style={[styles.num, styles.amountText, styles.amountInteger]}
        >
          {hidden ? (
            HIDDEN_AMOUNT_TEXT
          ) : (
            <>
              {sign ? (
                <Text
                  size="xl"
                  weight="semibold"
                  color={amountTone}
                  style={[styles.num, styles.amountAffix]}
                >
                  {sign}
                </Text>
              ) : null}
              <Text
                size="lg"
                weight="semibold"
                color={amountTone}
                style={[styles.num, styles.amountAffix]}
              >
                ¥
              </Text>
              <Text
                size="h2"
                weight="semibold"
                color={amountTone}
                style={[styles.num, styles.amountInteger]}
              >
                {amount.integer}
              </Text>
              <Text
                size="xl"
                weight="semibold"
                color={amountTone}
                style={[styles.num, styles.amountAffix]}
              >
                .{amount.decimal}
              </Text>
            </>
          )}
        </Text>
        <Column align="end">
          <Text size="xs" color="tertiary">
            {date.date}
          </Text>
          <Text size="xs" color="quaternary">
            {date.time} · {date.weekday}
          </Text>
        </Column>
      </Row>
    </Column>
  );
}

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  showDivider: boolean;
  isBlock?: boolean;
}

function InfoRow({
  label,
  children,
  showDivider,
  isBlock = false,
}: InfoRowProps) {
  const styles = useRecordDetailStyles();
  const labelNode = (
    <Text
      size="xs"
      color="tertiary"
      style={[styles.infoLabel, isBlock && styles.infoLabelBlock]}
    >
      {label}
    </Text>
  );
  const valueNode = (
    <Column style={styles.infoValue}>
      {children}
    </Column>
  );

  return (
    <Row
      align={isBlock ? 'start' : 'center'}
      style={[
        styles.infoRow,
        !showDivider && styles.infoRowFirst,
        isBlock && styles.infoRowBlock,
      ]}
    >
      {labelNode}
      {valueNode}
    </Row>
  );
}

function InfoCard({ view }: { view: DetailRecordView }) {
  const styles = useRecordDetailStyles();
  const isTransfer = view.category === RECORD_TYPE_CATEGORY.transfer;
  const rows: React.ReactNode[] = [];

  if (!isTransfer && view.assetName) {
    rows.push(
      <InfoRow key="account" label="账户" showDivider={rows.length > 0}>
        <Text size="sm" color="default">
          {view.assetName}
        </Text>
      </InfoRow>,
    );
  }

  if (view.imageCount > 0) {
    rows.push(
      <InfoRow
        key="image"
        label="图片"
        showDivider={rows.length > 0}
        isBlock
      >
        <RecordImages
          booksId={view.record.booksId}
          imageCount={view.imageCount}
          recordId={view.record.id}
        />
      </InfoRow>,
    );
  }

  if (view.tags.length > 0) {
    rows.push(
      <InfoRow key="tags" label="标签" showDivider={rows.length > 0}>
        <Row wrap style={styles.chips}>
          {view.tags.map(tag => {
            const TagIcon = tag.icon
              ? getPhosphorIconComponent(tag.icon)
              : null;

            return (
              <Row key={tag.id} align="center" style={styles.chip}>
                {TagIcon ? (
                  <Icon icon={TagIcon} size="small" color="tertiary" />
                ) : null}
                <Text size="xs" color="secondary">
                  {tag.name}
                </Text>
              </Row>
            );
          })}
        </Row>
      </InfoRow>,
    );
  }

  if (view.record.remark) {
    rows.push(
      <InfoRow
        key="remark"
        label="备注"
        showDivider={rows.length > 0}
        isBlock
      >
        <Text size="sm" color="default">
          {view.record.remark}
        </Text>
      </InfoRow>,
    );
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <Column style={styles.infoCard}>
      {rows}
    </Column>
  );
}

interface ComposeItem {
  label: string;
  value: string;
  isTotal?: boolean;
}

function ComposeRow({
  items,
  hidden,
}: {
  items: readonly ComposeItem[];
  hidden: boolean;
}) {
  const styles = useRecordDetailStyles();

  return (
    <Row style={styles.composeRow}>
      {items.map((item, index) => (
        <Column
          key={item.label}
          gap={0}
          style={[styles.composeItem, index > 0 && styles.composeItemDivider]}
        >
          <Text size="xs" color="tertiary" numberOfLines={1}>
            {item.label}
          </Text>
          <Text
            size="sm"
            weight={item.isTotal ? 'semibold' : 'medium'}
            color="heading"
            numberOfLines={1}
            style={styles.num}
          >
            {hidden ? HIDDEN_AMOUNT_TEXT : item.value}
          </Text>
        </Column>
      ))}
    </Row>
  );
}

function getComposeItems(
  view: DetailRecordView,
  isTransfer: boolean,
): ComposeItem[] {
  const isIncome = view.category === RECORD_TYPE_CATEGORY.income;
  const amountLabel = isTransfer
    ? '转账金额'
    : isIncome
      ? '收入金额'
      : '消费金额';
  const totalLabel = isTransfer
    ? '实际扣款'
    : isIncome
      ? '实际收入'
      : '实际支出';

  return [
    { label: amountLabel, value: formatCurrency(view.record.amount) },
    { label: '手续费', value: `+${formatCurrency(view.record.charge)}` },
    {
      label: totalLabel,
      value: formatCurrency(view.finalAmount),
      isTotal: true,
    },
  ];
}

function AmountComposition({
  view,
  hidden,
}: {
  view: DetailRecordView;
  hidden: boolean;
}) {
  const styles = useRecordDetailStyles();

  if (view.record.charge <= 0) {
    return null;
  }

  return (
    <Column style={styles.composeBar}>
      <ComposeRow items={getComposeItems(view, false)} hidden={hidden} />
    </Column>
  );
}

function RouteRow({
  label,
  name,
  isOutline,
}: {
  label: string;
  name: string;
  isOutline: boolean;
}) {
  const styles = useRecordDetailStyles();

  return (
    <Row align="center" style={styles.routeRow}>
      <View style={[styles.routeDot, isOutline && styles.routeDotOutline]} />
      <Text size="xs" color="tertiary">
        {label}
      </Text>
      <Text
        size="sm"
        weight="medium"
        color="heading"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.routeName}
      >
        {name}
      </Text>
    </Row>
  );
}

function TransferFlow({
  view,
  hidden,
}: {
  view: DetailRecordView;
  hidden: boolean;
}) {
  const styles = useRecordDetailStyles();
  const hasOut = Boolean(view.assetName);
  const hasIn = Boolean(view.intoAssetName);
  const hasCharge = view.record.charge > 0;

  if (!hasOut && !hasIn && !hasCharge) {
    return null;
  }

  return (
    <Column style={styles.flowCard}>
      {hasOut ? (
        <RouteRow label="转出" name={view.assetName} isOutline={false} />
      ) : null}
      {hasOut && hasIn ? <View style={styles.routeLink} /> : null}
      {hasIn ? (
        <RouteRow label="转入" name={view.intoAssetName} isOutline />
      ) : null}
      {hasCharge && (hasOut || hasIn) ? (
        <View style={styles.flowDivider} />
      ) : null}
      {hasCharge ? (
        <ComposeRow items={getComposeItems(view, true)} hidden={hidden} />
      ) : null}
    </Column>
  );
}

function RelatedExpenses({
  views,
  hidden,
}: {
  views: readonly DetailRecordView[];
  hidden: boolean;
}) {
  const styles = useRecordDetailStyles();
  const total = views.reduce((sum, view) => sum + view.finalAmount, 0);

  return (
    <Column style={styles.relatedBlock}>
      <Row align="baseline" justify="between" style={styles.relatedHead}>
        <Text size="xs" weight="medium" color="tertiary">
          关联支出
        </Text>
        <Text size="xs" color="tertiary" style={styles.num}>
          {views.length} 笔 ·{' '}
          {hidden ? HIDDEN_AMOUNT_TEXT : formatCurrency(total)}
        </Text>
      </Row>
      <Column style={styles.relatedList}>
        {views.map((related, index) => (
          <Row
            key={related.record.id}
            align="center"
            style={[
              styles.relatedRow,
              index === views.length - 1 && styles.relatedRowLast,
            ]}
          >
            <Row align="center" style={styles.relatedMain}>
              <Text
                size="sm"
                weight="medium"
                color="heading"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.relatedName}
              >
                {related.typeName}
              </Text>
              <Text size="xs" color="tertiary">
                {formatRecordDateParts(related.record.recordTime).date.slice(5)}
              </Text>
            </Row>
            <Text
              size="sm"
              weight="medium"
              color={hidden ? 'heading' : amountColor(related.category)}
              style={styles.num}
            >
              {hidden
                ? HIDDEN_AMOUNT_TEXT
                : formatSignedAmount(related.finalAmount, related.category)}
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}

function RecordMeta({ view }: { view: DetailRecordView }) {
  const styles = useRecordDetailStyles();

  return (
    <Column style={styles.metaWrap}>
      <Text size="xs" color="quaternary">
        创建于 {formatRecordTime(view.record.createdTime)} · 更新于{' '}
        {formatRecordTime(view.record.updatedTime)}
      </Text>
    </Column>
  );
}

export function RecordDetailContent({
  view,
  relatedViews,
  hidden,
}: {
  view: DetailRecordView;
  relatedViews: readonly DetailRecordView[];
  hidden: boolean;
}) {
  const isTransfer = view.category === RECORD_TYPE_CATEGORY.transfer;
  const isIncome = view.category === RECORD_TYPE_CATEGORY.income;

  return (
    <Column>
      <RecordHero view={view} hidden={hidden} />
      {isTransfer ? (
        <TransferFlow view={view} hidden={hidden} />
      ) : (
        <AmountComposition view={view} hidden={hidden} />
      )}
      <InfoCard view={view} />
      {isIncome && relatedViews.length > 0 ? (
        <RelatedExpenses views={relatedViews} hidden={hidden} />
      ) : null}
      <RecordMeta view={view} />
    </Column>
  );
}
