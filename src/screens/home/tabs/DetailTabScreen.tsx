import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import { Button, Column, Dialog, Empty, Loading, Row, Segmented, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { type AssetRow, type TypeRow, type TagRow } from '@pennyspring/api';
import { useBookStore, useGlobalApi } from '../../../stores/bookStore';
import { ROOT_ROUTES, useNavigation } from '../../../navigation';
import { useRecordSync } from '../recordSync';
import { MonthSummaryCard } from './detail/MonthSummaryCard';
import { DayGroupCard } from './detail/DayGroupCard';
import { RecordDetailPanel } from './detail/RecordDetailPanel';
import {
  buildDetailViews,
  buildDailyExpenseBars,
  filterByMonth,
  groupByDay,
  summarizeCashflow,
  type DetailRecordView,
} from './detail/detailData';

type DetailFilter = 'all' | 'expense' | 'income' | 'transfer';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  content: {
    flexGrow: 1,
    paddingBottom: token.paddingLG,
    gap: token.paddingSM,
  },
  monthBar: {
    paddingHorizontal: token.paddingSM,
    paddingTop: token.paddingXS,
  },
  monthLabel: { minWidth: token.controlHeightLG, alignItems: 'center' },
  filterResult: { marginHorizontal: token.padding, padding: token.paddingXS, backgroundColor: token.colorFillQuaternary, borderRadius: token.borderRadiusSM },
  state: {
    flexGrow: 1,
    paddingVertical: token.paddingLG,
  },
  filterRow: { paddingHorizontal: token.padding, paddingTop: token.paddingSM },
}));

function toMap<T extends { id: number }>(rows: readonly T[]): Map<number, T> {
  return new Map(rows.map(row => [row.id, row]));
}

export function DetailTabScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const { version } = useRecordSync();
  const [activeView, setActiveView] = useState<DetailRecordView | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DetailRecordView | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [activeFilter, setActiveFilter] = useState<DetailFilter>('all');
  const [isAmountHidden, setIsAmountHidden] = useState(false);

  const bookId = currentBook?.id;

  const { data: records = [], loading, refresh } = useRequest(
    () => (bookId ? globalApi.record.getByBook(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId, version] },
  );
  const { data: types = [] } = useRequest<TypeRow[], []>(
    () => (bookId ? globalApi.type.getAll(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId] },
  );
  const { data: assets = [] } = useRequest<AssetRow[], []>(
    () => (bookId ? globalApi.asset.getByBook(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId] },
  );
  const { data: tags = [] } = useRequest<TagRow[], []>(
    () => (bookId ? globalApi.tag.getAll(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId] },
  );
  const { data: imageCountMap = new Map<number, number>() } = useRequest(
    async () => {
      if (!bookId) return new Map();
      const counts = await globalApi.record.getImageCounts(bookId);
      return new Map(counts.map((item: { recordId: number; count: number }) => [item.recordId, item.count]));
    },
    { refreshDeps: [bookId] },
  );
  const { data: recordTagsMap = new Map<number, number[]>() } = useRequest(
    async () => {
      if (!bookId) return new Map();
      const recordTags = await globalApi.record.getRecordTags(bookId);
      const map = new Map<number, number[]>();
      for (const { recordId, tagId } of recordTags) {
        const tagIds = map.get(recordId) ?? [];
        tagIds.push(tagId);
        map.set(recordId, tagIds);
      }
      return map;
    },
    { refreshDeps: [bookId] },
  );

  const { groups, summary, dailyExpenses, counts, monthViews, allViews } = useMemo(() => {
    const typeMap = toMap(types);
    const assetMap = toMap(assets);
    const tagMap = toMap(tags);
    const views = buildDetailViews(records, typeMap, assetMap, imageCountMap, tagMap, recordTagsMap);
    const selectedMonthViews = filterByMonth(views, selectedMonth);
    const categories: DetailFilter[] = ['expense', 'income', 'transfer'];
    const categoryCounts = categories.reduce<Record<string, number>>((result, category) => {
      result[category] = selectedMonthViews.filter(view => view.category === category).length;
      return result;
    }, {});
    const filteredViews = activeFilter === 'all'
      ? selectedMonthViews
      : selectedMonthViews.filter(view => view.category === activeFilter);
    return {
      groups: groupByDay(filteredViews),
      summary: summarizeCashflow(selectedMonthViews),
      dailyExpenses: buildDailyExpenseBars(selectedMonthViews, selectedMonth),
      counts: categoryCounts,
      monthViews: selectedMonthViews,
      allViews: views,
    };
  }, [records, types, assets, tags, imageCountMap, recordTagsMap, selectedMonth, activeFilter]);

  const moveMonth = (offset: number) => {
    setSelectedMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    setActiveFilter('all');
  };

  const closePanel = () => setActiveView(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleEdit = (view: DetailRecordView) => {
    closePanel();
    navigation.navigate(ROOT_ROUTES.AddRecord, { recordId: view.record.id });
  };

  const confirmDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;
    if (!currentBook) return;
    await globalApi.record.delete(target.record.id, currentBook.id);
    closePanel();
    refresh();
  };

  const renderBody = () => {
    if (loading) {
      return <Loading vertical text="加载中" style={styles.state} />;
    }
    if (groups.length === 0) {
      return activeFilter === 'all' ? (
        <Empty
          titleText="本月还没有记录"
          descriptionText="点右下角 + 记一笔，或切换月份查看历史。"
          style={styles.state}
        />
      ) : (
        <Empty
          titleText="当前筛选下没有记录"
          descriptionText="换个分类或时间范围试试。"
          action={<Button type="text" size="small" onPress={() => setActiveFilter('all')}>清除筛选</Button>}
          style={styles.state}
        />
      );
    }
    return groups.map(group => (
      <DayGroupCard
        key={group.dayStart}
        group={group}
        onPressRecord={setActiveView}
      />
    ));
  };

  return (
    <Column style={styles.container}>
      <Row align="center" style={styles.monthBar}>
        <Button type="text" size="small" icon="caret-left" onPress={() => moveMonth(-1)} />
        <Button
          type="text"
          size="small"
          icon="caret-down"
          style={styles.monthLabel}
          onPress={() => setSelectedMonth(new Date())}
        >
          {selectedMonth.formatDateBy('YYYY年M月')}
        </Button>
        <Button type="text" size="small" icon="caret-right" onPress={() => moveMonth(1)} />
        <Button type="text" size="small" shape="round" onPress={() => { setSelectedMonth(new Date()); setActiveFilter('all'); }}>今天</Button>
      </Row>
      <ScrollView
          contentContainerStyle={styles.content}
          stickyHeaderIndices={groups.flatMap((_, index) => [2 + (activeFilter === 'all' ? 0 : 1) + index * 2])}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        >
        <MonthSummaryCard month={selectedMonth} summary={summary} dailyExpenses={dailyExpenses} recordCount={monthViews.length} hidden={isAmountHidden} onToggleHidden={() => setIsAmountHidden(value => !value)} records={allViews} />
        <Segmented
          block
          size="small"
          style={styles.filterRow}
          value={activeFilter}
          onChange={value => setActiveFilter(value as DetailFilter)}
          options={[
            { value: 'all', labelText: `全部 ${monthViews.length}` },
            { value: 'expense', labelText: `支出 ${counts.expense}` },
            { value: 'income', labelText: `收入 ${counts.income}` },
            { value: 'transfer', labelText: `转账 ${counts.transfer}` },
          ]}
        />
        {activeFilter !== 'all' ? (
          <Row style={styles.filterResult}>
            <Text size="sm" color="tertiary">当前筛选</Text>
            <Text size="sm" color="heading">{activeFilter === 'expense' ? '支出' : activeFilter === 'income' ? '收入' : '转账'} · {groups.reduce((sum, group) => sum + group.records.length, 0)} 笔</Text>
          </Row>
        ) : null}
        {renderBody()}
      </ScrollView>

      <RecordDetailPanel
        view={activeView}
        open={activeView !== null}
        onOpenChange={open => {
          if (!open) closePanel();
        }}
        onEdit={handleEdit}
        onDelete={setPendingDelete}
      />

      <Dialog open={pendingDelete !== null} titleText="删除记录" okText="删除" cancelText="取消" onOk={confirmDelete} onCancel={() => setPendingDelete(null)}>
        <Text size="md" color="secondary">确定删除这条记录吗？删除后无法恢复。</Text>
      </Dialog>
    </Column>
  );
}
