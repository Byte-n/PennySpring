import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

const mockGetAll = jest.fn();
const mockGlobalApi = { tag: { getAll: mockGetAll } };
let mockBookId: number | null = 5;

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text: RNText, View: RNView } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  const BoundForm = (): null => null;
  BoundForm.useForm = () => [
    { reset: jest.fn(), setFieldValue: jest.fn(), Subscribe: () => null },
  ];

  return {
    ActionSheet: () => null,
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
    Column: passthrough(RNView),
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
        RNView,
        null,
        titleText ? ReactLib.createElement(RNText, null, titleText) : null,
        descriptionText
          ? ReactLib.createElement(RNText, null, descriptionText)
          : null,
        action,
      ),
    Form: { infer: () => BoundForm },
    Input: () => null,
    Row: passthrough(RNView),
    Switch: () => null,
    Text: passthrough(RNText),
    createUseSheetStyle: () => () => ({}),
    useTheme: () => ({ token: {} }),
    useToast: () => ({ show: jest.fn() }),
  };
});

jest.mock('@pennyspring/api', () => ({
  VISIBILITY: { visible: 0, hidden: 1 },
}));

jest.mock('phosphor-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({ __esModule: true }, { get: () => MockIcon });
});

jest.mock('../src/navigation', () => ({
  useNavigation: () => ({ navigate: jest.fn(), setOptions: jest.fn() }),
}));

jest.mock('../src/stores/bookStore', () => ({
  useBookKey: () => (mockBookId === null ? null : `local:${mockBookId}`),
  useCurrentBookId: () => mockBookId,
  useGlobalApi: () => mockGlobalApi,
}));

jest.mock('../src/component/TagChip', () => ({ TagChip: () => null }));
jest.mock('../src/component/FormIconGrid', () => ({
  FormIconGrid: () => null,
  TAG_FORM_ICONS: [],
}));
jest.mock('../src/component/PhosphorIconPicker', () => ({
  PhosphorIconPicker: () => null,
}));
jest.mock('../src/components/ManageSkeleton', () => ({
  ManageSkeleton: () => null,
}));
jest.mock('../src/components/ManageConfirmDialog', () => ({
  ManageConfirmDialog: () => null,
}));
jest.mock('../src/components/FormFloatingPanel', () => ({
  FormFloatingPanel: () => null,
}));

import { TagManageScreen } from '../src/screens/tagManage/TagManageScreen';

function collectTexts(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter((value): value is string => typeof value === 'string');
}

describe('TagManageScreen 数据加载', () => {
  beforeEach(() => {
    mockBookId = 5;
    mockGetAll.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a book-scoped failure with retry instead of an empty tag list', async () => {
    mockGetAll.mockRejectedValue(new Error('网络不可达'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    let renderer!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(<TagManageScreen />);
    });
    await act(async () => undefined);

    expect(mockGetAll).toHaveBeenCalledWith(5);
    expect(collectTexts(renderer)).toEqual(
      expect.arrayContaining(['标签加载失败', '重试']),
    );

    mockGetAll.mockResolvedValue([]);
    await act(async () => {
      renderer.root.findByType('MockButton' as never).props.onPress();
    });
    await act(async () => undefined);

    expect(mockGetAll).toHaveBeenCalledTimes(2);
    expect(collectTexts(renderer)).not.toContain('标签加载失败');
  });

  it('does not query tags without a current book', async () => {
    mockBookId = null;

    await act(async () => {
      TestRenderer.create(<TagManageScreen />);
    });
    await act(async () => undefined);

    expect(mockGetAll).not.toHaveBeenCalled();
  });
});
