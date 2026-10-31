import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@pennyspring/theme', () => {
  const token = {
    colorPrimary: 'token-primary',
    colorText: 'token-text',
    colorTextQuaternary: 'token-text-quaternary',
    colorTextSecondary: 'token-text-secondary',
    colorTextTertiary: 'token-text-tertiary',
    controlHeight: 44,
    controlHeightSM: 37,
    fontSize: 16,
    fontSizeLG: 18,
    fontSizeSM: 12,
    lineHeightLG: 26,
    lineHeightSM: 24,
    marginSM: 12,
    paddingMD: 20,
    paddingSM: 12,
    paddingXXS: 4,
    paddingXS: 8,
    sizeXL: 32,
  };
  return {
    createUseSheetStyle: () => () => ({}),
    useTheme: () => ({ token }),
  };
});

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Pressable, Text: RNTextMock, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  const MockSwitch = (props: Record<string, unknown>) => {
    const change = props.onChange;
    return ReactLib.createElement(Pressable, {
      accessibilityRole: 'switch',
      accessibilityState: { checked: props.value === true },
      onPress: () => {
        if (typeof change === 'function') {
          (change as (mockValue: boolean) => void)(props.value !== true);
        }
      },
      testID: props.testID,
    });
  };

  const MockAvatar = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockAvatar', props);

  const MockSkeleton = (props: Record<string, unknown>) =>
    ReactLib.createElement(View, { style: props.style });

  const theme = jest.requireMock('@pennyspring/theme');

  return {
    ...theme,
    Avatar: MockAvatar,
    Column: passthrough(View),
    Divider: (props: Record<string, unknown>) =>
      ReactLib.createElement(View, props),
    Row: passthrough(View),
    Skeleton: MockSkeleton,
    Switch: MockSwitch,
    Text: passthrough(RNTextMock),
  };
});

jest.mock('phosphor-react-native', () => {
  const ReactLib = require('react');
  const MockPhosphorIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockPhosphorIcon', props);
  return new Proxy({ __esModule: true }, { get: () => MockPhosphorIcon });
});

jest.mock('@pennyspring/api', () => ({
  BOOK_TYPE: { local: 'local', remote: 'remote' },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 47 }),
}));

jest.mock('../src/stores/bookStore', () => {
  const state = { currentBook: null, currentBookRef: null };
  return {
    useBookStore: (selector: (value: typeof state) => unknown) =>
      selector(state),
    __bookStoreState: state,
  };
});

jest.mock('../src/contexts/ThemeModeContext', () => {
  const state = { mode: 'default' as 'default' | 'dark' };
  const setThemeMode = jest.fn();
  return {
    useThemeMode: () => ({
      setThemeMode,
      setThemePreset: jest.fn(),
      themeMode: state.mode,
      themePreset: 'default',
      themeToken: undefined,
    }),
    __setThemeMode: setThemeMode,
    __themeModeState: state,
  };
});

import { BOOK_TYPE } from '@pennyspring/api';
import { APP_VERSION } from '../src/constants/app';
import { ROOT_ROUTES } from '../src/navigation/routes';
import { DrawerContent } from '../src/screens/home/DrawerContent';
import type { BookEntry, CurrentBookRef } from '../src/stores/bookStore';

const UPDATED_TIME = new Date('2026-10-26T21:04:00').getTime();

const bookStoreMock = jest.requireMock('../src/stores/bookStore') as {
  __bookStoreState: {
    currentBook: BookEntry | null;
    currentBookRef: CurrentBookRef | null;
  };
};
const themeModeMock = jest.requireMock('../src/contexts/ThemeModeContext') as {
  __setThemeMode: jest.Mock;
  __themeModeState: { mode: 'default' | 'dark' };
};

function createBook(overrides: Partial<BookEntry> = {}): BookEntry {
  return {
    background: '',
    createdTime: UPDATED_TIME,
    description: '记录每日开销与固定支出',
    id: 1,
    kind: BOOK_TYPE.local,
    name: '日常账本',
    updatedTime: UPDATED_TIME,
    ...overrides,
  };
}

interface DrawerCallbacks {
  onClose: jest.Mock;
  onNavigate: jest.Mock;
}

function createCallbacks(): DrawerCallbacks {
  return {
    onClose: jest.fn(),
    onNavigate: jest.fn(),
  };
}

function renderDrawer(
  callbacks: DrawerCallbacks,
): TestRenderer.ReactTestRenderer {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      <DrawerContent
        onClose={callbacks.onClose}
        onNavigate={callbacks.onNavigate}
      />,
    );
  });

  return renderer!;
}

function collectTexts(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(RNText)
    .map(node => node.props.children)
    .filter((value): value is string => typeof value === 'string');
}

beforeEach(() => {
  bookStoreMock.__bookStoreState.currentBook = null;
  bookStoreMock.__bookStoreState.currentBookRef = null;
  themeModeMock.__themeModeState.mode = 'default';
  themeModeMock.__setThemeMode.mockClear();
});

describe('DrawerContent 账本卡', () => {
  it('renders the current book, its storage location and footer', () => {
    bookStoreMock.__bookStoreState.currentBook = createBook();
    bookStoreMock.__bookStoreState.currentBookRef = { id: 1, kind: 'local' };

    const renderer = renderDrawer(createCallbacks());
    const texts = collectTexts(renderer);

    expect(texts).toContain('日常账本');
    expect(texts).toContain('记录每日开销与固定支出');
    expect(texts).toContain('本地 · 数据保存在此设备');
    expect(texts).toContain('管理');
    expect(texts).toContain('外观');
    expect(texts).toContain('深色模式');
    expect(texts).toContain(`本地 · v${APP_VERSION}`);
    expect(texts.some(text => text.startsWith('更新 '))).toBe(true);
    expect(
      renderer.root.findAllByProps({ testID: 'drawer-quick-template' }),
    ).toHaveLength(0);
  });

  it('hides the description line when the book has no description', () => {
    bookStoreMock.__bookStoreState.currentBook = createBook({
      description: '',
    });
    bookStoreMock.__bookStoreState.currentBookRef = { id: 1, kind: 'local' };

    const texts = collectTexts(renderDrawer(createCallbacks()));

    expect(texts).not.toContain('暂无描述');
    expect(texts).not.toContain('记录每日开销与固定支出');
    expect(texts).toContain('日常账本');
  });

  it('shows the server host and 网络 footer for a remote book', () => {
    bookStoreMock.__bookStoreState.currentBook = createBook({
      description: '共同账户与家庭开支',
      kind: BOOK_TYPE.remote,
      name: '家庭账本',
    });
    bookStoreMock.__bookStoreState.currentBookRef = {
      bookId: 2,
      kind: 'remote',
      serverUrl: 'http://192.168.1.20:3000',
    };

    const texts = collectTexts(renderDrawer(createCallbacks()));

    expect(texts).toContain('家庭账本');
    expect(texts).toContain('网络 · 192.168.1.20:3000');
    expect(texts).toContain(`网络 · v${APP_VERSION}`);
    expect(texts).not.toContain('数据保存在此设备');
  });

  it('uses the book name as the avatar fallback and the background image when present', () => {
    bookStoreMock.__bookStoreState.currentBook = createBook({
      background: 'file://cover.png',
    });
    bookStoreMock.__bookStoreState.currentBookRef = { id: 1, kind: 'local' };

    const renderer = renderDrawer(createCallbacks());
    const avatar = renderer.root.find(
      node => String(node.type) === 'MockAvatar',
    );

    expect(avatar.props.text).toBe('日常账本');
    expect(avatar.props.src).toEqual({ uri: 'file://cover.png' });
  });

  it('renders a skeleton card while the book is not ready', () => {
    const renderer = renderDrawer(createCallbacks());

    expect(
      renderer.root.findByProps({ testID: 'drawer-book-skeleton' }),
    ).toBeDefined();
    expect(
      renderer.root
        .findAllByProps({ testID: 'drawer-nav-asset' })
        .some(node => node.props.disabled === true),
    ).toBe(true);
    expect(collectTexts(renderer)).toContain('正在读取账本…');
  });
});

describe('DrawerContent 交互', () => {
  it('closes the drawer before navigating to a management route', () => {
    const callbacks = createCallbacks();
    const renderer = renderDrawer(callbacks);

    act(() => {
      renderer.root.findByProps({ testID: 'drawer-nav-asset' }).props.onPress();
    });

    expect(callbacks.onClose).toHaveBeenCalledTimes(1);
    expect(callbacks.onNavigate).toHaveBeenCalledWith(ROOT_ROUTES.AssetManage);
    expect(callbacks.onClose.mock.invocationCallOrder[0]).toBeLessThan(
      callbacks.onNavigate.mock.invocationCallOrder[0],
    );
  });

  it('opens the merged book list from the book card and drops the separate book row', () => {
    bookStoreMock.__bookStoreState.currentBook = createBook();
    bookStoreMock.__bookStoreState.currentBookRef = { id: 1, kind: 'local' };

    const callbacks = createCallbacks();
    const renderer = renderDrawer(callbacks);

    expect(
      renderer.root.findAllByProps({ testID: 'drawer-nav-book' }),
    ).toHaveLength(0);

    act(() => {
      renderer.root.findByProps({ testID: 'drawer-book-card' }).props.onPress();
    });

    expect(callbacks.onClose).toHaveBeenCalledTimes(1);
    expect(callbacks.onNavigate).toHaveBeenCalledWith(ROOT_ROUTES.BookManage);
    expect(callbacks.onClose.mock.invocationCallOrder[0]).toBeLessThan(
      callbacks.onNavigate.mock.invocationCallOrder[0],
    );
  });

  it('places session management and AI provider entries in the AI section', () => {
    const texts = collectTexts(renderDrawer(createCallbacks()));
    const aiIndex = texts.indexOf('AI');
    const sessionIndex = texts.indexOf('会话管理');
    const providerIndex = texts.indexOf('AI 提供商');
    const appearanceIndex = texts.indexOf('外观');

    expect(texts.indexOf('管理')).toBeLessThan(aiIndex);
    expect(aiIndex).toBeLessThan(sessionIndex);
    expect(sessionIndex).toBeLessThan(providerIndex);
    expect(providerIndex).toBeLessThan(appearanceIndex);
  });

  it('navigates to AI provider settings even without a current book', () => {
    const callbacks = createCallbacks();
    const renderer = renderDrawer(callbacks);

    act(() => {
      renderer.root
        .findByProps({ testID: 'drawer-nav-provider' })
        .props.onPress();
    });

    expect(callbacks.onClose).toHaveBeenCalledTimes(1);
    expect(callbacks.onNavigate).toHaveBeenCalledWith(
      ROOT_ROUTES.AgentSettings,
    );
  });

  it('keeps developer tools collapsed until the header is pressed', () => {
    const renderer = renderDrawer(createCallbacks());

    expect(
      renderer.root.findAllByProps({ testID: 'drawer-dev-icon' }),
    ).toHaveLength(0);

    act(() => {
      renderer.root
        .findByProps({ testID: 'drawer-dev-toggle' })
        .props.onPress();
    });

    expect(
      renderer.root.findByProps({ testID: 'drawer-dev-icon' }),
    ).toBeDefined();
    expect(collectTexts(renderer)).toContain('测试页');

    act(() => {
      renderer.root
        .findByProps({ testID: 'drawer-dev-toggle' })
        .props.onPress();
    });

    expect(
      renderer.root.findAllByProps({ testID: 'drawer-dev-icon' }),
    ).toHaveLength(0);
  });

  it('toggles dark mode from the appearance switch', () => {
    bookStoreMock.__bookStoreState.currentBook = createBook();
    bookStoreMock.__bookStoreState.currentBookRef = { id: 1, kind: 'local' };

    const renderer = renderDrawer(createCallbacks());
    const switchNodes = renderer.root.findAllByProps({
      testID: 'drawer-theme-switch',
    });
    const pressableNode = switchNodes.find(
      node => typeof node.props.onPress === 'function',
    );

    expect(switchNodes[0].props.accessibilityState).toEqual({
      checked: false,
    });

    act(() => {
      pressableNode?.props.onPress();
    });

    expect(themeModeMock.__setThemeMode).toHaveBeenCalledWith('dark');
  });
});
