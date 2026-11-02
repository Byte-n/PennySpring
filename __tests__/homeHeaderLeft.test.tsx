import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

type MockBookKind = 'local' | 'remote';

interface MockBookEntry {
  background: string;
  createdTime: number;
  description: string;
  id: number;
  kind: MockBookKind;
  name: string;
  updatedTime: number;
}

type MockBookRef =
  | { kind: 'local'; id: number }
  | { kind: 'remote'; serverUrl: string; bookId: number };

interface MockBookItem {
  entry: MockBookEntry;
  ref: MockBookRef;
}

let mockCurrentBook: MockBookEntry | null = null;
let mockCurrentBookRef: MockBookRef | null = null;
const mockSetCurrentBook = jest.fn();
const mockRefresh = jest.fn();
const mockToastShow = jest.fn();
let mockItems: MockBookItem[] = [];
let mockLoading = false;
let mockError: Error | undefined;

const LOCAL_BOOK = {
  entry: {
    background: '',
    createdTime: 0,
    description: '',
    id: 1,
    kind: 'local' as const,
    name: '家庭账本',
    updatedTime: 0,
  },
  ref: { kind: 'local' as const, id: 1 },
};

const REMOTE_BOOK = {
  entry: {
    background: '',
    createdTime: 0,
    description: '',
    id: 2,
    kind: 'remote' as const,
    name: '云端账本',
    updatedTime: 0,
  },
  ref: {
    kind: 'remote' as const,
    serverUrl: 'http://192.168.1.20:3000',
    bookId: 2,
  },
};

jest.mock('../src/stores/bookStore', () => ({
  useBookStore: (
    selector: (state: {
      currentBook: typeof mockCurrentBook;
      currentBookRef: typeof mockCurrentBookRef;
      setCurrentBook: typeof mockSetCurrentBook;
    }) => unknown,
  ) =>
    selector({
      currentBook: mockCurrentBook,
      currentBookRef: mockCurrentBookRef,
      setCurrentBook: mockSetCurrentBook,
    }),
}));

jest.mock('../src/screens/home/useQuickBookList', () => ({
  useQuickBookList: () => ({
    error: mockError,
    items: mockItems,
    loading: mockLoading,
    refresh: mockRefresh,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  return {
    Column: passthrough(View),
    Icon: (props: Record<string, unknown>) =>
      ReactLib.createElement('MockUiIcon', props),
    Loading: (props: Record<string, unknown>) =>
      ReactLib.createElement('MockLoading', props),
    Popup: ({
      children,
      open,
    }: {
      children?: React.ReactNode;
      open?: boolean;
    }) =>
      open
        ? ReactLib.createElement(View, { testID: 'mock-popup' }, children)
        : null,
    Row: passthrough(View),
    Text: passthrough(Text),
    createUseSheetStyle: () => () => ({}),
    useTheme: () => ({
      token: {
        colorText: 'token-text',
        colorTextTertiary: 'token-text-tertiary',
        fontSizeXL: 22,
        sizeSM: 12,
      },
    }),
    useToast: () => ({ show: mockToastShow }),
  };
});

jest.mock('phosphor-react-native', () => {
  const ReactLib = require('react');
  const MockPhosphorIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockPhosphorIcon', props);
  return new Proxy({ __esModule: true }, { get: () => MockPhosphorIcon });
});

import { HomeHeaderLeft } from '../src/screens/home/HomeHeaderLeft';

const onMenuPress = jest.fn();

function renderHeaderLeft(): TestRenderer.ReactTestRenderer {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      <HomeHeaderLeft onMenuPress={onMenuPress} />,
    );
  });

  return renderer!;
}

function pressBook(renderer: TestRenderer.ReactTestRenderer): void {
  act(() => {
    renderer.root.findByProps({ testID: 'home-header-book' }).props.onPress();
  });
}

beforeEach(() => {
  mockCurrentBook = { ...LOCAL_BOOK.entry };
  mockCurrentBookRef = { ...LOCAL_BOOK.ref };
  mockItems = [LOCAL_BOOK, REMOTE_BOOK];
  mockLoading = false;
  mockError = undefined;
  mockSetCurrentBook.mockClear();
  mockRefresh.mockClear();
  mockToastShow.mockClear();
  onMenuPress.mockClear();
});

describe('HomeHeaderLeft', () => {
  it('shows the book type and name next to the app name', () => {
    const renderer = renderHeaderLeft();

    expect(
      renderer.root.findByProps({ testID: 'home-header-brand' }).props.children,
    ).toBe('PennySpring');
    expect(
      renderer.root.findByProps({ testID: 'home-header-book-type' }).props
        .children,
    ).toBe('本地');
    expect(
      renderer.root.findByProps({ testID: 'home-header-book-name' }).props
        .children,
    ).toBe('家庭账本');
  });

  it('shows the remote type for a remote book', () => {
    mockCurrentBook = { ...REMOTE_BOOK.entry };
    mockCurrentBookRef = { ...REMOTE_BOOK.ref };

    const renderer = renderHeaderLeft();

    expect(
      renderer.root.findByProps({ testID: 'home-header-book-type' }).props
        .children,
    ).toBe('网络');
  });

  it('opens the quick switcher and refreshes the book list', () => {
    const renderer = renderHeaderLeft();

    pressBook(renderer);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(
      renderer.root.findByProps({
        testID: 'home-book-switch-option-local-1',
      }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({
        testID: 'home-book-switch-option-remote-http://192.168.1.20:3000-2',
      }),
    ).toBeTruthy();
  });

  it('switches to another book and closes the switcher', () => {
    const renderer = renderHeaderLeft();

    pressBook(renderer);
    act(() => {
      renderer.root
        .findByProps({
          testID: 'home-book-switch-option-remote-http://192.168.1.20:3000-2',
        })
        .props.onPress();
    });

    expect(mockSetCurrentBook).toHaveBeenCalledWith(
      REMOTE_BOOK.ref,
      REMOTE_BOOK.entry,
    );
    expect(mockToastShow).toHaveBeenCalledWith({
      messageText: '已切换到云端账本',
    });
    expect(
      renderer.root.findAllByProps({
        testID: 'home-book-switch-option-local-1',
      }),
    ).toHaveLength(0);
  });

  it('closes without switching when the current book is selected', () => {
    const renderer = renderHeaderLeft();

    pressBook(renderer);
    act(() => {
      renderer.root
        .findByProps({ testID: 'home-book-switch-option-local-1' })
        .props.onPress();
    });

    expect(mockSetCurrentBook).not.toHaveBeenCalled();
    expect(mockToastShow).not.toHaveBeenCalled();
    expect(
      renderer.root.findAllByProps({
        testID: 'home-book-switch-option-local-1',
      }),
    ).toHaveLength(0);
  });

  it('falls back to an actionable empty state when no book is selected', () => {
    mockCurrentBook = null;
    mockCurrentBookRef = null;
    const renderer = renderHeaderLeft();

    expect(
      renderer.root.findByProps({ testID: 'home-header-brand' }).props.children,
    ).toBe('PennySpring');
    expect(
      renderer.root.findAllByProps({ testID: 'home-header-book-type' }),
    ).toHaveLength(0);
    expect(
      renderer.root.findByProps({ testID: 'home-header-book-name' }).props
        .children,
    ).toBe('未选择账本');

    pressBook(renderer);

    expect(
      renderer.root.findByProps({
        testID: 'home-book-switch-option-local-1',
      }),
    ).toBeTruthy();
  });

  it('keeps the drawer entry on the menu button only', () => {
    const renderer = renderHeaderLeft();

    act(() => {
      renderer.root.findByProps({ testID: 'home-header-menu' }).props.onPress();
    });
    pressBook(renderer);

    expect(onMenuPress).toHaveBeenCalledTimes(1);
  });

  it('offers a retry when loading the book list fails', () => {
    mockError = new Error('network');
    const renderer = renderHeaderLeft();

    pressBook(renderer);
    act(() => {
      renderer.root
        .findByProps({ testID: 'home-book-switch-retry' })
        .props.onPress();
    });

    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });

  it('shows a loading indicator while the book list is loading', () => {
    mockLoading = true;
    const renderer = renderHeaderLeft();

    pressBook(renderer);

    expect(
      renderer.root.findByProps({ testID: 'home-book-switch-loading' }),
    ).toBeTruthy();
  });

  it('shows an empty state when no book exists', () => {
    mockItems = [];
    const renderer = renderHeaderLeft();

    pressBook(renderer);

    expect(
      renderer.root.findByProps({ testID: 'home-book-switch-empty' }),
    ).toBeTruthy();
  });
});
