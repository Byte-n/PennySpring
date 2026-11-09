import React from 'react';
import { Image, Platform, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
  useTheme: () => ({ token: { marginXXS: 4 } }),
}));

jest.mock('@pennyspring/api', () => ({
  BOOK_TYPE: { local: 'local', remote: 'remote' },
}));

jest.mock('phosphor-react-native', () => {
  const ReactLib = require('react');

  const MockPhosphorIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockPhosphorIcon', props);

  return new Proxy({ __esModule: true }, { get: () => MockPhosphorIcon });
});

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  const MockIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockUiIcon', props);
  const List = ({
    data = [],
    sections,
    renderItem,
    ...props
  }: {
    data?: Array<Record<string, unknown>>;
    sections?: Array<{ data: Array<Record<string, unknown>> }>;
    renderItem?: (info: {
      item: unknown;
      index: number;
      separators: object;
    }) => React.ReactNode;
  }) => {
    const rows = sections ? sections.flatMap(section => section.data) : data;
    return ReactLib.createElement(
      View,
      { ...props, testID: 'book-list' },
      ...rows.map((item, index) =>
        ReactLib.createElement(
          'MockListRow',
          { key: String(item.value ?? index), ...item },
          item.left,
          item.right,
          renderItem?.({ item, index, separators: {} }),
        ),
      ),
    );
  };

  const theme = jest.requireMock('@pennyspring/theme');
  const { toNativeImageSource } = jest.requireActual(
    '../packages/pennyspring-ui/src/shares/imageSource',
  );

  return {
    ...theme,
    Card: passthrough(View),
    Column: passthrough(View),
    Empty: () => null,
    Icon: MockIcon,
    List,
    Row: passthrough(View),
    SwipeAction: passthrough(View),
    Tag: passthrough(View),
    Text: passthrough(Text),
    toNativeImageSource,
  };
});

import type { BookRow } from '@pennyspring/api';
import { BookList } from '../src/components/BookList';
import type { BookListItem } from '../src/components/BookList';
import type { BookEntry, CurrentBookRef } from '../src/stores/bookStore';
import { useNetworkBookStore } from '../src/stores/networkBookStore';

const REMOTE_SERVER_URL = 'http://192.168.1.10:8080';
const COVER_IMAGE_URI = 'https://example.com/cover.png';
const SERVER_MEDIA_URI =
  'http://192.168.1.10:8080/api/media/123e4567-e89b-12d3-a456-426614174000.png';
const SERVER_TOKEN = 'test-token-0123456789';

function createBookRow(overrides: Partial<BookRow>): BookRow {
  return {
    id: 1,
    name: '账本',
    description: '',
    background: '',
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  };
}

function createLocalItem(background: string): BookListItem {
  const book = createBookRow({ name: '本地账本', background });
  const ref: CurrentBookRef = { kind: 'local', id: book.id };
  return {
    entry: { kind: 'local', ...book } as BookEntry,
    ref,
  };
}

function createRemoteItem(background: string): BookListItem {
  const book = createBookRow({ name: '网络账本', background });
  const ref: CurrentBookRef = {
    kind: 'remote',
    serverUrl: REMOTE_SERVER_URL,
    bookId: book.id,
  };
  return {
    entry: { kind: 'remote', ...book } as BookEntry,
    ref,
    networkRef: { serverUrl: REMOTE_SERVER_URL, bookId: book.id },
  };
}

function renderBookList(
  items: BookListItem[],
  currentBookRef: CurrentBookRef | null = null,
): TestRenderer.ReactTestRenderer {
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <BookList mode="select" items={items} currentBookRef={currentBookRef} />,
    );
  });
  return renderer!;
}

function findNetworkCoverLabel(
  renderer: TestRenderer.ReactTestRenderer,
): unknown[] {
  return renderer.root.findAllByType(RNText).map(node => node.props.children);
}

describe('BookList 账本封面', () => {
  const ORIGINAL_PLATFORM_OS = Platform.OS;

  beforeEach(() => {
    useNetworkBookStore.setState({ tokens: {} });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: ORIGINAL_PLATFORM_OS,
    });
  });

  it('renders book sections through the shared List container', () => {
    const renderer = renderBookList([createRemoteItem('')]);

    expect(
      renderer.root.findByProps({ testID: 'book-list' }).props.scrollEnabled,
    ).toBe(true);
  });

  it('网络账本有封面地址时渲染图片封面', () => {
    const renderer = renderBookList([createRemoteItem(COVER_IMAGE_URI)]);

    expect(renderer.root.findAllByType(Image)).toHaveLength(1);
    expect(findNetworkCoverLabel(renderer)).not.toContain('网络');
  });

  it('网络账本没有封面时使用网络图标封面', () => {
    const renderer = renderBookList([createRemoteItem('')]);

    expect(renderer.root.findAllByType(Image)).toHaveLength(0);

    const icons = renderer.root.findAll(
      node =>
        String(node.type) === 'MockUiIcon' &&
        typeof node.props.icon === 'function',
    );
    expect(icons.length).toBeGreaterThan(0);
    expect(findNetworkCoverLabel(renderer)).toContain('网络');
  });

  it('本地账本存在图片地址时仍然渲染图片封面', () => {
    const renderer = renderBookList([createLocalItem(COVER_IMAGE_URI)]);

    expect(renderer.root.findAllByType(Image)).toHaveLength(1);
  });

  it('网络账本封面请求携带服务器访问令牌', () => {
    useNetworkBookStore.setState({
      tokens: { [REMOTE_SERVER_URL]: SERVER_TOKEN },
    });
    const renderer = renderBookList([createRemoteItem(SERVER_MEDIA_URI)]);

    expect(renderer.root.findByType(Image).props.source).toEqual({
      uri: SERVER_MEDIA_URI,
      headers: { Authorization: `Bearer ${SERVER_TOKEN}` },
    });
  });

  it('Android 下网络账本封面以数组 source 传递鉴权头', () => {
    useNetworkBookStore.setState({
      tokens: { [REMOTE_SERVER_URL]: SERVER_TOKEN },
    });
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });
    const renderer = renderBookList([createRemoteItem(SERVER_MEDIA_URI)]);

    expect(renderer.root.findByType(Image).props.source).toEqual([
      {
        uri: SERVER_MEDIA_URI,
        headers: { Authorization: `Bearer ${SERVER_TOKEN}` },
      },
    ]);
  });

  it('不为外部封面地址附带服务器访问令牌', () => {
    useNetworkBookStore.setState({
      tokens: { [REMOTE_SERVER_URL]: SERVER_TOKEN },
    });
    const renderer = renderBookList([createRemoteItem(COVER_IMAGE_URI)]);

    expect(renderer.root.findByType(Image).props.source).toEqual({
      uri: COVER_IMAGE_URI,
    });
  });

  it('本地账本封面不携带访问令牌', () => {
    const renderer = renderBookList([createLocalItem(COVER_IMAGE_URI)]);

    expect(renderer.root.findByType(Image).props.source).toEqual({
      uri: COVER_IMAGE_URI,
    });
  });

  it('网络账本加载失败时不提供菜单编辑入口', () => {
    const item = { ...createRemoteItem(''), error: '连接失败' };
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <BookList
          currentBookRef={null}
          items={[item]}
          mode="manage"
          onBookMenu={jest.fn()}
        />,
      );
    });

    const row = renderer!.root.find(
      node => String(node.type) === 'MockListRow',
    );
    expect(row.props.onLongPress).toBeUndefined();
  });

  it('仅当服务器地址与账本 id 都匹配时标记为当前账本', () => {
    const item = createRemoteItem('');
    const renderer = renderBookList([item], {
      kind: 'remote',
      serverUrl: REMOTE_SERVER_URL,
      bookId: item.entry.id,
    });

    expect(findNetworkCoverLabel(renderer)).toContain('当前');
    expect(
      renderer.root.find(node => String(node.type) === 'MockListRow').props
        .onPress,
    ).toBeUndefined();
  });

  it('同一账本 id 来自其他服务器时不标记为当前账本', () => {
    const item = createRemoteItem('');
    const renderer = renderBookList([item], {
      kind: 'remote',
      serverUrl: 'http://192.168.1.99:8080',
      bookId: item.entry.id,
    });

    expect(findNetworkCoverLabel(renderer)).not.toContain('当前');
    expect(
      renderer.root.find(node => String(node.type) === 'MockListRow').props
        .onPress,
    ).toBeInstanceOf(Function);
  });

  it('本地账本与相同 id 的网络账本选择互不混淆', () => {
    const localItem = createLocalItem('');
    const renderer = renderBookList([localItem], {
      kind: 'remote',
      serverUrl: REMOTE_SERVER_URL,
      bookId: localItem.entry.id,
    });

    expect(findNetworkCoverLabel(renderer)).not.toContain('当前');
  });
});
