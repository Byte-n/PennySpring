import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

const mockGetByBook = jest.fn();
const mockGetAll = jest.fn();
const mockGlobalApi = {
  asset: { getByBook: mockGetByBook },
  tag: { getAll: mockGetAll },
};

let mockCurrentBookId: number | null = null;

jest.mock('@pennyspring/api', () => ({
  VISIBILITY: { visible: 0, hidden: 1 },
  localApi: {
    asset: { getByBook: jest.fn() },
    tag: { getAll: jest.fn() },
  },
}));

jest.mock('../src/stores/bookStore', () => ({
  useCurrentBookId: () => mockCurrentBookId,
  useGlobalApi: () => mockGlobalApi,
}));

import { localApi } from '@pennyspring/api';

import { useAddRecordResources } from '../src/screens/addRecord/useAddRecordResources';

const mockLocalGetByBook = jest.mocked(localApi.asset.getByBook);
const mockLocalGetAll = jest.mocked(localApi.tag.getAll);

function readSnapshot(renderer: TestRenderer.ReactTestRenderer): string {
  return renderer.root.findByType(Text).props.children as string;
}

let latestRefresh: (() => void) | null = null;

function Probe({ booksId }: { booksId?: number }): React.ReactElement {
  const result = useAddRecordResources(booksId);
  latestRefresh = result.refreshAssets;
  return (
    <Text>
      {`${result.booksId ?? 'undefined'}|${result.assets.length}|${
        result.visibleAssets.length
      }|${result.tags.length}|${result.assetsError ? 'asset-error' : 'asset-ok'}|${
        result.tagsError ? 'tag-error' : 'tag-ok'
      }`}
    </Text>
  );
}

async function renderProbe(
  props: { booksId?: number } = {},
): Promise<TestRenderer.ReactTestRenderer> {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<Probe {...props} />);
  });
  await act(async () => undefined);
  return renderer;
}

describe('useAddRecordResources 数据加载', () => {
  beforeEach(() => {
    mockCurrentBookId = null;
    latestRefresh = null;
    mockGetByBook.mockReset();
    mockGetAll.mockReset();
    mockLocalGetByBook.mockReset();
    mockLocalGetAll.mockReset();
  });

  it('skips dependent queries until a book is selected', async () => {
    const renderer = await renderProbe();

    expect(mockGetByBook).not.toHaveBeenCalled();
    expect(mockGetAll).not.toHaveBeenCalled();
    expect(readSnapshot(renderer)).toBe('undefined|0|0|0|asset-ok|tag-ok');
  });

  it('loads visible assets and tags for the current book', async () => {
    mockCurrentBookId = 5;
    mockGetByBook.mockResolvedValue([
      { id: 1, invisible: 0 },
      { id: 2, invisible: 1 },
    ]);
    mockGetAll.mockResolvedValue([{ id: 1 }]);

    const renderer = await renderProbe();

    expect(mockGetByBook).toHaveBeenCalledWith(5);
    expect(mockGetAll).toHaveBeenCalledWith(5);
    expect(readSnapshot(renderer)).toBe('5|2|1|1|asset-ok|tag-ok');
  });

  it('reports asset and tag failures independently', async () => {
    mockCurrentBookId = 5;
    mockGetByBook.mockRejectedValue(new Error('资产失败'));
    mockGetAll.mockRejectedValue(new Error('标签失败'));

    const renderer = await renderProbe();

    expect(readSnapshot(renderer)).toBe('5|0|0|0|asset-error|tag-error');
  });

  it('uses the fixed local book when an explicit book id is provided', async () => {
    mockCurrentBookId = 9;
    mockLocalGetByBook.mockResolvedValue([]);
    mockLocalGetAll.mockResolvedValue([
      {
        id: 3,
        booksId: 7,
        name: '标签',
        invisible: 'visible',
        icon: '',
        createdTime: 0,
        updatedTime: 0,
      },
    ]);

    const renderer = await renderProbe({ booksId: 7 });

    expect(mockLocalGetByBook).toHaveBeenCalledWith(7);
    expect(mockLocalGetAll).toHaveBeenCalledWith(7);
    expect(mockGetByBook).not.toHaveBeenCalled();
    expect(mockGetAll).not.toHaveBeenCalled();
    expect(readSnapshot(renderer)).toBe('7|0|0|1|asset-ok|tag-ok');
  });

  it('refetches both resources on retry', async () => {
    mockCurrentBookId = 5;
    mockGetByBook
      .mockRejectedValueOnce(new Error('资产失败'))
      .mockResolvedValueOnce([]);
    mockGetAll.mockResolvedValue([]);

    const renderer = await renderProbe();
    expect(readSnapshot(renderer)).toBe('5|0|0|0|asset-error|tag-ok');

    await act(async () => {
      latestRefresh?.();
    });
    await act(async () => undefined);

    expect(mockGetByBook).toHaveBeenCalledTimes(2);
    expect(readSnapshot(renderer)).toBe('5|0|0|0|asset-ok|tag-ok');
  });
});
