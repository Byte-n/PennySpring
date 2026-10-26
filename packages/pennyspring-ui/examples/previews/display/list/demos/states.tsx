import React, { useState } from 'react';
import { List, Space } from '@pennyspring/ui';
import type { ListItemData } from '@pennyspring/ui';

const LOAD_DELAY_MS = 600;

export const listStatesDemoTitle = 'Empty, loading and load more';

export function ListStatesDemo() {
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  function loadMore(): void {
    setLoading(true);
    setTimeout(() => {
      setLoadedCount(value => value + 1);
      setLoading(false);
    }, LOAD_DELAY_MS);
  }

  const loadedRows: ListItemData[] = Array.from(
    { length: loadedCount },
    (_, index) => ({
      titleText: `新增记录 ${index + 1}`,
      descriptionText: '刚刚加载的列表项',
      right: '¥ 120.00',
    }),
  );

  return (
    <Space direction="vertical" size="large">
      <List<ListItemData> data={[]} empty="还没有交易记录" header="空状态" />
      <List<ListItemData>
        data={[]}
        loading
        loadingText="正在同步交易记录…"
        header="加载状态"
      />
      <List<ListItemData>
        data={loadedRows}
        hasMore={loadedCount < 2}
        isLoadingMore={loading}
        onLoadMore={loadMore}
        loadingText="正在加载更多…"
        completeText="已加载全部记录"
        empty="向上滑动加载记录"
        header="加载更多"
        keyExtractor={item => item.titleText ?? ''}
      />
    </Space>
  );
}

export default ListStatesDemo;
