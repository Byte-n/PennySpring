import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { AgentRulesCard } from '../../src/agent/ui/AgentRulesCard';

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockApi = {
  agentRules: {
    get: mockGet,
    set: mockSet,
  },
};

jest.mock('../../src/stores/bookStore', () => ({
  useGlobalApi: () => mockApi,
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Pressable, Text, TextInput, View } = require('react-native');

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

  const MockLayout = ({ children }: { children?: React.ReactNode }) =>
    ReactLib.createElement(View, null, children);

  const MockText = ({ children }: { children?: React.ReactNode }) =>
    ReactLib.createElement(Text, null, children);

  const MockTextarea = ({
    onChange,
    testID,
    value,
  }: {
    onChange?: (value: string) => void;
    testID?: string;
    value?: string;
  }) =>
    ReactLib.createElement(TextInput, {
      onChangeText: onChange,
      testID,
      value,
    });

  return {
    Button: MockButton,
    Card: MockCard,
    Column: MockLayout,
    Loading: () => ReactLib.createElement(Text, null, 'loading'),
    Row: MockLayout,
    Text: MockText,
    Textarea: MockTextarea,
    createUseSheetStyle: () => () => ({}),
    useToast: () => ({ show: jest.fn() }),
  };
});

const SAVED_RULES = {
  booksId: 1,
  agentRules: '自定义主对话规则',
  quickBookRules: '自定义草稿规则',
  createdTime: 0,
  updatedTime: 0,
};

function findButton(
  renderer: TestRenderer.ReactTestRenderer,
  testID: string,
): TestRenderer.ReactTestInstance {
  const instance = renderer.root
    .findAllByProps({ testID })
    .find(node => typeof node.props.onPress === 'function');
  if (!instance) {
    throw new Error(`未找到按钮: ${testID}`);
  }
  return instance;
}

function findTextarea(
  renderer: TestRenderer.ReactTestRenderer,
  testID: string,
): TestRenderer.ReactTestInstance {
  const instance = renderer.root
    .findAllByProps({ testID })
    .find(node => typeof node.props.onChange === 'function');
  if (!instance) {
    throw new Error(`未找到文本域: ${testID}`);
  }
  return instance;
}

async function renderCard(): Promise<TestRenderer.ReactTestRenderer> {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<AgentRulesCard booksId={1} />);
    await Promise.resolve();
    await Promise.resolve();
  });
  return renderer;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue(SAVED_RULES);
  mockSet.mockResolvedValue(SAVED_RULES);
});

describe('AgentRulesCard 恢复默认', () => {
  it('requires a second click before restoring main rules', async () => {
    const renderer = await renderCard();
    const input = findTextarea(renderer, 'agent-rules-main-input');

    expect(input.props.value).toBe('自定义主对话规则');
    expect(findButton(renderer, 'agent-rules-reset-main').props.children).toBe(
      '恢复默认',
    );

    await act(async () => {
      findButton(renderer, 'agent-rules-reset-main').props.onPress();
    });

    expect(findButton(renderer, 'agent-rules-reset-main').props.children).toBe(
      '确认恢复',
    );
    expect(input.props.value).toBe('自定义主对话规则');

    await act(async () => {
      findButton(renderer, 'agent-rules-reset-main').props.onPress();
    });

    expect(
      findTextarea(renderer, 'agent-rules-main-input').props.value,
    ).toContain('金额无法确定时先问我');
    expect(findButton(renderer, 'agent-rules-reset-main').props.children).toBe(
      '恢复默认',
    );
  });

  it('requires a second click before restoring draft rules', async () => {
    const renderer = await renderCard();

    await act(async () => {
      findButton(renderer, 'agent-rules-reset-draft').props.onPress();
    });

    expect(findTextarea(renderer, 'agent-rules-draft-input').props.value).toBe(
      '自定义草稿规则',
    );

    await act(async () => {
      findButton(renderer, 'agent-rules-reset-draft').props.onPress();
    });

    expect(
      findTextarea(renderer, 'agent-rules-draft-input').props.value,
    ).toContain('分类拿不准时留空');
  });

  it('cancels the reset confirmation when the rules are edited', async () => {
    const renderer = await renderCard();

    await act(async () => {
      findButton(renderer, 'agent-rules-reset-main').props.onPress();
    });
    expect(findButton(renderer, 'agent-rules-reset-main').props.children).toBe(
      '确认恢复',
    );

    await act(async () => {
      findTextarea(renderer, 'agent-rules-main-input').props.onChange('新规则');
    });

    expect(findButton(renderer, 'agent-rules-reset-main').props.children).toBe(
      '恢复默认',
    );
  });
});
