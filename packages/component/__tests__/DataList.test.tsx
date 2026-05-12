import React from 'react';
import { ActivityIndicator, FlatList, SectionList, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { DataList } from '../src/DataList';

interface DemoItem {
  id: string;
  label: string;
}

interface DemoSection {
  key: string;
  data: DemoItem[];
}

const DATA: DemoItem[] = [
  { id: '1', label: 'A' },
  { id: '2', label: 'B' },
];

const SECTIONS: DemoSection[] = [
  {
    key: 'group-1',
    data: DATA,
  },
];

function renderDataList(
  props: Partial<React.ComponentProps<typeof DataList<DemoItem>>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <DataList
          data={DATA}
          keyExtractor={(item) => item.id}
          onLoadMore={() => undefined}
          renderItem={({ item }) => <View>{item.label}</View>}
          {...props}
        />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function renderDataListSection(
  props: Partial<React.ComponentProps<typeof DataList.Section<DemoItem, DemoSection>>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <DataList.Section
          keyExtractor={(item) => item.id}
          onLoadMore={() => undefined}
          renderItem={({ item }) => <View>{item.label}</View>}
          renderSectionHeader={({ section }) => <View>{section.key}</View>}
          sections={SECTIONS}
          {...props}
        />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function containsText(
  testRenderer: renderer.ReactTestRenderer,
  text: string,
): boolean {
  return testRenderer.root.findAll((node) => node.props.children === text).length > 0;
}

describe('DataList', () => {
  it('calls onLoadMore when list reaches end and hasMore is true', () => {
    const onLoadMore = jest.fn();
    const testRenderer = renderDataList({
      hasMore: true,
      onLoadMore,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('does not call onLoadMore when hasMore is false', () => {
    const onLoadMore = jest.fn();
    const testRenderer = renderDataList({
      hasMore: false,
      onLoadMore,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not trigger onLoadMore while loadingMore is true', () => {
    const onLoadMore = jest.fn();
    const testRenderer = renderDataList({
      loadingMore: true,
      onLoadMore,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('prevents duplicate onLoadMore calls before previous promise resolves', async () => {
    let resolveLoadMore: (() => void) | null = null;
    const onLoadMore = jest.fn(() => {
      return new Promise<void>((resolve) => {
        resolveLoadMore = resolve;
      });
    });
    const testRenderer = renderDataList({
      hasMore: true,
      onLoadMore,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveLoadMore?.();
      await Promise.resolve();
    });

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it('passes refreshing and onRefresh to FlatList', () => {
    const onRefresh = jest.fn();
    const testRenderer = renderDataList({
      onRefresh,
      refreshing: true,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    expect(flatList.props.refreshing).toBe(true);

    act(() => {
      flatList.props.onRefresh?.();
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders loading footer when loadingMore is true', () => {
    const testRenderer = renderDataList({ loadingMore: true });

    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(containsText(testRenderer, '加载中...')).toBe(true);
  });

  it('renders complete footer when hasMore is false and loadingMore is false', () => {
    const testRenderer = renderDataList({
      hasMore: false,
      loadingMore: false,
    });

    expect(containsText(testRenderer, '没有更多了')).toBe(true);
  });

  it('renders custom loadingMoreContent, complete and footer in order', () => {
    const completeRenderer = renderDataList({
      complete: <View>All done</View>,
      footer: <View>Custom footer</View>,
      hasMore: false,
      loadingMore: false,
    });
    const loadingRenderer = renderDataList({
      footer: <View>Custom footer</View>,
      hasMore: true,
      loadingMore: true,
      loadingMoreContent: <View>Custom loading</View>,
    });

    expect(containsText(completeRenderer, 'Custom footer')).toBe(true);
    expect(containsText(completeRenderer, 'All done')).toBe(true);
    expect(containsText(loadingRenderer, 'Custom footer')).toBe(true);
    expect(containsText(loadingRenderer, 'Custom loading')).toBe(true);
  });

  it('passes loadMoreThreshold and onEndReached through DataList', () => {
    const onEndReached = jest.fn();
    const testRenderer = renderDataList({
      loadMoreThreshold: 0.3,
      onEndReached,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    expect(flatList.props.onEndReachedThreshold).toBe(0.3);

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 10 });
    });

    expect(onEndReached).toHaveBeenCalledTimes(1);
  });
});

describe('DataList.Section', () => {
  it('renders sections and keeps section header render function', () => {
    const testRenderer = renderDataListSection({
      hasMore: true,
      loadingMore: false,
    });

    const sectionList = testRenderer.root.findByType(SectionList);

    expect(sectionList.props.sections).toEqual(SECTIONS);
    expect(typeof sectionList.props.renderSectionHeader).toBe('function');
  });

  it('calls onLoadMore when section list reaches end', () => {
    const onLoadMore = jest.fn();
    const testRenderer = renderDataListSection({
      hasMore: true,
      onLoadMore,
    });
    const sectionList = testRenderer.root.findByType(SectionList);

    act(() => {
      sectionList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('passes refreshing and onRefresh to SectionList', () => {
    const onRefresh = jest.fn();
    const testRenderer = renderDataListSection({
      onRefresh,
      refreshing: true,
    });
    const sectionList = testRenderer.root.findByType(SectionList);

    expect(sectionList.props.refreshing).toBe(true);

    act(() => {
      sectionList.props.onRefresh?.();
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders loading and complete state footer for section list', () => {
    const loadingRenderer = renderDataListSection({
      hasMore: true,
      loadingMore: true,
    });
    const completeRenderer = renderDataListSection({
      hasMore: false,
      loadingMore: false,
    });

    expect(loadingRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(containsText(loadingRenderer, '加载中...')).toBe(true);
    expect(containsText(completeRenderer, '没有更多了')).toBe(true);
  });
});
