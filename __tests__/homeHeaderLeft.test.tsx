import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

let mockCurrentBook: { name: string } | null = { name: '家庭账本' };

jest.mock('../src/stores/bookStore', () => ({
  useBookStore: (
    selector: (state: { currentBook: typeof mockCurrentBook }) => unknown,
  ) => selector({ currentBook: mockCurrentBook }),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text, View } = require('react-native');

  return {
    Row: ({ children }: { children?: React.ReactNode }) =>
      ReactLib.createElement(View, null, children),
    Text: ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Text, props, children),
    createUseSheetStyle: () => () => ({}),
    useTheme: () => ({
      token: {
        colorText: 'token-text',
        colorTextTertiary: 'token-text-tertiary',
        fontSizeXL: 22,
        sizeSM: 12,
      },
    }),
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

beforeEach(() => {
  mockCurrentBook = { name: '家庭账本' };
  onMenuPress.mockClear();
});

describe('HomeHeaderLeft', () => {
  it('shows the app name next to the current book name', () => {
    const renderer = renderHeaderLeft();

    expect(
      renderer.root.findByProps({ testID: 'home-header-brand' }).props.children,
    ).toBe('PennySpring');
    expect(
      renderer.root.findByProps({ testID: 'home-header-book-name' }).props
        .children,
    ).toBe('家庭账本');
  });

  it('falls back to an actionable empty state when no book is selected', () => {
    mockCurrentBook = null;
    const renderer = renderHeaderLeft();

    expect(
      renderer.root.findByProps({ testID: 'home-header-brand' }).props.children,
    ).toBe('PennySpring');
    expect(
      renderer.root.findByProps({ testID: 'home-header-book-name' }).props
        .children,
    ).toBe('未选择账本');

    act(() => {
      renderer.root.findByProps({ testID: 'home-header-book' }).props.onPress();
    });

    expect(onMenuPress).toHaveBeenCalledTimes(1);
  });

  it('opens the drawer from both the menu and the book switcher', () => {
    const renderer = renderHeaderLeft();

    act(() => {
      renderer.root.findByProps({ testID: 'home-header-menu' }).props.onPress();
    });
    act(() => {
      renderer.root.findByProps({ testID: 'home-header-book' }).props.onPress();
    });

    expect(onMenuPress).toHaveBeenCalledTimes(2);
  });

  it('keeps the app name outside the book switcher', () => {
    const renderer = renderHeaderLeft();
    const bookSwitcher = renderer.root.findByProps({
      testID: 'home-header-book',
    });

    expect(
      bookSwitcher.findAllByProps({ testID: 'home-header-brand' }),
    ).toHaveLength(0);
  });
});
