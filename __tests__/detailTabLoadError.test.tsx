import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

const mockGetListByBook = jest.fn();
const mockGlobalApi = { record: { getListByBook: mockGetListByBook } };
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
    Column: passthrough(View),
    Dialog: () => null,
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
    Row: passthrough(View),
    Segmented: () => null,
    Text: passthrough(RNText),
    createUseSheetStyle: () => () => ({}),
    useToast: () => ({ show: jest.fn() }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: () => undefined,
}));

jest.mock('../src/navigation', () => ({
  ROOT_ROUTES: { AddRecord: 'AddRecord' },
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('../src/stores/bookStore', () => ({
  useBookKey: () => (mockBookId === null ? null : `local:${mockBookId}`),
  useCurrentBookId: () => mockBookId,
  useGlobalApi: () => mockGlobalApi,
}));

jest.mock('../src/stores/syncVersionStore', () => ({
  bumpRecordVersion: jest.fn(),
  useRecordVersion: () => 0,
}));

jest.mock('../src/screens/home/tabs/detail/MonthSummaryCard', () => ({
  MonthSummaryCard: () => null,
}));

jest.mock('../src/screens/home/tabs/detail/DayGroupCard', () => ({
  DayGroupCard: () => null,
  DayGroupHeader: () => null,
}));

jest.mock('../src/screens/home/tabs/detail/RecordDetailPanel', () => ({
  RecordDetailPanel: () => null,
}));

import '../src/utils/prototype';
import { DetailTabScreen } from '../src/screens/home/tabs/DetailTabScreen';

function collectTexts(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter((value): value is string => typeof value === 'string');
}

describe('DetailTabScreen 数据加载', () => {
  beforeEach(() => {
    mockBookId = 5;
    mockGetListByBook.mockReset();
  });

  it('shows a retry state when records fail to load', async () => {
    mockGetListByBook.mockRejectedValue(new Error('网络不可达'));
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    let renderer!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(<DetailTabScreen />);
    });
    await act(async () => undefined);

    expect(mockGetListByBook).toHaveBeenCalledTimes(1);
    expect(collectTexts(renderer)).toEqual(
      expect.arrayContaining(['记录加载失败', '重试']),
    );

    mockGetListByBook.mockResolvedValue([]);
    const buttons = renderer.root.findAllByType('MockButton' as never);
    await act(async () => {
      buttons[buttons.length - 1].props.onPress();
    });
    await act(async () => undefined);

    expect(mockGetListByBook).toHaveBeenCalledTimes(2);
    expect(collectTexts(renderer)).not.toContain('记录加载失败');
    expect(collectTexts(renderer)).toContain('本月还没有记录');
    consoleError.mockRestore();
  });

  it('does not query records without a current book', async () => {
    mockBookId = null;

    await act(async () => {
      TestRenderer.create(<DetailTabScreen />);
    });
    await act(async () => undefined);

    expect(mockGetListByBook).not.toHaveBeenCalled();
  });
});
