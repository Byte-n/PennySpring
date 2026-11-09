import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import type { QuickTemplate } from '../src/screens/quickTemplate/types';

const mockList = jest.fn();
const mockApi = { quickTemplate: { list: mockList } };

let mockBookId: number | null = null;
let mockBookKey: string | null = null;
let mockTemplateVersion = 0;

jest.mock('../src/stores/bookStore', () => ({
  useBookKey: () => mockBookKey,
  useCurrentBookId: () => mockBookId,
  useGlobalApi: () => mockApi,
}));

jest.mock('../src/stores/syncVersionStore', () => ({
  useSyncVersionStore: (
    selector: (state: { templateVersion: number }) => unknown,
  ) => selector({ templateVersion: mockTemplateVersion }),
}));

import { useQuickTemplates } from '../src/screens/quickTemplate/useQuickTemplates';

function template(id: number): QuickTemplate {
  return {
    id,
    booksId: mockBookId ?? 1,
    name: `模板${id}`,
    typeCategory: 'expense',
    typeId: 1,
    amount: 100,
    charge: 0,
    remark: '',
    assetId: 0,
    intoAssetId: 0,
    reimbursable: false,
    tagIds: [],
    icon: '',
    sort: id,
    createdTime: 0,
    updatedTime: 0,
  } as QuickTemplate;
}

interface HookSnapshot {
  booksId: number | null;
  error: boolean;
  templates: QuickTemplate[];
  refresh: () => void;
}

let latest: HookSnapshot | null = null;

function Probe({ tick = 0 }: { tick?: number }): React.ReactElement {
  const result = useQuickTemplates();
  latest = result as unknown as HookSnapshot;
  return (
    <Text>{`${result.booksId ?? 'null'}|${result.templates.length}|${
      result.error ? 'error' : 'ok'
    }|${tick}`}</Text>
  );
}

function readSnapshot(renderer: TestRenderer.ReactTestRenderer): string {
  return renderer.root.findByType(Text).props.children as string;
}

async function renderProbe(): Promise<TestRenderer.ReactTestRenderer> {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<Probe />);
  });
  await act(async () => undefined);
  return renderer;
}

describe('useQuickTemplates 数据加载', () => {
  beforeEach(() => {
    mockBookId = null;
    mockBookKey = null;
    mockTemplateVersion = 0;
    latest = null;
    mockList.mockReset();
  });

  it('returns an empty list without querying when no book is selected', async () => {
    const renderer = await renderProbe();

    expect(mockList).not.toHaveBeenCalled();
    expect(readSnapshot(renderer)).toBe('null|0|ok|0');
  });

  it('loads templates for the current book', async () => {
    mockBookId = 5;
    mockBookKey = 'local:5';
    mockList.mockResolvedValue([template(1), template(2)]);

    const renderer = await renderProbe();

    expect(mockList).toHaveBeenCalledWith(5);
    expect(readSnapshot(renderer)).toBe('5|2|ok|0');
  });

  it('surfaces a load failure instead of an empty success', async () => {
    mockBookId = 5;
    mockBookKey = 'local:5';
    mockList.mockRejectedValue(new Error('网络不可达'));

    const renderer = await renderProbe();

    expect(readSnapshot(renderer)).toBe('5|0|error|0');
  });

  it('reloads templates when the current book changes', async () => {
    mockBookId = 1;
    mockBookKey = 'local:1';
    mockList.mockResolvedValue([template(1)]);

    const renderer = await renderProbe();
    expect(mockList).toHaveBeenLastCalledWith(1);

    mockBookId = 2;
    mockBookKey = 'local:2';
    mockList.mockResolvedValue([template(2), template(3)]);

    await act(async () => {
      renderer.update(<Probe tick={1} />);
    });
    await act(async () => undefined);

    expect(mockList).toHaveBeenLastCalledWith(2);
    expect(readSnapshot(renderer)).toBe('2|2|ok|1');
  });

  it('clears the failure after a successful retry', async () => {
    mockBookId = 5;
    mockBookKey = 'local:5';
    mockList
      .mockRejectedValueOnce(new Error('网络不可达'))
      .mockResolvedValueOnce([template(1)]);

    const renderer = await renderProbe();
    expect(readSnapshot(renderer)).toBe('5|0|error|0');

    await act(async () => {
      latest?.refresh();
    });
    await act(async () => undefined);

    expect(readSnapshot(renderer)).toBe('5|1|ok|0');
  });
});
