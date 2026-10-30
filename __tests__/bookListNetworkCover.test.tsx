import React from 'react';
import { Image, Text as RNText } from 'react-native';
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

  return {
    Card: passthrough(View),
    Column: passthrough(View),
    Empty: () => null,
    Icon: MockIcon,
    Row: passthrough(View),
    SwipeAction: passthrough(View),
    Tag: passthrough(View),
    Text: passthrough(Text),
  };
});

import type { BookRow } from '@pennyspring/api';
import { BookList } from '../src/components/BookList';
import type { BookListItem } from '../src/components/BookList';
import type { BookEntry, CurrentBookRef } from '../src/stores/bookStore';

const REMOTE_SERVER_URL = 'http://192.168.1.10:8080';
const COVER_IMAGE_URI = 'https://example.com/cover.png';

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

function renderBookList(items: BookListItem[]): TestRenderer.ReactTestRenderer {
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <BookList mode="select" items={items} currentBook={null} />,
    );
  });
  return renderer!;
}

describe('BookList 账本封面', () => {
  it('网络账本即使存在图片地址也不渲染图片，改用网络图标封面', () => {
    const renderer = renderBookList([createRemoteItem(COVER_IMAGE_URI)]);

    expect(renderer.root.findAllByType(Image)).toHaveLength(0);

    const icons = renderer.root.findAll(
      node =>
        String(node.type) === 'MockUiIcon' &&
        typeof node.props.icon === 'function',
    );
    expect(icons.length).toBeGreaterThan(0);

    const texts = renderer.root
      .findAllByType(RNText)
      .map(node => node.props.children);
    expect(texts).toContain('网络');
  });

  it('本地账本存在图片地址时仍然渲染图片封面', () => {
    const renderer = renderBookList([createLocalItem(COVER_IMAGE_URI)]);

    expect(renderer.root.findAllByType(Image)).toHaveLength(1);
  });
});
