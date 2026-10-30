import React, { useState } from 'react';
import { Button, Column, Empty, List, Text } from '@pennyspring/ui';
import type { ListItemData } from '@pennyspring/ui';

const LOAD_DELAY_MS = 600;

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
      right: <Text color="error" weight="semibold">-¥120.00</Text>,
      descriptionText: '刚刚加载的记录',
      icon: 'list' as const,
      titleText: `新增记录 ${index + 1}`,
    }),
  );
  const hasMore = loadedCount < 2;

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        空态直接传 Empty variant=boxed；列表底部加载用 Loading variant=more，加载完在同位置显示「已加载全部」。预览页由外层统一滚动，这里用按钮模拟加载更多
      </Text>
      <List<ListItemData>
        data={[]}
        empty={<Empty size="small" titleText="还没有交易记录" descriptionText="点右下角 + 记一笔。" />}
        header="空状态"
        scrollEnabled={false}
      />
      <List<ListItemData>
        data={[]}
        header="加载状态"
        loading
        loadingText="正在同步交易记录…"
        scrollEnabled={false}
      />
      <List<ListItemData>
        data={loadedRows}
        empty="点击下方按钮加载记录"
        completeText="已加载全部记录"
        hasMore={hasMore}
        header="加载更多"
        isLoadingMore={loading}
        keyExtractor={item => item.titleText ?? ''}
        loadingText="正在加载更多…"
        scrollEnabled={false}
      />
      {hasMore ? (
        <Button disabled={loading} onPress={loadMore} size="small" type="primary">
          加载更多
        </Button>
      ) : null}
    </Column>
  );
}

export default ListStatesDemo;
