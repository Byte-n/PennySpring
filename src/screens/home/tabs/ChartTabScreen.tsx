import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import { Card, Column, Empty, Loading, Segmented } from '@pennyspring/ui';
import type { SegmentedValue } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import type {
  AssetRow,
  RecordRelationRow,
  RecordRow,
  TagRow,
  TypeRow,
} from '@pennyspring/api';

import { LoadErrorEmpty } from '../../../components/LoadErrorEmpty';
import { ROOT_ROUTES, useNavigation } from '../../../navigation';
import {
  useBookKey,
  useCurrentBookId,
  useGlobalApi,
} from '../../../stores/bookStore';
import { useRecordVersion } from '../../../stores/syncVersionStore';
import {
  createMonthPeriod,
  shiftMonth,
  summarizeMonth,
} from './chart/analysisData';
import { PeriodBar } from './chart/PeriodBar';
import { AssetsView } from './chart/AssetsView';
import { ExpenseView } from './chart/ExpenseView';
import { IncomeView } from './chart/IncomeView';
import { OverviewView } from './chart/OverviewView';

type ChartViewKey = 'overview' | 'expense' | 'income' | 'assets';

const VIEW_OPTIONS = [
  { value: 'overview', labelText: '概览' },
  { value: 'expense', labelText: '支出' },
  { value: 'income', labelText: '收入' },
  { value: 'assets', labelText: '资产' },
];

type RecordRelation = Pick<RecordRelationRow, 'recordId' | 'relatedRecordId'>;
const EMPTY_RELATIONS: readonly RecordRelation[] = [];
const EMPTY_RECORD_TAGS: ReadonlyMap<number, readonly number[]> = new Map();
const NOW_REFRESH_INTERVAL_MS = 60 * 1000;

function isChartView(value: SegmentedValue): value is ChartViewKey {
  return (
    value === 'overview' ||
    value === 'expense' ||
    value === 'income' ||
    value === 'assets'
  );
}

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  controls: {
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: token.padding,
    paddingTop: token.paddingXS,
    paddingBottom: token.paddingLG,
  },
  state: {
    paddingVertical: token.paddingLG,
  },
}));

export function ChartTabScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const globalApi = useGlobalApi();
  const bookKey = useBookKey();
  const bookId = useCurrentBookId();
  const recordVersion = useRecordVersion();
  const scrollRef = useRef<ScrollView>(null);
  const [now, setNow] = useState(() => new Date());
  const [anchor, setAnchor] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [view, setView] = useState<ChartViewKey>('overview');
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [selectedParentTypeId, setSelectedParentTypeId] = useState<
    number | null
  >(null);

  const dataRange = useMemo(() => {
    const rangeAnchor = view === 'assets' ? now : anchor;
    const start = new Date(
      rangeAnchor.getFullYear(),
      rangeAnchor.getMonth() - 5,
      1,
    ).getTime();
    const end = new Date(
      rangeAnchor.getFullYear(),
      rangeAnchor.getMonth() + 1,
      1,
    ).getTime();
    return { startTime: start, endTime: end };
  }, [anchor, now, view]);

  const {
    data: records = [],
    error: recordsError,
    loading: recordsLoading,
    refresh: refreshRecords,
  } = useRequest<RecordRow[], []>(
    () =>
      bookId
        ? globalApi.record.getByBook(bookId, dataRange)
        : Promise.resolve([]),
    { refreshDeps: [bookKey, recordVersion, dataRange] },
  );
  const {
    data: types = [],
    loading: typesLoading,
    refresh: refreshTypes,
  } = useRequest<TypeRow[], []>(
    () =>
      bookId ? globalApi.type.getAll(bookId, dataRange) : Promise.resolve([]),
    { refreshDeps: [bookKey, recordVersion, dataRange] },
  );
  const {
    data: assets = [],
    loading: assetsLoading,
    refresh: refreshAssets,
  } = useRequest<AssetRow[], []>(
    () => (bookId ? globalApi.asset.getByBook(bookId) : Promise.resolve([])),
    { refreshDeps: [bookKey, recordVersion] },
  );
  const {
    data: tags = [],
    loading: tagsLoading,
    refresh: refreshTags,
  } = useRequest<TagRow[], []>(
    () =>
      bookId ? globalApi.tag.getAll(bookId, dataRange) : Promise.resolve([]),
    { refreshDeps: [bookKey, recordVersion, dataRange] },
  );
  const {
    data: recordRelations = EMPTY_RELATIONS,
    loading: recordRelationsLoading = false,
    refresh: refreshRecordRelations,
  } = useRequest<RecordRelation[], []>(
    () =>
      bookId
        ? globalApi.record.getRelationsByBook(bookId, dataRange)
        : Promise.resolve([]),
    { refreshDeps: [bookKey, recordVersion, dataRange] },
  );
  const {
    data: recordTags = EMPTY_RECORD_TAGS,
    loading: recordTagsLoading,
    refresh: refreshRecordTags,
  } = useRequest<ReadonlyMap<number, readonly number[]>, []>(
    async () => {
      if (!bookId) return EMPTY_RECORD_TAGS;
      const rows = await globalApi.record.getRecordTags(bookId, dataRange);
      const map = new Map<number, number[]>();
      for (const row of rows) {
        const tagIds = map.get(row.recordId) ?? [];
        tagIds.push(row.tagId);
        map.set(row.recordId, tagIds);
      }
      return map;
    },
    { refreshDeps: [bookKey, recordVersion, dataRange] },
  );

  const isLoading =
    recordsLoading ||
    typesLoading ||
    assetsLoading ||
    tagsLoading ||
    recordTagsLoading ||
    recordRelationsLoading;
  const period = useMemo(() => createMonthPeriod(anchor, now), [anchor, now]);

  const currentMonthStart = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
    [now],
  );
  const canGoNext = shiftMonth(anchor, 1).getTime() <= currentMonthStart;
  const periodSummary = useMemo(
    () => summarizeMonth(records, types, period),
    [records, types, period],
  );
  const hasCashflow = periodSummary.expense > 0 || periodSummary.income > 0;

  const refreshAll = useCallback(() => {
    refreshRecords();
    refreshTypes();
    refreshAssets();
    refreshTags();
    refreshRecordTags();
    refreshRecordRelations();
  }, [
    refreshRecords,
    refreshTypes,
    refreshAssets,
    refreshTags,
    refreshRecordTags,
    refreshRecordRelations,
  ]);

  const refreshAllRef = useRef(refreshAll);
  refreshAllRef.current = refreshAll;

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const updatePeriod = useCallback(
    (nextAnchor: Date) => {
      setAnchor(nextAnchor);
      setSelectedParentTypeId(null);
      scrollToTop();
    },
    [scrollToTop],
  );

  useFocusEffect(
    useCallback(() => {
      setNow(previous =>
        Date.now() - previous.getTime() > NOW_REFRESH_INTERVAL_MS
          ? new Date()
          : previous,
      );
      refreshAllRef.current();
    }, []),
  );

  // 类型筛选属于具体账本，切换后回到总览，避免旧账本的分类 id 命中新账本。
  useEffect(() => {
    setSelectedParentTypeId(null);
  }, [bookKey]);

  const handlePrevious = useCallback(() => {
    updatePeriod(shiftMonth(anchor, -1));
  }, [anchor, updatePeriod]);

  const handleNext = useCallback(() => {
    if (!canGoNext) return;
    updatePeriod(shiftMonth(anchor, 1));
  }, [canGoNext, anchor, updatePeriod]);

  const handleViewChange = useCallback(
    (value: SegmentedValue) => {
      if (!isChartView(value)) return;
      setView(value);
      setSelectedParentTypeId(null);
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleOpenExpense = useCallback(() => {
    setView('expense');
    setSelectedParentTypeId(null);
    scrollToTop();
  }, [scrollToTop]);

  const handleOpenAssets = useCallback(() => {
    navigation.navigate(ROOT_ROUTES.AssetManage);
  }, [navigation]);

  const handleEnterParent = useCallback(
    (typeId: number) => {
      setSelectedParentTypeId(typeId);
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleBackParent = useCallback(() => {
    setSelectedParentTypeId(null);
  }, []);

  const handleToggleCompare = useCallback(() => {
    setCompareEnabled(previous => !previous);
  }, []);

  const renderContent = () => {
    if (bookId === null) {
      return (
        <Column style={styles.state}>
          <Empty
            titleText="还没有账本"
            descriptionText="在账本管理里新建或导入一个账本，图表会自动生成。"
          />
        </Column>
      );
    }
    if (isLoading && records.length === 0) {
      return <Loading variant="block" text="加载中" style={styles.state} />;
    }
    if (recordsError && records.length === 0) {
      return (
        <LoadErrorEmpty
          descriptionText="请检查网络或稍后重试。"
          onRetry={refreshRecords}
          style={styles.state}
          titleText="图表数据加载失败"
        />
      );
    }
    if (view !== 'assets' && !hasCashflow) {
      return (
        <Card>
          <Column gap="normal" align="center">
            <Empty
              titleText="本月还没有记录"
              descriptionText="点击右下角 + 记一笔，报表会自动生成。"
            />
          </Column>
        </Card>
      );
    }
    if (view === 'expense') {
      return (
        <ExpenseView
          key={`expense-${period.start}`}
          records={records}
          types={types}
          assets={assets}
          tags={tags}
          recordTags={recordTags}
          recordRelations={recordRelations}
          period={period}
          compareEnabled={compareEnabled}
          selectedParentTypeId={selectedParentTypeId}
          onEnterParent={handleEnterParent}
          onBackParent={handleBackParent}
        />
      );
    }
    if (view === 'income') {
      return (
        <IncomeView
          records={records}
          types={types}
          period={period}
          compareEnabled={compareEnabled}
          now={now}
        />
      );
    }
    if (view === 'assets') {
      return (
        <AssetsView
          assets={assets}
          records={records}
          types={types}
          compareEnabled={compareEnabled}
          now={now}
          onOpenAssets={handleOpenAssets}
        />
      );
    }
    return (
      <OverviewView
        key={`overview-${period.start}-${period.elapsedDays}`}
        records={records}
        types={types}
        period={period}
        compareEnabled={compareEnabled}
        now={now}
        onOpenExpense={handleOpenExpense}
      />
    );
  };

  return (
    <Column style={styles.container}>
      <Column style={styles.controls} gap="small">
        {view !== 'assets' ? (
          <PeriodBar
            label={period.label}
            compareLabel={period.compareLabel}
            compareEnabled={compareEnabled}
            canGoPrevious
            canGoNext={canGoNext}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToggleCompare={handleToggleCompare}
          />
        ) : null}
        <Segmented
          block
          size="small"
          options={VIEW_OPTIONS}
          value={view}
          onChange={handleViewChange}
        />
      </Column>
      <ScrollView
        scrollEnabled
        ref={scrollRef}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshAll} />
        }
      >
        {renderContent()}
      </ScrollView>
    </Column>
  );
}
