import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import type { ToolCallMessagePartProps } from '@assistant-ui/react-native';
import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  SYSTEM_STATUS,
  type RecordDetail,
  type TypeRow,
} from '@pennyspring/api';

import { RecordUpdateCard } from '../../src/agent/ui/RecordUpdateCard';

const mockRespondToApproval = jest.fn(async () => {});
const mockTypeGetAll = jest.fn();
const mockTagGetAll = jest.fn();
const mockAssetGetByBook = jest.fn();
const mockGetDetailById = jest.fn();
const mockApi = {
  type: { getAll: mockTypeGetAll },
  tag: { getAll: mockTagGetAll },
  asset: { getByBook: mockAssetGetByBook },
  record: { getDetailById: mockGetDetailById },
};

jest.mock('../../src/stores/bookStore', () => ({
  useGlobalApi: () => mockApi,
  useBookStore: (selector: (state: unknown) => unknown) =>
    selector({ currentBook: { id: 1, name: '测试账本' } }),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Pressable, Text, View } = require('react-native');

  const MockButton = ({
    children,
    disabled,
    loading,
    onPress,
    testID,
  }: {
    children?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
    onPress?: () => void;
    testID?: string;
  }) =>
    ReactLib.createElement(
      Pressable,
      {
        disabled: disabled || loading,
        onPress: disabled || loading ? undefined : onPress,
        testID,
      },
      typeof children === 'string'
        ? ReactLib.createElement(Text, null, children)
        : children,
    );

  const MockCard = ({
    titleText,
    children,
    footer,
  }: {
    titleText?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
  }) =>
    ReactLib.createElement(
      View,
      null,
      titleText ? ReactLib.createElement(Text, null, titleText) : null,
      children,
      footer,
    );

  const MockText = ({ children }: { children?: React.ReactNode }) =>
    ReactLib.createElement(Text, null, children);

  const MockLayout = ({ children }: { children?: React.ReactNode }) =>
    ReactLib.createElement(View, null, children);

  const MockLoading = () =>
    ReactLib.createElement(Text, { testID: 'loading' }, 'loading');

  return {
    Button: MockButton,
    Card: MockCard,
    Column: MockLayout,
    Icon: () => null,
    Loading: MockLoading,
    Row: MockLayout,
    Text: MockText,
    useTheme: () => ({ token: { marginXXS: 4 } }),
    useToast: () => ({ show: jest.fn() }),
  };
});

const TYPE: TypeRow = {
  id: 2,
  booksId: 1,
  parentId: 0,
  name: '三餐',
  icon: '',
  typeCategory: RECORD_TYPE_CATEGORY.expense,
  isSystem: SYSTEM_STATUS.custom,
  specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
  sort: 1,
  createdTime: 0,
  updatedTime: 0,
} as TypeRow;

const RECORD_TIME = new Date(2026, 9, 30, 12, 34).getTime();

const DETAILS: RecordDetail[] = [
  {
    record: {
      id: 100,
      typeId: 2,
      assetId: 0,
      intoAssetId: 0,
      booksId: 1,
      amount: 3000,
      finalAmount: 3000,
      charge: 0,
      remark: '午饭',
      reimbursable: REIMBURSABLE.notReimbursable,
      recordTime: RECORD_TIME,
      createdTime: 0,
      updatedTime: 0,
    },
    tagIds: [],
    imagePaths: ['file://a.jpg'],
    relatedRecordIds: [],
  },
  {
    record: {
      id: 101,
      typeId: 2,
      assetId: 0,
      intoAssetId: 0,
      booksId: 1,
      amount: 3000,
      finalAmount: 3000,
      charge: 0,
      remark: '晚饭',
      reimbursable: REIMBURSABLE.notReimbursable,
      recordTime: RECORD_TIME,
      createdTime: 0,
      updatedTime: 0,
    },
    tagIds: [],
    imagePaths: [],
    relatedRecordIds: [],
  },
];

function createProps(
  overrides: Partial<Record<string, unknown>> = {},
): ToolCallMessagePartProps {
  const args = (overrides.args as Record<string, unknown>) ?? {
    updates: [
      { recordId: 100, amount: 35 },
      { recordId: 101, remark: '夜宵' },
    ],
  };
  return {
    type: 'tool-call',
    toolName: 'updateRecords',
    toolCallId: 'tool-update-1',
    args,
    argsText: JSON.stringify(args),
    status: { type: 'requires-action', reason: 'tool-calls' },
    isError: false,
    approval: { id: 'approval-1' },
    respondToApproval: mockRespondToApproval,
    addResult: jest.fn(),
    resume: jest.fn(),
    ...overrides,
  } as unknown as ToolCallMessagePartProps;
}

async function renderCard(
  overrides: Partial<Record<string, unknown>> = {},
): Promise<TestRenderer.ReactTestRenderer> {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <RecordUpdateCard {...createProps(overrides)} />,
    );
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
  return renderer;
}

function findByTestId(
  renderer: TestRenderer.ReactTestRenderer,
  testID: string,
): TestRenderer.ReactTestInstance {
  const instances = renderer.root.findAllByProps({ testID });
  const instance =
    instances.find(node => typeof node.props.onPress === 'function') ??
    instances[0];
  if (!instance) {
    throw new Error(`未找到 testID: ${testID}`);
  }
  return instance;
}

function containsText(
  renderer: TestRenderer.ReactTestRenderer,
  text: string,
): boolean {
  return (
    renderer.root.findAll(
      node =>
        typeof node.props.children === 'string' &&
        node.props.children.includes(text),
    ).length > 0
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDetailById.mockImplementation(async (recordId: number) => {
    const detail = DETAILS.find(item => item.record.id === recordId);
    if (!detail) throw new Error(`记录不存在: ${recordId}`);
    return detail;
  });
  mockTypeGetAll.mockResolvedValue([TYPE]);
  mockTagGetAll.mockResolvedValue([]);
  mockAssetGetByBook.mockResolvedValue([]);
});

describe('RecordUpdateCard', () => {
  it('keeps field changes collapsed until expanded and approves the tool call', async () => {
    const renderer = await renderCard();

    expect(containsText(renderer, '待确认的修改')).toBe(true);
    expect(containsText(renderer, '¥35.00')).toBe(true);
    expect(containsText(renderer, '金额：¥30.00 → ¥35.00')).toBe(false);
    expect(containsText(renderer, '#100')).toBe(true);
    expect(containsText(renderer, '#101')).toBe(true);
    expect(containsText(renderer, '共 2 条')).toBe(true);

    await act(async () => {
      findByTestId(renderer, 'agent-record-update-item-1').props.onPress();
    });

    expect(containsText(renderer, '金额：¥30.00 → ¥35.00')).toBe(true);

    await act(async () => {
      findByTestId(renderer, 'agent-record-update-confirm').props.onPress();
    });

    expect(mockRespondToApproval).toHaveBeenCalledWith({ approved: true });
  });

  it('denies the tool call with a cancellation reason', async () => {
    const renderer = await renderCard();

    await act(async () => {
      findByTestId(renderer, 'agent-record-update-cancel').props.onPress();
    });

    expect(mockRespondToApproval).toHaveBeenCalledWith({
      approved: false,
      reason: '用户取消',
    });
  });

  it('renders the success state with the updated count', async () => {
    const renderer = await renderCard({
      approval: { id: 'approval-1', approved: true },
      status: { type: 'complete', reason: 'stop' },
      result: { ok: true, count: 2, records: [] },
    });

    expect(containsText(renderer, '已修改')).toBe(true);
    expect(containsText(renderer, '共 2 条')).toBe(true);
  });

  it('cancels with the load error when the record cannot be read', async () => {
    mockGetDetailById.mockRejectedValue(new Error('记录不存在: 100'));
    const renderer = await renderCard();

    expect(containsText(renderer, '无法读取记录')).toBe(true);
    expect(containsText(renderer, '记录不存在: 100')).toBe(true);

    await act(async () => {
      findByTestId(renderer, 'agent-record-update-cancel').props.onPress();
    });

    expect(mockRespondToApproval).toHaveBeenCalledWith({
      approved: false,
      reason: '记录不存在: 100',
    });
  });

  it('blocks confirmation when nothing changes', async () => {
    const renderer = await renderCard({
      args: { updates: [{ recordId: 100 }] },
    });

    expect(containsText(renderer, '没有需要修改的内容')).toBe(true);
    expect(
      renderer.root.findAllByProps({ testID: 'agent-record-update-confirm' }),
    ).toHaveLength(0);
  });

  it('renders the cancelled state', async () => {
    const renderer = await renderCard({
      approval: { id: 'approval-1', approved: false },
      status: { type: 'complete', reason: 'stop' },
    });

    expect(containsText(renderer, '已取消')).toBe(true);
    expect(containsText(renderer, '未修改账本')).toBe(true);
  });
});
