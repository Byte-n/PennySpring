import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import {
  Button,
  Column,
  Dialog,
  Empty,
  Loading,
  Row,
  Segmented,
  Text,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import { useBookStore, useGlobalApi } from '../../../stores/bookStore';
import { ROOT_ROUTES, useNavigation } from '../../../navigation';
import { useRecordSync } from '../recordSync';
import { MonthSummaryCard } from './detail/MonthSummaryCard';
import { DayGroupCard, DayGroupHeader } from './detail/DayGroupCard';
import { RecordDetailPanel } from './detail/RecordDetailPanel';
import {
  buildDailyExpenseBars,
  filterByMonth,
  groupByDay,
  summarizeCashflow,
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
  filterResult: {
    marginHorizontal: token.padding,
    padding: token.paddingXS,
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadiusSM,
  },
  state: {
    flexGrow: 1,
    paddingVertical: token.paddingLG,
  },
  filterRow: { paddingHorizontal: token.padding, paddingTop: token.paddingSM },
}));

export function DetailTabScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const toast = useToast();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const { version } = useRecordSync();
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [activeFilter, setActiveFilter] = useState<DetailFilter>('all');
  const [isAmountHidden, setIsAmountHidden] = useState(false);

  const bookId = currentBook?.id;
  const dataRange = useMemo(() => {
    const start = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() - 1,
      1,
    ).getTime();
    const end = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      1,
    ).getTime();
    return { startTime: start, endTime: end };
  }, [selectedMonth]);

  const {
    data: records = [],
    loading,
    refresh,
  } = useRequest(
    () =>
      bookId
        ? globalApi.record.getListByBook(bookId, dataRange)
        : Promise.resolve([]),
    { refreshDeps: [bookId, version, dataRange] },
  );
  const refreshAll = useCallback(() => refresh(), [refresh]);

  const { groups, summary, dailyExpenses, counts, monthViews } = useMemo(() => {
    const selectedMonthViews = filterByMonth(records, selectedMonth);
    const categories: DetailFilter[] = ['expense', 'income', 'transfer'];
    const categoryCounts = categories.reduce<Record<string, number>>(
      (result, category) => {
        result[category] = selectedMonthViews.filter(
          view => view.category === category,
        ).length;
        return result;
      },
      {},
    );
    const filteredViews =
      activeFilter === 'all'
        ? selectedMonthViews
        : selectedMonthViews.filter(view => view.category === activeFilter);
    return {
      groups: groupByDay(filteredViews),
      summary: summarizeCashflow(selectedMonthViews),
      dailyExpenses: buildDailyExpenseBars(selectedMonthViews, selectedMonth),
      counts: categoryCounts,
      monthViews: selectedMonthViews,
    };
  }, [records, selectedMonth, activeFilter]);

  const moveMonth = (offset: number) => {
    setSelectedMonth(
      current =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
    setActiveFilter('all');
  };

  const closePanel = () => setActiveRecordId(null);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll]),
  );

  const handleEdit = (recordId: number) => {
    closePanel();
    navigation.navigate(ROOT_ROUTES.AddRecord, { recordId });
  };

  const confirmDelete = async () => {
    const recordId = pendingDeleteId;
    setPendingDeleteId(null);
    if (!recordId) return;

    try {
      if (!currentBook) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }

      await globalApi.record.delete(recordId, currentBook.id);
      closePanel();
      refreshAll();
      toast.show({ messageText: '已删除记录' });
    } catch {
      toast.show({ messageText: '删除失败，请稍后重试', status: 'error' });
    }
  };

  const renderBody = () => {
    if (loading) {
      return <Loading variant="block" text="加载中" style={styles.state} />;
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
          action={
            <Button
              type="text"
              size="small"
              onPress={() => setActiveFilter('all')}
            >
              清除筛选
            </Button>
          }
          style={styles.state}
        />
      );
    }
    // 日期头与卡片必须是 ScrollView 的同级子节点，stickyHeaderIndices 才能按 child 索引命中。
    return groups.flatMap(group => [
      <DayGroupHeader key={`header-${group.dayStart}`} group={group} />,
      <DayGroupCard
        key={`card-${group.dayStart}`}
        group={group}
        onPressRecord={setActiveRecordId}
      />,
    ]);
  };

  return (
    <Column style={styles.container}>
      <Row align="center" style={styles.monthBar}>
        <Button
          type="text"
          size="small"
          icon="caret-left"
          onPress={() => moveMonth(-1)}
        />
        <Button
          type="text"
          size="small"
          icon="caret-down"
          style={styles.monthLabel}
          onPress={() => setSelectedMonth(new Date())}
        >
          {selectedMonth.formatDateBy('YYYY年M月')}
        </Button>
        <Button
          type="text"
          size="small"
          icon="caret-right"
          onPress={() => moveMonth(1)}
        />
        <Button
          type="text"
          size="small"
          shape="round"
          onPress={() => {
            setSelectedMonth(new Date());
            setActiveFilter('all');
          }}
        >
          今天
        </Button>
      </Row>
      <ScrollView
        scrollEnabled
        contentContainerStyle={styles.content}
        stickyHeaderIndices={groups.map(
          (_, index) => 2 + (activeFilter === 'all' ? 0 : 1) + index * 2,
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshAll} />
        }
      >
        <MonthSummaryCard
          month={selectedMonth}
          summary={summary}
          dailyExpenses={dailyExpenses}
          recordCount={monthViews.length}
          hidden={isAmountHidden}
          onToggleHidden={() => setIsAmountHidden(value => !value)}
          records={records}
        />
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
            <Text size="sm" color="tertiary">
              当前筛选
            </Text>
            <Text size="sm" color="heading">
              {activeFilter === 'expense'
                ? '支出'
                : activeFilter === 'income'
                  ? '收入'
                  : '转账'}{' '}
              · {groups.reduce((sum, group) => sum + group.records.length, 0)}{' '}
              笔
            </Text>
          </Row>
        ) : null}
        {renderBody()}
      </ScrollView>

      <RecordDetailPanel
        recordId={activeRecordId}
        hidden={isAmountHidden}
        open={activeRecordId !== null}
        onOpenChange={open => {
          if (!open) closePanel();
        }}
        onEdit={handleEdit}
        onDelete={setPendingDeleteId}
      />

      <Dialog
        open={pendingDeleteId !== null}
        titleText="删除记录"
        okText="删除"
        cancelText="取消"
        okDanger
        onOk={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      >
        <Text size="md" color="secondary">
          删除后无法恢复，这条记录的图片与标签关联也会一并移除。
        </Text>
      </Dialog>
    </Column>
  );
}
