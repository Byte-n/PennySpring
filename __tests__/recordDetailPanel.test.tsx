import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

const mockGetDetailById = jest.fn();
const mockApi = {
  record: { getDetailById: mockGetDetailById },
  type: { getAll: jest.fn() },
  asset: { getByBook: jest.fn() },
  tag: { getAll: jest.fn() },
};

jest.mock('../src/stores/bookStore', () => ({
  useBookStore: (selector: (state: unknown) => unknown) =>
    selector({ currentBook: { id: 1 } }),
  useBookKey: () => 'local:1',
  useCurrentBookId: () => 1,
  useGlobalApi: () => mockApi,
}));

jest.mock('../src/screens/home/tabs/detail/recordDetailStyles', () => ({
  useRecordDetailStyles: () => ({}),
}));

jest.mock('../src/screens/home/tabs/detail/RecordDetailContent', () => {
  const ReactLib = require('react');
  const { Text } = require('react-native');
  return {
    RecordDetailContent: () => ReactLib.createElement(Text, null, '详情内容'),
  };
});

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text, View: NativeView } = require('react-native');
  const passthrough = ({ children }: { children?: React.ReactNode }) =>
    ReactLib.createElement(NativeView, null, children);

  return {
    Button: passthrough,
    Empty: passthrough,
    Loading: passthrough,
    Popup: { FloatingPanel: passthrough },
    Row: passthrough,
    Text: ({ children }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Text, null, children),
  };
});

import { RecordDetailPanel } from '../src/screens/home/tabs/detail/RecordDetailPanel';

const RECORD_DETAIL = {
  record: {
    id: 9,
    booksId: 1,
    typeId: 2,
    assetId: 3,
    intoAssetId: 0,
    recordTime: new Date(2026, 9, 30).getTime(),
    amount: 1000,
    finalAmount: 1000,
    charge: 0,
    remark: '晚餐',
    reimbursable: 'notReimbursable',
    createdTime: new Date(2026, 9, 30).getTime(),
    updatedTime: new Date(2026, 9, 30).getTime(),
  },
  tagIds: [],
  imagePaths: [],
  relatedRecordIds: [],
};

async function renderPanel(open: boolean) {
  let renderer: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <RecordDetailPanel
        recordId={9}
        open={open}
        onOpenChange={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  return renderer!;
}

describe('RecordDetailPanel', () => {
  beforeEach(() => {
    mockGetDetailById.mockReset().mockResolvedValue(RECORD_DETAIL);
    mockApi.type.getAll.mockReset().mockResolvedValue([]);
    mockApi.asset.getByBook.mockReset().mockResolvedValue([]);
    mockApi.tag.getAll.mockReset().mockResolvedValue([]);
  });

  it('does not load record details while the panel is closed', async () => {
    const renderer = await renderPanel(false);

    expect(mockGetDetailById).not.toHaveBeenCalled();

    act(() => renderer.unmount());
  });

  it('loads record details by id when the panel opens', async () => {
    const renderer = await renderPanel(true);

    expect(mockGetDetailById).toHaveBeenCalledWith(9, 1);
    expect(
      renderer.root.findAllByType(RNText).map(node => node.props.children),
    ).toContain('详情内容');

    act(() => renderer.unmount());
  });
});
