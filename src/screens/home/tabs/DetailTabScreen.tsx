import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import { Column, Loading, Empty, Dialog, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { type AssetRow, type TypeRow, type TagRow } from '@pennyspring/api';
import { useBookStore, useGlobalApi } from '../../../stores/bookStore';
import { ROOT_ROUTES, useNavigation } from '../../../navigation';
import { MonthSummaryCard } from './detail/MonthSummaryCard';
import { DayGroupCard } from './detail/DayGroupCard';
import { RecordDetailPanel } from './detail/RecordDetailPanel';
import { QuickEntryBar } from '../../quickTemplate/QuickEntryBar';
import {
  buildDetailViews,
  filterByMonth,
  groupByDay,
  summarizeCashflow,
  type DetailRecordView,
} from './detail/detailData';

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

function toMap<T extends { id: number }>(rows: readonly T[]): Map<number, T> {
  return new Map(rows.map(row => [row.id, row]));
}

export function DetailTabScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const [activeView, setActiveView] = useState<DetailRecordView | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DetailRecordView | null>(null);

  const bookId = currentBook?.id;

  const { data: records = [], loading, refresh } = useRequest(
    () => (bookId ? globalApi.record.getByBook(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId] },
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

  const now = useMemo(() => new Date(), []);
  const monthLabel = useMemo(
    () =>
      now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
    [now],
  );

  const { groups, summary } = useMemo(() => {
    const typeMap = toMap(types);
    const assetMap = toMap(assets);
    const tagMap = toMap(tags);
    const views = buildDetailViews(records, typeMap, assetMap, imageCountMap, tagMap, recordTagsMap);
    const monthViews = filterByMonth(views, now);
    return {
      groups: groupByDay(monthViews),
      summary: summarizeCashflow(monthViews),
    };
  }, [records, types, assets, tags, imageCountMap, recordTagsMap, now]);

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
      return <Empty messageText="本月暂无记录" style={styles.state} />;
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
      <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        >
        <QuickEntryBar onCreated={refresh} />
        <MonthSummaryCard monthLabel={monthLabel} summary={summary} />
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

      <Dialog
        open={pendingDelete !== null}
        titleText="删除记录"
        okText="删除"
        cancelText="取消"
        onOk={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        <Text size="md" color="secondary">
          确定删除这条记录吗？删除后无法恢复。
        </Text>
      </Dialog>
    </Column>
  );
}
