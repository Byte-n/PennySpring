import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DetailTabScreen } from '../src/screens/home/tabs/DetailTabScreen';

const mockNavigate = jest.fn();

jest.mock('../src/navigation/useNavigation', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: (fn: Function) => () => {
    const token = new Proxy({}, { get: () => 0 });
    return fn(token, {});
  },
}));

jest.mock('../packages/component', () => {
  const ReactLocal = require('react');
  const { Pressable, Text: RNText } = require('react-native');

  return {
    FloatingActionButton: ({ onPress, testID }: { onPress: () => void; testID?: string }) =>
      ReactLocal.createElement(
        Pressable,
        { onPress, testID },
        ReactLocal.createElement(RNText, null, 'FAB')
      ),
    Text: ({ children }: { children: React.ReactNode }) =>
      ReactLocal.createElement(RNText, null, children),
  };
});

describe('DetailTabScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders FAB button', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<DetailTabScreen />);
    });

    const tree = testRenderer!.root;
    const fab = tree.findByProps({ testID: 'detail-tab-fab' });
    expect(fab).toBeTruthy();
  });

  it('navigates to AddRecord when FAB is pressed', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<DetailTabScreen />);
    });

    const tree = testRenderer!.root;
    const fab = tree.findByProps({ testID: 'detail-tab-fab' });

    act(() => {
      fab.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('AddRecord');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
