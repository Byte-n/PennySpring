import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import { Column, Loading, Empty, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  RECORD_TYPE_CATEGORY,
  type TypeRow,
} from '@pennyspring/api';
import { useBookStore, useGlobalApi } from '../../../stores/bookStore';
import { MonthSummaryCard } from './detail/MonthSummaryCard';
import {
  filterByMonth,
  summarizeCashflow,
  type CashflowItem,
} from './detail/detailData';
import { aggregateExpenseStats } from './chart/chartData';
import { ExpenseAnalysisSection } from './chart/ExpenseAnalysisSection';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  content: {
    flexGrow: 1,
    padding: token.padding,
    gap: token.margin,
  },
  state: {
    flexGrow: 1,
    paddingVertical: token.paddingLG,
  },
}));

export function ChartTabScreen() {
  const styles = useStyles();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const [selectedParentTypeId, setSelectedParentTypeId] = useState<number | null>(
    null,
  );

  const bookId = currentBook?.id;

  const { data: records = [], loading, refresh } = useRequest(
    () => (bookId ? globalApi.record.getByBook(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId] },
  );
  const { data: types = [] } = useRequest<TypeRow[], []>(
    () => (bookId ? globalApi.type.getAll(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId] },
  );

  const now = useMemo(() => new Date(), []);
  const monthLabel = useMemo(
    () => now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
    [now],
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const summary = useMemo(() => {
    const typeMap = new Map(types.map(type => [type.id, type]));
    const items: CashflowItem[] = records.map(record => ({
      recordTime: record.recordTime,
      finalAmount: record.finalAmount,
      category:
        typeMap.get(record.typeId)?.typeCategory ?? RECORD_TYPE_CATEGORY.expense,
    }));
    return summarizeCashflow(filterByMonth(items, now));
  }, [records, types, now]);

  const analysis = useMemo(
    () => aggregateExpenseStats(records, types, selectedParentTypeId, now),
    [records, types, selectedParentTypeId, now],
  );

  if (loading) {
    return (
      <Column style={styles.container}>
        <Loading vertical text="加载中" style={styles.state} />
      </Column>
    );
  }

  if (!currentBook) {
    return (
      <Column style={styles.container}>
        <Empty messageText="暂无账本数据" style={styles.state} />
      </Column>
    );
  }

  return (
    <Column style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <Text size="sm" color="secondary">
          时间范围：本月
        </Text>
        <MonthSummaryCard monthLabel={monthLabel} summary={summary} />
        <ExpenseAnalysisSection
          analysis={analysis}
          selectedParentTypeId={selectedParentTypeId}
          onEnter={setSelectedParentTypeId}
          onBack={() => setSelectedParentTypeId(null)}
        />
      </ScrollView>
    </Column>
  );
}
