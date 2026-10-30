import React, { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { Column, Empty, Icon, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { AssetRow, RecordRelationRow, RecordRow, TagRow, TypeRow } from '@pennyspring/api';

import { aggregateExpenseStatsForRange } from './chartData';
import {
  buildAssetStats,
  buildMovers,
  buildReimbursementSummary,
  buildTagStats,
  buildTopExpenses,
  foldForDonut,
  formatPercent,
  formatSignedMoney,
  getPeriodCutoff,
  getPreviousRange,
} from './analysisData';
import type { ChartPeriod } from './analysisData';
import { categoryColorAt } from './chartPalette';
import { ChartCard } from './components/chart/ChartCard';
import { DonutChart } from './components/chart/DonutChart';
import { MoverList } from './components/MoverList';
import { RankList } from './components/RankList';
import type { RankItem } from './components/RankList';
import { ReimbursementCard } from './components/ReimbursementCard';
import { TopExpenseList } from './components/TopExpenseList';

type ExpenseDimension = 'category' | 'tag' | 'asset';

const DONUT_LIMIT = 6;
const MOVER_LIMIT = 4;
const TOP_LIMIT = 3;
const DIMENSION_OPTIONS: Array<{ value: ExpenseDimension; label: string }> = [
  { value: 'category', label: '分类' },
  { value: 'tag', label: '标签' },
  { value: 'asset', label: '账户' },
];
const VIRTUAL_KEYS = new Set(['uncategorized', 'untagged', 'unassigned', 'other']);

interface ExpenseViewProps {
  records: readonly RecordRow[];
  types: readonly TypeRow[];
  assets: readonly AssetRow[];
  tags: readonly TagRow[];
  recordTags: ReadonlyMap<number, readonly number[]>;
  recordRelations: readonly Pick<RecordRelationRow, 'recordId' | 'relatedRecordId'>[];
  period: ChartPeriod;
  compareEnabled: boolean;
  selectedParentTypeId: number | null;
  onEnterParent: (typeId: number) => void;
  onBackParent: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  crumb: {
    marginBottom: token.marginXS,
  },
  crumbButton: {
    paddingVertical: token.paddingXXS,
  },
  footer: {
    marginTop: token.marginXS,
  },
}));

const usePillStyles = createUseSheetStyle(
  (token, { active }: { active: boolean }) => ({
    pill: {
      height: token.controlHeightSM,
      paddingHorizontal: token.paddingSM,
      borderRadius: token.borderRadiusSM,
      borderWidth: token.lineWidth,
      borderColor: active ? token.colorPrimaryBorder : 'transparent',
      backgroundColor: active ? token.colorPrimaryBg : token.colorFillTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function Pill({ label, active, onPress }: PillProps) {
  const styles = usePillStyles({ active });
  return (
    <Pressable onPress={onPress} style={styles.pill}>
      <Text
        size="xs"
        weight="medium"
        color={active ? 'primary' : 'secondary'}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ExpenseView({
  records,
  types,
  assets,
  tags,
  recordTags,
  recordRelations,
  period,
  compareEnabled,
  selectedParentTypeId,
  onEnterParent,
  onBackParent,
}: ExpenseViewProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const [dimension, setDimension] = useState<ExpenseDimension>('category');
  const cutoff = getPeriodCutoff(period);

  const analysis = useMemo(
    () =>
      aggregateExpenseStatsForRange(
        records,
        types,
        selectedParentTypeId,
        period.start,
        cutoff,
      ),
    [records, types, selectedParentTypeId, period.start, cutoff],
  );
  const levelOneAnalysis = useMemo(
    () => aggregateExpenseStatsForRange(records, types, null, period.start, cutoff),
    [records, types, period.start, cutoff],
  );
  const previousAnalysis = useMemo(() => {
    const range = getPreviousRange(period);
    return aggregateExpenseStatsForRange(
      records,
      types,
      null,
      range.start,
      range.end,
    );
  }, [records, types, period]);
  const tagStats = useMemo(
    () => buildTagStats(records, types, period, new Map(tags.map(tag => [tag.id, tag])), recordTags),
    [records, types, period, tags, recordTags],
  );
  const assetStats = useMemo(
    () => buildAssetStats(records, types, period, new Map(assets.map(asset => [asset.id, asset]))),
    [records, types, period, assets],
  );

  const displayStats =
    dimension === 'category' ? analysis.stats : dimension === 'tag' ? tagStats : assetStats;
  const total = displayStats.reduce((sum, item) => sum + item.amount, 0);
  const count = displayStats.reduce((sum, item) => sum + item.count, 0);
  const allMovers = useMemo(
    () =>
      buildMovers(
        levelOneAnalysis.stats,
        previousAnalysis.stats,
        levelOneAnalysis.stats.length + previousAnalysis.stats.length,
      ),
    [levelOneAnalysis.stats, previousAnalysis.stats],
  );
  const deltaMap = useMemo(
    () => new Map(allMovers.map(mover => [mover.key, mover.delta])),
    [allMovers],
  );
  const topMovers = useMemo(
    () => buildMovers(levelOneAnalysis.stats, previousAnalysis.stats, MOVER_LIMIT),
    [levelOneAnalysis.stats, previousAnalysis.stats],
  );
  const topExpenses = useMemo(
    () => buildTopExpenses(records, types, assets, period, TOP_LIMIT),
    [records, types, assets, period],
  );
  const reimbursement = useMemo(
    () => buildReimbursementSummary(records, types, period, recordRelations),
    [records, types, period, recordRelations],
  );
  const parentIdsWithChildren = useMemo(
    () =>
      new Set(
        types
          .filter(type => type.parentId > 0)
          .map(type => type.parentId),
      ),
    [types],
  );

  const donutStats = foldForDonut(displayStats, DONUT_LIMIT);
  const donutSlices = donutStats.map((item, index) => ({
    key: item.key,
    name: item.name,
    value: item.amount,
    color: VIRTUAL_KEYS.has(item.key)
      ? token.colorTextTertiary
      : categoryColorAt(index, token),
  }));
  const rankItems: RankItem[] =
    dimension === 'category'
      ? analysis.stats.map((item, index) => ({
          key: item.key,
          name: item.name,
          amount: item.amount,
          percent: item.percent,
          count: item.count,
          delta:
            selectedParentTypeId === null
              ? deltaMap.get(item.key) ?? null
              : null,
          color: VIRTUAL_KEYS.has(item.key)
            ? token.colorTextTertiary
            : categoryColorAt(index, token),
          drillable:
            selectedParentTypeId === null &&
            item.typeId !== null &&
            parentIdsWithChildren.has(item.typeId) &&
            !item.virtual,
        }))
      : displayStats.map((item, index) => ({
          key: item.key,
          name: item.name,
          amount: item.amount,
          percent: item.percent,
          count: item.count,
          delta: null,
          color: VIRTUAL_KEYS.has(item.key)
            ? token.colorTextTertiary
            : categoryColorAt(index, token),
          drillable: false,
        }));
  const showDelta = dimension === 'category' && selectedParentTypeId === null;
  const isDrilled = selectedParentTypeId !== null;
  const subtitle = isDrilled
    ? `占本月支出 ${formatPercent(
        analysis.totalExpense === 0 ? 0 : total / analysis.totalExpense,
      )}`
    : dimension === 'tag'
      ? tags.length > 0
        ? '按标签归集 · 多标签记录只计一次'
        : '账本还没有标签'
      : dimension === 'asset'
        ? '按支付账户归集'
        : `${displayStats.length} 个分类 · 点击分类下钻`;
  const totalDelta = levelOneAnalysis.totalExpense - previousAnalysis.totalExpense;

  function handleDimension(next: ExpenseDimension) {
    setDimension(next);
    if (next !== 'category') onBackParent();
  }

  if (total === 0) {
    return (
      <Column gap="normal">
        <Row gap="small" >
          {DIMENSION_OPTIONS.map(option => (
            <Pill
              key={option.value}
              label={option.label}
              active={dimension === option.value}
              onPress={() => handleDimension(option.value)}
            />
          ))}
        </Row>
        <ChartCard title="支出构成" subtitle={subtitle}>
          <Empty size="small" descriptionText="本月暂无支出" />
        </ChartCard>
      </Column>
    );
  }

  return (
    <Column gap="normal">
      <Row gap="small" >
        {DIMENSION_OPTIONS.map(option => (
          <Pill
            key={option.value}
            label={option.label}
            active={dimension === option.value}
            onPress={() => handleDimension(option.value)}
          />
        ))}
      </Row>

      <ChartCard title="支出构成" subtitle={subtitle}>
        {isDrilled ? (
          <Row style={styles.crumb} gap={token.marginXXS} align="center">
            <Pressable onPress={onBackParent} style={styles.crumbButton}>
              <Text size="xs" color="primary">
                全部支出
              </Text>
            </Pressable>
            <Icon icon="caret-right" size="small" color="tertiary" />
            <Text size="xs" weight="medium">
              {analysis.selectedName}
            </Text>
          </Row>
        ) : null}
        <DonutChart
          slices={donutSlices}
        />
        <RankList
          items={rankItems}
          nameHeader={
            dimension === 'tag' ? '标签' : dimension === 'asset' ? '账户' : '分类'
          }
          showDelta={showDelta}
          showCount
          showHeader
          onPressItem={key => {
            if (!showDelta) return;
            const typeId = Number(key);
            if (Number.isNaN(typeId)) return;
            onEnterParent(typeId);
          }}
        />
        <Row justify="center" style={styles.footer} align="center">
          <Text size="xs" color="tertiary">
            共 {count} 笔支出
          </Text>
        </Row>
      </ChartCard>

      {showDelta && compareEnabled && topMovers.length > 0 ? (
        <ChartCard
          title="较上月同期 · 变化 Top"
          subtitle="红色变多，绿色变少"
          extra={
            <Text size="xs" color="tertiary">
              全部 {formatSignedMoney(totalDelta)}
            </Text>
          }
        >
          <MoverList movers={topMovers} />
        </ChartCard>
      ) : null}

      {topExpenses.length > 0 ? (
        <ChartCard title="单笔 Top 3" subtitle="解释本月的高点从哪里来">
          <TopExpenseList items={topExpenses} />
        </ChartCard>
      ) : null}

      {reimbursement ? (
        <ChartCard
          title="报销与退款"
          subtitle="避免把可报销支出当成最终负担"
        >
          <ReimbursementCard summary={reimbursement} />
        </ChartCard>
      ) : null}
    </Column>
  );
}
