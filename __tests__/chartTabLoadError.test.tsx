import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

const mockGetByBook = jest.fn();
const mockGlobalApi = {
  asset: { getByBook: jest.fn().mockResolvedValue([]) },
  record: {
    getByBook: mockGetByBook,
    getRecordTags: jest.fn().mockResolvedValue([]),
    getRelationsByBook: jest.fn().mockResolvedValue([]),
  },
  tag: { getAll: jest.fn().mockResolvedValue([]) },
  type: { getAll: jest.fn().mockResolvedValue([]) },
};
let mockBookId: number | null = 5;

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text: RNText, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  return {
    Button: ({
      children,
      onPress,
    }: {
      children?: React.ReactNode;
      onPress?: () => void;
    }) =>
      ReactLib.createElement(
        'MockButton',
        { onPress },
        ReactLib.createElement(RNText, null, children),
      ),
    Card: passthrough(View),
    Column: passthrough(View),
    Empty: ({
      action,
      descriptionText,
      titleText,
    }: {
      action?: React.ReactNode;
      descriptionText?: string;
      titleText?: string;
    }) =>
      ReactLib.createElement(
        View,
        null,
        titleText ? ReactLib.createElement(RNText, null, titleText) : null,
        descriptionText
          ? ReactLib.createElement(RNText, null, descriptionText)
          : null,
        action,
      ),
    Loading: () => null,
    Segmented: () => null,
    createUseSheetStyle: () => () => ({}),
  };
});

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: () => undefined,
}));

jest.mock('../src/navigation', () => ({
  ROOT_ROUTES: { AssetManage: 'AssetManage' },
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('../src/stores/bookStore', () => ({
  useBookKey: () => (mockBookId === null ? null : `local:${mockBookId}`),
  useCurrentBookId: () => mockBookId,
  useGlobalApi: () => mockGlobalApi,
}));

jest.mock('../src/stores/syncVersionStore', () => ({
  useRecordVersion: () => 0,
}));

jest.mock('../src/screens/home/tabs/chart/PeriodBar', () => ({
  PeriodBar: () => null,
}));
jest.mock('../src/screens/home/tabs/chart/AssetsView', () => ({
  AssetsView: () => null,
}));
jest.mock('../src/screens/home/tabs/chart/ExpenseView', () => ({
  ExpenseView: () => null,
}));
jest.mock('../src/screens/home/tabs/chart/IncomeView', () => ({
  IncomeView: () => null,
}));
jest.mock('../src/screens/home/tabs/chart/OverviewView', () => ({
  OverviewView: () => null,
}));

import { ChartTabScreen } from '../src/screens/home/tabs/ChartTabScreen';

function collectTexts(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter((value): value is string => typeof value === 'string');
}

describe('ChartTabScreen 数据加载', () => {
  beforeEach(() => {
    mockBookId = 5;
    mockGetByBook.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a retry state when chart data fails to load', async () => {
    mockGetByBook.mockRejectedValue(new Error('网络不可达'));

    let renderer!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(<ChartTabScreen />);
    });
    await act(async () => undefined);

    expect(mockGetByBook).toHaveBeenCalledWith(5, expect.any(Object));
    expect(collectTexts(renderer)).toEqual(
      expect.arrayContaining(['图表数据加载失败', '重试']),
    );

    mockGetByBook.mockResolvedValue([]);
    await act(async () => {
      renderer.root.findByType('MockButton' as never).props.onPress();
    });
    await act(async () => undefined);

    expect(mockGetByBook).toHaveBeenCalledTimes(2);
    expect(collectTexts(renderer)).not.toContain('图表数据加载失败');
    expect(collectTexts(renderer)).toContain('本月还没有记录');
  });

  it('does not query chart data without a current book', async () => {
    mockBookId = null;

    await act(async () => {
      TestRenderer.create(<ChartTabScreen />);
    });
    await act(async () => undefined);

    expect(mockGetByBook).not.toHaveBeenCalled();
  });
});
