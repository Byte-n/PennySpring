import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { HomeScreen } from '../src/screens/home/HomeScreen';

const mockNavigate = jest.fn();
const mockDrawer = jest.fn(({ children, renderDrawerContent }) => (
  <>
    {renderDrawerContent()}
    {children}
  </>
));

jest.mock('../src/navigation', () => {
  const ReactLocal = require('react');

  return {
    ROOT_ROUTES: {
      Test: 'Test',
    },
    HomeTabsNavigator: ({ leftActions }: any) =>
      ReactLocal.createElement(
        ReactLocal.Fragment,
        null,
        leftActions,
        ReactLocal.createElement('mock-home-tabs-navigator'),
      ),
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

jest.mock('@pennyspring/component', () => {
  const Drawer = (props: any) => mockDrawer(props);

  Drawer.Layout = (props: any) => mockDrawer(props);

  return {
    Drawer,
    Text: ({ children }: any) => {
      const ReactLocal = require('react');
      const ReactNative = require('react-native');

      return ReactLocal.createElement(ReactNative.Text, null, children);
    },
  };
});

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: (factory: any) => () =>
    factory({
      borderRadius: 8,
      borderRadiusSM: 4,
      colorBgContainer: 'container',
      colorBgTextActive: 'active',
      colorBorderSecondary: 'border',
      colorText: 'text',
      controlHeight: 44,
      controlHeightSM: 33,
      lineWidth: 1,
      lineWidthBold: 2,
      padding: 16,
      paddingSM: 12,
      paddingXS: 8,
    }),
  useTheme: () => ({
    token: {
      colorText: 'text',
    },
  }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    mockDrawer.mockClear();
    mockNavigate.mockClear();
  });

  it('navigates to Test route from the drawer option and closes the drawer', () => {
    let testRenderer;

    act(() => {
      testRenderer = renderer.create(<HomeScreen />);
    });

    const menuButton = testRenderer!.root.findByProps({
      accessibilityLabel: '打开菜单',
    });

    act(() => {
      menuButton.props.onPress();
    });

    const testScreenOption = testRenderer!.root.findByProps({
      accessibilityLabel: '打开 Test Screen',
    });

    act(() => {
      testScreenOption.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Test');
    expect(mockDrawer.mock.calls[mockDrawer.mock.calls.length - 1][0].open).toBe(
      false,
    );
    expect(JSON.stringify(testRenderer!.toJSON())).toContain(
      'mock-home-tabs-navigator',
    );
  });
});
