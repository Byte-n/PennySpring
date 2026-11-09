import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockDrawerProps: {
  children?: React.ReactNode;
  renderDrawerContent?: () => React.ReactElement<{
    onNavigate: (route: string) => void;
  }>;
  styles?: Record<string, unknown>;
  width?: unknown;
} = {};
const mockNavigation = { navigate: jest.fn() };
const mockFocus = { isFocused: true };

jest.mock('@pennyspring/theme', () => {
  const token = {
    colorBgContainer: 'token-bg-container',
    colorBgMask: 'token-bg-mask',
    colorText: 'token-text',
  };
  return {
    createUseSheetStyle: () => () => ({}),
    useTheme: () => ({ token }),
  };
});

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text: RNText, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  const DrawerLayout = (props: Record<string, unknown>) => {
    Object.assign(mockDrawerProps, props);
    return ReactLib.createElement(View, { testID: 'drawer-layout' });
  };

  const theme = jest.requireMock('@pennyspring/theme');

  return {
    ...theme,
    Column: passthrough(View),
    Drawer: { Layout: DrawerLayout },
    FloatingActionGroup: () => null,
    Row: passthrough(View),
    Text: passthrough(RNText),
  };
});

let mockCurrentBook: { id: number; name: string } | null = {
  id: 1,
  name: '默认账本',
};

jest.mock('../src/stores/bookStore', () => ({
  useBookStore: (
    selector: (state: {
      currentBook: typeof mockCurrentBook;
      setCurrentBook: () => void;
    }) => unknown,
  ) =>
    selector({
      currentBook: mockCurrentBook,
      setCurrentBook: jest.fn(),
    }),
}));

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockFocus.isFocused,
}));

jest.mock('../src/agent/ui/AgentFloatingEntry', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    AgentFloatingEntry: () =>
      ReactLib.createElement(View, { testID: 'agent-floating-entry' }),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(View, props, children),
  };
});

jest.mock('phosphor-react-native', () => {
  const ReactLib = require('react');
  const MockPhosphorIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockPhosphorIcon', props);
  return new Proxy({ __esModule: true }, { get: () => MockPhosphorIcon });
});

jest.mock('../src/navigation', () => ({
  HomeTabsNavigator: () => null,
  ROOT_ROUTES: { AddRecord: 'AddRecord' },
  useNavigation: () => mockNavigation,
}));

jest.mock('../src/screens/quickTemplate/QuickTemplatePanel', () => ({
  QuickTemplatePanel: () => null,
}));

jest.mock('../src/screens/home/ThemeSwitchButton', () => ({
  ThemeSwitchButton: () => null,
}));

jest.mock('../src/screens/home/DrawerContent', () => {
  const ReactLib = require('react');
  return {
    DrawerContent: (props: Record<string, unknown>) =>
      ReactLib.createElement('MockDrawerContent', props),
  };
});

import { HomeScreen } from '../src/screens/home/HomeScreen';

function renderHomeScreen(): TestRenderer.ReactTestRenderer {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(<HomeScreen />);
  });

  return renderer!;
}

beforeEach(() => {
  mockNavigation.navigate.mockClear();
  mockFocus.isFocused = true;
  mockCurrentBook = { id: 1, name: '默认账本' };
  for (const key of Object.keys(mockDrawerProps)) {
    delete mockDrawerProps[key as keyof typeof mockDrawerProps];
  }
});

describe('HomeScreen 抽屉配置', () => {
  it('uses the design width, zero padding and the bg mask color', () => {
    renderHomeScreen();

    expect(mockDrawerProps.width).toBe('82%');
    expect(mockDrawerProps.styles).toEqual({
      drawer: { padding: 0 },
      overlay: { backgroundColor: 'token-bg-mask' },
    });
  });

  it('navigates with the route provided by the drawer content', () => {
    renderHomeScreen();

    const content = mockDrawerProps.renderDrawerContent?.();
    content?.props.onNavigate('BookManage');

    expect(mockNavigation.navigate).toHaveBeenCalledWith('BookManage');
  });
});

describe('HomeScreen 助手悬浮入口', () => {
  it('renders the entry on the first focused render', () => {
    const renderer = renderHomeScreen();

    expect(
      renderer.root.findByProps({ testID: 'agent-floating-entry' }),
    ).toBeTruthy();
  });

  it('hides the entry when the screen is not focused', () => {
    mockFocus.isFocused = false;

    const renderer = renderHomeScreen();

    expect(() =>
      renderer.root.findByProps({ testID: 'agent-floating-entry' }),
    ).toThrow();
  });

  it('hides the entry when no book is selected', () => {
    mockCurrentBook = null;

    const renderer = renderHomeScreen();

    expect(() =>
      renderer.root.findByProps({ testID: 'agent-floating-entry' }),
    ).toThrow();
  });
});
