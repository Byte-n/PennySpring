import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { InfiniteScroll } from '../src/InfiniteScroll';

interface DemoItem {
  id: string;
  label: string;
}

const DATA: DemoItem[] = [
  { id: '1', label: 'A' },
  { id: '2', label: 'B' },
];

function renderInfiniteScroll(
  props: Partial<React.ComponentProps<typeof InfiniteScroll<DemoItem>>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <InfiniteScroll
          data={DATA}
          loadMore={() => undefined}
          renderItem={({ item }) => <View>{item.label}</View>}
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
  return (
    testRenderer.root.findAll((node) => node.props.children === text).length > 0
  );
}

describe('InfiniteScroll', () => {
  it('calls loadMore when list reaches end and hasMore is true', () => {
    const loadMore = jest.fn();
    const testRenderer = renderInfiniteScroll({
      hasMore: true,
      loadMore,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('does not call loadMore when hasMore is false', () => {
    const loadMore = jest.fn();
    const testRenderer = renderInfiniteScroll({
      hasMore: false,
      loadMore,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(loadMore).not.toHaveBeenCalled();
  });

  it('does not trigger loadMore while loading is true', () => {
    const loadMore = jest.fn();
    const testRenderer = renderInfiniteScroll({
      loading: true,
      loadMore,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(loadMore).not.toHaveBeenCalled();
  });

  it('renders loading footer when loading is true', () => {
    const testRenderer = renderInfiniteScroll({ loading: true });

    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(containsText(testRenderer, '加载中...')).toBe(true);
  });

  it('renders complete footer when hasMore is false and loading is false', () => {
    const testRenderer = renderInfiniteScroll({
      hasMore: false,
      loading: false,
    });

    expect(containsText(testRenderer, '没有更多了')).toBe(true);
  });

  it('supports custom loading and complete footer content', () => {
    const testRenderer = renderInfiniteScroll({
      hasMore: false,
      loading: false,
      complete: <View>All done</View>,
      loadingContent: <View>Custom loading</View>,
    });

    expect(containsText(testRenderer, 'All done')).toBe(true);
  });

  it('prevents duplicate loadMore calls before previous promise resolves', async () => {
    let resolveLoadMore: (() => void) | null = null;
    const loadMore = jest.fn(() => {
      return new Promise<void>((resolve) => {
        resolveLoadMore = resolve;
      });
    });
    const testRenderer = renderInfiniteScroll({
      loadMore,
      hasMore: true,
    });
    const flatList = testRenderer.root.findByType(FlatList);

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(loadMore).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveLoadMore?.();
      await Promise.resolve();
    });

    act(() => {
      flatList.props.onEndReached?.({ distanceFromEnd: 0 });
    });

    expect(loadMore).toHaveBeenCalledTimes(2);
  });
});
