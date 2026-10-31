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
  ...jest.requireMock('@pennyspring/theme'),
  FloatingActionGroup: (props: MockedFloatingActionGroupProps) => {
    mockFloatingGroups.push(props);
    return null;
  },
  Column: (props: { children?: React.ReactNode }) => props.children ?? null,
  Row: (props: { children?: React.ReactNode }) => props.children ?? null,
  Text: () => null,
  Button: () => null,
  useToast: () => ({ show: jest.fn() }),
}));

jest.mock('@pennyspring/theme', () => {
  const token = new Proxy(
    {},
    {
      get: () => 1,
    },
  );
  return {
    useTheme: () => ({ token }),
    createUseSheetStyle:
      (generator: (themeToken: unknown, options?: unknown) => unknown) =>
      (options?: unknown) =>
        generator(token, options),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('phosphor-react-native', () => {
  const ReactLib = require('react');
  const MockPhosphorIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockPhosphorIcon', props);
  return new Proxy({ __esModule: true }, { get: () => MockPhosphorIcon });
});

const mockGlobalApi = {
  provider: {
    getAll: async () => [],
    getSelection: async () => ({ providerId: 0, modelId: '' }),
    getById: async () => {
      throw new Error('provider not found');
    },
  },
  quickBook: {
    getSelection: async () => ({ providerId: 0, modelId: '' }),
  },
  credential: {
    hasKey: async () => false,
    getKey: async () => '',
  },
};

jest.mock('../../src/stores/bookStore', () => ({
  useBookStore: (
    selector: (state: typeof mockBookStoreState) => unknown,
  ) => selector(mockBookStoreState),
  useGlobalApi: () => mockGlobalApi,
}));

jest.mock('../../src/navigation', () => ({
  ROOT_ROUTES: { Home: 'Home', AgentSettings: 'AgentSettings' },
  HOME_TAB_ROUTES: { DetailTab: 'DetailTab', ChartTab: 'ChartTab' },
  rootNavigationRef: {
    isReady: () => false,
    navigate: jest.fn(),
  },
}));

jest.mock('../../src/agent/ui/useAgentSession', () => ({
  useAgentSession: () => ({
    loading: false,
    sending: false,
    errorText: '',
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    threads: [],
    threadsLoading: false,
    currentThreadId: 1,
    currentThread: null,
    sessionVersion: 0,
    initialMessages: [],
    createThread: jest.fn(),
    ensureThread: jest.fn(() => Promise.resolve(null)),
    syncDraftSelection: jest.fn(),
    ensureQuickBookThread: jest.fn(() => Promise.resolve(null)),
    selectThread: jest.fn(),
    deleteThread: jest.fn(),
    deleteCurrentThread: jest.fn(),
    refreshThreads: jest.fn(),
    updateThreadModel: jest.fn(() => Promise.resolve()),
    ensureTitle: jest.fn(),
    markActivity: jest.fn(),
    accumulateUsage: jest.fn(),
    setSending: jest.fn(),
    setErrorText: jest.fn(),
  }),
}));

jest.mock('../../src/agent/ui/AgentRuntimeHost', () => ({
  AgentRuntimeHost: (props: { drawerOpen: boolean }) => {
    mockDrawers.push({ open: props.drawerOpen });
    return null;
  },
}));

jest.mock('../../src/agent/ui/AgentDrawerFallback', () => ({
  AgentDrawerFallback: () => null,
}));

jest.mock('../../src/agent/ui/AgentSessionsPanel', () => ({
  AgentSessionsPanel: () => null,
}));

jest.mock('../../src/agent/ui/AgentProviderEditor', () => ({
  AgentProviderEditor: () => null,
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
