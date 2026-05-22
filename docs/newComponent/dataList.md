# DataList 组件设计

## 设计目标

构建统一的数据驱动列表组件族：

- `DataList`：基于 `FlatList`。
- `DataList.Section`：基于 `SectionList`。

两者统一提供：

- 下拉刷新（PullToRefresh）
- 触底加载（InfiniteScroll）
- 一致的加载中 / 无更多状态表达

同时移除独立 `InfiniteScroll` 组件，避免出现“滚动容器嵌套滚动容器”的手势冲突与状态分裂。

## 背景与问题

当前已有 `InfiniteScroll` 作为独立组件，内部自行创建 `FlatList`。如果后续再新增独立 `PullToRefresh` 容器，会出现以下问题：

- 调用方容易把两个组件嵌套，导致双滚动容器。
- 刷新与触底加载不在同一滚动上下文，触发时机不稳定。
- 类型与 API 分散，业务接入成本上升。

因此应将两种能力统一沉淀到数据列表组件本体。

## 命名与导出

- `DataList`
- `DataList.Section`

包级导出建议：

```ts
export { DataList } from './DataList';
export type {
  DataListProps,
  DataListSection,
  DataListSectionProps,
  DataListSize,
  DataListStyles,
} from './DataList';
```

`DataList.Section` 由静态属性挂载：

```ts
DataList.Section = DataListSection;
```

## 组件关系

- `DataList` 仅封装 `FlatList`。
- `DataList.Section` 仅封装 `SectionList`。
- 两者复用同一套“刷新 + 触底加载”状态机和 footer 渲染策略。
- 两者均保持“最终只有一个真实滚动容器”。

## API 设计

### 公共类型

```ts
export type DataListSize = 'small' | 'normal' | 'large';

export interface DataListStyles {
  footer?: StyleProp<ViewStyle>;
  loadingMore?: StyleProp<ViewStyle>;
  loadingMoreText?: StyleProp<TextStyle>;
  complete?: StyleProp<ViewStyle>;
  completeText?: StyleProp<TextStyle>;
}

export interface DataListLoadMoreProps {
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  loadMoreThreshold?: number;
  loadingMoreText?: string;
  loadingMoreContent?: ReactNode;
  completeText?: string;
  complete?: ReactNode;
}

export interface DataListRefreshProps {
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
}
```

### DataList（FlatList）

```ts
export interface DataListProps<ItemT>
  extends Omit<
      FlatListProps<ItemT>,
      | 'style'
      | 'onEndReached'
      | 'onEndReachedThreshold'
      | 'refreshing'
      | 'onRefresh'
      | 'ListFooterComponent'
    >,
    DataListLoadMoreProps,
    DataListRefreshProps {
  size?: DataListSize;
  style?: StyleProp<ViewStyle>;
  styles?: DataListStyles;
  footer?: ReactNode;
  onEndReached?: FlatListProps<ItemT>['onEndReached'];
}
```

### DataList.Section（SectionList）

```ts
export interface DataListSection<ItemT> {
  key: string;
  data: ItemT[];
}

export interface DataListSectionProps<ItemT, SectionT extends DataListSection<ItemT>>
  extends Omit<
      SectionListProps<ItemT, SectionT>,
      | 'style'
      | 'onEndReached'
      | 'onEndReachedThreshold'
      | 'refreshing'
      | 'onRefresh'
      | 'ListFooterComponent'
    >,
    DataListLoadMoreProps,
    DataListRefreshProps {
  size?: DataListSize;
  style?: StyleProp<ViewStyle>;
  styles?: DataListStyles;
  footer?: ReactNode;
  onEndReached?: SectionListProps<ItemT, SectionT>['onEndReached'];
}
```

## 默认值

- `size`: `normal`
- `hasMore`: `true`
- `loadingMore`: `false`
- `loadMoreThreshold`: `0.1`
- `loadingMoreText`: `加载中...`
- `completeText`: `没有更多了`

## 行为与状态机

### 触底加载

触发条件：

- `hasMore === true`
- `loadingMore !== true`
- `onLoadMore` 存在
- 内部并发锁未占用

并发锁策略：

- 内部 `loadingMoreRef` 防重复调用。
- `onLoadMore` 返回 Promise 时，在 `finally` 释放锁。
- 同步异常时立即释放锁并抛出。

### 下拉刷新

- 直接透传到 `FlatList/SectionList` 的 `refreshing/onRefresh`。
- 刷新期间不阻断滚动。
- 刷新与触底加载互不替代，由业务决定是否同时开启。

### Footer 渲染优先级

1. `loadingMore === true`：渲染加载 footer。
2. `loadingMore !== true && hasMore === false`：渲染完成 footer。
3. 其他情况：不渲染状态 footer。

若传入 `footer`，按“自定义 footer + 状态 footer”顺序合并渲染。

## 样式与 Token

- 样式仅使用 `createUseSheetStyle` + `AliasToken`。
- 不使用 `StyleSheet.create`。
- 不硬编码颜色与尺寸。
- `size` 影响 footer 的 vertical padding 与文本尺寸。

## 与现有 List 的关系

- 现有 `List` 保持“展示容器组件”定位，不承载数据源虚拟滚动能力。
- `DataList` 作为“数据驱动列表组件”补齐滚动加载与刷新场景。

## InfiniteScroll 下线方案

### 目标

移除 `InfiniteScroll` 独立组件能力，统一收敛到 `DataList` / `DataList.Section`。

### 实施步骤

1. 新增 `packages/pennyspring-ui/src/DataList/`：
- `DataList.tsx`
- `DataListSection.tsx`
- `types.ts`
- `index.ts`

2. 更新 `packages/pennyspring-ui/src/index.ts`：
- 新增 `DataList` 导出与类型导出。
- 删除 `InfiniteScroll` 导出与类型导出。

3. 删除目录：
- `packages/pennyspring-ui/src/InfiniteScroll/`

4. 更新测试：
- 删除 `packages/pennyspring-ui/__tests__/InfiniteScroll.test.tsx`
- 新增 `DataList.test.tsx`

5. 如有预览页，新增 `DataList` 示例并移除 `InfiniteScroll` 示例入口。

## 迁移指引

### 从 InfiniteScroll 迁移到 DataList

旧：

```tsx
<InfiniteScroll
  data={data}
  renderItem={renderItem}
  hasMore={hasMore}
  loading={loading}
  loadMore={loadMore}
/>
```

新：

```tsx
<DataList
  data={data}
  renderItem={renderItem}
  hasMore={hasMore}
  loadingMore={loading}
  onLoadMore={loadMore}
/>
```

### 增加下拉刷新

```tsx
<DataList
  data={data}
  renderItem={renderItem}
  hasMore={hasMore}
  loadingMore={loadingMore}
  onLoadMore={loadMore}
  refreshing={refreshing}
  onRefresh={refresh}
/>
```

### 分组列表

```tsx
<DataList.Section
  sections={sections}
  renderItem={renderItem}
  renderSectionHeader={renderSectionHeader}
  hasMore={hasMore}
  onLoadMore={loadMore}
  refreshing={refreshing}
  onRefresh={refresh}
/>
```

## 测试计划

新增测试重点：

1. `DataList` 触底触发 `onLoadMore`。
2. `hasMore=false` 不触发 `onLoadMore`。
3. `loadingMore=true` 防止重复触发。
4. Promise 未完成前重复 `onEndReached` 仅触发一次。
5. `refreshing/onRefresh` 正确透传。
6. 加载 footer 与完成 footer 渲染正确。
7. 自定义 `loadingMoreContent`、`complete`、`footer` 渲染正确。

`DataList.Section` 补充：

1. `sections` 分组渲染正常。
2. `renderSectionHeader` 不受状态 footer 干扰。
3. 触底与刷新行为与 `DataList` 一致。

## 非目标

- 本次不改造现有 `List` 为数据驱动虚拟列表。
- 本次不引入分页状态管理（页码、cursor）抽象。
- 本次不处理业务级空态、错误态文案。

## 里程碑

1. `DataList` / `DataList.Section` 实现与测试完成。
2. `InfiniteScroll` 删除并完成导出清理。
3. 业务侧迁移后移除兼容代码。
