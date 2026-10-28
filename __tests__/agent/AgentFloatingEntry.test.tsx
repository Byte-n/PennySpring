import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

interface MockedAction {
  key: string;
  onPress: () => void;
}

interface MockedFloatingActionGroupProps {
  actions?: MockedAction[];
}

interface MockedDrawerProps {
  open?: boolean;
}

const mockFloatingGroups: MockedFloatingActionGroupProps[] = [];
const mockDrawers: MockedDrawerProps[] = [];
const mockBookStoreState: {
  currentBook: { id: number } | null;
  currentBookRef: { kind: string } | null;
} = {
  currentBook: { id: 1 },
  currentBookRef: { kind: 'local' },
};

jest.mock('@pennyspring/ui', () => ({
  FloatingActionGroup: (props: MockedFloatingActionGroupProps) => {
    mockFloatingGroups.push(props);
    return null;
  },
}));

jest.mock('@pennyspring/theme', () => ({
  useTheme: () => ({
    token: { paddingLG: 24, controlHeight: 44, paddingXS: 8 },
  }),
}));

jest.mock('phosphor-react-native', () => {
  const ReactLib = require('react');
  const MockPhosphorIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockPhosphorIcon', props);
  return new Proxy({ __esModule: true }, { get: () => MockPhosphorIcon });
});

jest.mock('../../src/stores/bookStore', () => ({
  useBookStore: (
    selector: (state: typeof mockBookStoreState) => unknown,
  ) => selector(mockBookStoreState),
}));

jest.mock('../../src/agent/adapters/configStore', () => ({
  getAgentConfig: () => ({ baseUrl: '', model: '' }),
  rehydrateAgentConfig: () => Promise.resolve(),
}));

jest.mock('../../src/agent/adapters/secureKey', () => ({
  loadApiKey: () => Promise.resolve(''),
}));

jest.mock('../../src/agent/ui/useAgentChat', () => ({
  useAgentChat: () => ({
    clear: jest.fn(),
    usage: { inputTokens: 0, outputTokens: 0 },
  }),
}));

jest.mock('../../src/agent/ui/AgentDrawer', () => ({
  AgentDrawer: (props: MockedDrawerProps) => {
    mockDrawers.push(props);
    return null;
  },
}));

jest.mock('../../src/agent/ui/AgentSettingsPanel', () => ({
  AgentSettingsPanel: () => null,
}));

import { AgentFloatingEntry } from '../../src/agent/ui/AgentFloatingEntry';
import { AgentRoot } from '../../src/agent/ui/AgentRoot';

function HomeLikeScreen() {
  return <AgentFloatingEntry />;
}

function findAgentAction(): MockedAction | undefined {
  return mockFloatingGroups
    .flatMap(group => group.actions ?? [])
    .find(action => action.key === 'agent');
}

function lastDrawerProps(): MockedDrawerProps {
  return mockDrawers[mockDrawers.length - 1];
}

async function renderWithEntry(): Promise<TestRenderer.ReactTestRenderer> {
  let renderer!: TestRenderer.ReactTestRenderer;

  await act(async () => {
    renderer = TestRenderer.create(
      <AgentRoot>
        <HomeLikeScreen />
      </AgentRoot>,
    );
  });

  return renderer;
}

beforeEach(() => {
  mockFloatingGroups.length = 0;
  mockDrawers.length = 0;
  mockBookStoreState.currentBook = { id: 1 };
  mockBookStoreState.currentBookRef = { kind: 'local' };
});

describe('首页助手悬浮入口', () => {
  it('renders the assistant entry on the first render without any navigation event', async () => {
    await renderWithEntry();

    expect(findAgentAction()).toBeTruthy();
  });

  it('opens the assistant drawer when the entry is pressed', async () => {
    await renderWithEntry();

    await act(async () => {
      findAgentAction()?.onPress();
    });

    expect(lastDrawerProps().open).toBe(true);
  });

  it('opens the assistant drawer while the book is remote', async () => {
    mockBookStoreState.currentBookRef = { kind: 'remote' };

    await renderWithEntry();

    await act(async () => {
      findAgentAction()?.onPress();
    });

    expect(lastDrawerProps().open).toBe(true);
  });
});
