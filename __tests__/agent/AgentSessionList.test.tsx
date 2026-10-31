import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import dayjs from 'dayjs';

import { AgentSessionList } from '../../src/agent/ui/AgentSessionList';
import type { AgentThreadRow } from '@pennyspring/api';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
  useTheme: () => ({ token: { marginXXS: 4 } }),
}));

jest.mock('../../src/components/ManageRow', () => {
  const ReactLib = require('react');
  const { Pressable, Text } = require('react-native');

  const ManageRow = ({
    isCurrent,
    onPress,
    subtitle,
    title,
  }: {
    isCurrent?: boolean;
    onPress?: () => void;
    subtitle?: string;
    title: string;
  }) =>
    ReactLib.createElement(
      Pressable,
      { onPress, testID: `session-row-${title}` },
      ReactLib.createElement(Text, null, `${title}|${subtitle}|${isCurrent ? 'current' : ''}`),
    );

  return {
    ManageCard: ({ children }: { children?: React.ReactNode }) =>
      ReactLib.createElement(ReactLib.Fragment, null, children),
    ManageRow,
  };
});

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Pressable, Text, View } = require('react-native');

  const passthrough = (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  const SwipeAction = ({
    children,
    rightActions = [],
  }: {
    children?: React.ReactNode;
    rightActions?: { key: string; actionText?: string; onPress?: () => void }[];
  }) =>
    ReactLib.createElement(
      View,
      null,
      ...rightActions.map(action =>
        ReactLib.createElement(
          Pressable,
          { key: action.key, onPress: action.onPress, testID: `swipe-${action.key}` },
          ReactLib.createElement(Text, null, action.actionText ?? ''),
        ),
      ),
      children,
    );

  const MockEmpty = ({ titleText, descriptionText }: { titleText?: string; descriptionText?: string }) =>
    ReactLib.createElement(Text, { testID: 'session-list-empty' }, titleText ?? descriptionText);

  const MockLoading = ({ text }: { text?: string }) =>
    ReactLib.createElement(Text, { testID: 'session-list-loading' }, text ?? 'loading');

  return {
    Column: passthrough(View),
    Empty: MockEmpty,
    Icon: () => null,
    Loading: MockLoading,
    Row: passthrough(View),
    SwipeAction,
    Text: passthrough(Text),
  };
});

jest.mock('phosphor-react-native', () => {
  const ReactLib = require('react');
  const MockIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockPhosphorIcon', props);
  return new Proxy({ __esModule: true }, { get: () => MockIcon });
});

const THREADS: AgentThreadRow[] = [
  { id: 1, booksId: 1, title: '本月支出', providerId: 0, modelId: '', createdTime: 0, updatedTime: 1_700_000_000_000 },
  { id: 2, booksId: 1, title: '', providerId: 0, modelId: '', createdTime: 0, updatedTime: 1_700_000_600_000 },
];

function collectText(nodes: readonly unknown[]): string {
  return nodes
    .map(node => {
      if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
      }
      if (!node || typeof node !== 'object') {
        return '';
      }
      return collectText(((node as { children?: unknown[] }).children) ?? []);
    })
    .join(' ');
}

function renderedText(renderer: TestRenderer.ReactTestRenderer): string {
  const root = renderer.toJSON();
  return collectText(root === null ? [] : Array.isArray(root) ? root : [root]);
}

function renderList(overrides: Partial<React.ComponentProps<typeof AgentSessionList>> = {}) {
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <AgentSessionList
        currentThreadId={1}
        onDelete={jest.fn()}
        onSelect={jest.fn()}
        threads={THREADS}
        {...overrides}
      />,
    );
  });
  return renderer!;
}

describe('AgentSessionList', () => {
  it('renders the fallback title and marks the current session', () => {
    const text = renderedText(renderList());

    expect(text).toContain('本月支出');
    expect(text).toContain('新对话');
    expect(text).toContain(dayjs(THREADS[0]!.updatedTime).format('MM-DD HH:mm'));
    expect(text).toContain('current');
  });

  it('calls onSelect with the pressed session', () => {
    const onSelect = jest.fn();
    const renderer = renderList({ onSelect });

    act(() => {
      renderer.root.findByProps({ testID: 'session-row-本月支出' }).props.onPress();
    });

    expect(onSelect).toHaveBeenCalledWith(THREADS[0]);
  });

  it('calls onDelete with the swiped session', () => {
    const onDelete = jest.fn();
    const renderer = renderList({ onDelete });

    act(() => {
      renderer.root.findAllByProps({ testID: 'swipe-delete' })[0]!.props.onPress();
    });

    expect(onDelete).toHaveBeenCalledWith(THREADS[0]);
  });

  it('shows an empty state when the book has no sessions', () => {
    const renderer = renderList({ threads: [] });

    expect(renderer.root.findByProps({ testID: 'session-list-empty' })).toBeTruthy();
  });
});
