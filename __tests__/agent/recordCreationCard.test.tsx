import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import type { ToolCallMessagePartProps } from '@assistant-ui/react-native';
import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  type TypeRow,
} from '@pennyspring/api';

import { RecordCreationCard } from '../../src/agent/ui/RecordCreationCard';

const mockRespondToApproval = jest.fn(async () => {});
const mockTypeGetAll = jest.fn();
const mockTagGetAll = jest.fn();
const mockAssetGetByBook = jest.fn();
const mockApi = {
  type: { getAll: mockTypeGetAll },
  tag: { getAll: mockTagGetAll },
  asset: { getByBook: mockAssetGetByBook },
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
    Loading: MockLoading,
    Row: MockLayout,
    Text: MockText,
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

const BASE_ARGS = {
  records: [
    {
      typeId: 2,
      amount: 30,
      date: '2026-10-30',
      time: '12:34',
      remark: '午饭',
    },
    {
      typeId: 2,
      amount: 12.5,
      date: '2026-10-30',
      time: '18:00',
      remark: '晚饭',
    },
  ],
};

function createProps(
  overrides: Partial<Record<string, unknown>> = {},
): ToolCallMessagePartProps {
  return {
    type: 'tool-call',
    toolName: 'createRecords',
    toolCallId: 'tool-1',
    args: BASE_ARGS,
    argsText: JSON.stringify(BASE_ARGS),
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
      <RecordCreationCard {...createProps(overrides)} />,
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  return renderer;
}

function findByTestId(
  renderer: TestRenderer.ReactTestRenderer,
  testID: string,
): TestRenderer.ReactTestInstance {
  return renderer.root.findByProps({ testID });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockTypeGetAll.mockResolvedValue([TYPE]);
  mockTagGetAll.mockResolvedValue([]);
  mockAssetGetByBook.mockResolvedValue([]);
});

describe('RecordCreationCard', () => {
  it('shows every record in the batch and approves the tool call', async () => {
    const renderer = await renderCard();

    expect(
      renderer.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children.includes('¥30.00'),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children.includes('¥12.50'),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children.includes('共 2 笔'),
      ).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      findByTestId(renderer, 'agent-record-confirm').props.onPress();
    });

    expect(mockRespondToApproval).toHaveBeenCalledWith({ approved: true });
  });

  it('denies the tool call with a cancellation reason', async () => {
    const renderer = await renderCard();

    await act(async () => {
      findByTestId(renderer, 'agent-record-cancel').props.onPress();
    });

    expect(mockRespondToApproval).toHaveBeenCalledWith({
      approved: false,
      reason: '用户取消',
    });
  });

  it('renders the approving state after confirmation', async () => {
    const renderer = await renderCard({
      approval: { id: 'approval-1', approved: true },
      status: { type: 'running' },
    });

    expect(
      renderer.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children.includes('正在批量写入账本'),
      ).length,
    ).toBeGreaterThan(0);
  });

  it('renders the success state with the written count', async () => {
    const renderer = await renderCard({
      approval: { id: 'approval-1', approved: true },
      status: { type: 'complete', reason: 'stop' },
      result: { ok: true, count: 2, records: [] },
    });

    expect(
      renderer.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children.includes('共 2 笔'),
      ).length,
    ).toBeGreaterThan(0);
  });

  it('cancels with the validation error when the record cannot be resolved', async () => {
    mockTypeGetAll.mockResolvedValue([]);
    const renderer = await renderCard();

    expect(
      renderer.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children.includes('无法确认这批记账'),
      ).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      findByTestId(renderer, 'agent-record-cancel').props.onPress();
    });

    expect(mockRespondToApproval).toHaveBeenCalledWith({
      approved: false,
      reason: '第 1 笔：类型 ID 2 不存在',
    });
  });

  it('renders the cancelled state', async () => {
    const renderer = await renderCard({
      approval: { id: 'approval-1', approved: false },
      status: { type: 'complete', reason: 'stop' },
    });

    expect(
      renderer.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children.includes('已取消'),
      ).length,
    ).toBeGreaterThan(0);
  });

  it('keeps the cancelled state when a denied call reports an error result', async () => {
    const renderer = await renderCard({
      approval: { id: 'approval-1', approved: false, reason: '用户取消' },
      status: { type: 'complete', reason: 'stop' },
      isError: true,
      result: { error: '用户取消' },
    });

    expect(
      renderer.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children.includes('已取消'),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children.includes('记账失败'),
      ),
    ).toHaveLength(0);
  });
});
