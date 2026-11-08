jest.mock('../../src/agent/headless/runQuickBookDraft', () => ({
  runQuickBookDraft: jest.fn(),
}));

import { runQuickBookDraft } from '../../src/agent/headless/runQuickBookDraft';
import {
  parseQuickBookDraftTaskData,
  QuickBookDraftTask,
} from '../../src/agent/headless/QuickBookDraftTask';

const mockedRunQuickBookDraft = runQuickBookDraft as jest.Mock;

const BASE_DATA = {
  draftId: 'draft-1',
  imagePath: '/tmp/share.jpg',
  booksId: 3,
};

const LOCAL_TARGET = {
  kind: 'local',
  serverUrl: '',
  booksId: 3,
  bookName: '',
};

describe('parseQuickBookDraftTaskData', () => {
  it('keeps a valid share source', () => {
    expect(
      parseQuickBookDraftTaskData({ ...BASE_DATA, source: 'share' }),
    ).toEqual({
      draftId: 'draft-1',
      imagePath: '/tmp/share.jpg',
      target: LOCAL_TARGET,
      source: 'share',
    });
  });

  it('parses a serialized remote book ref', () => {
    expect(
      parseQuickBookDraftTaskData({
        draftId: 'draft-1',
        imagePath: '/tmp/share.jpg',
        bookRef: JSON.stringify({
          kind: 'remote',
          serverUrl: 'https://example.com',
          booksId: 8,
          bookName: '网络账本',
        }),
      }),
    ).toEqual({
      draftId: 'draft-1',
      imagePath: '/tmp/share.jpg',
      target: {
        kind: 'remote',
        serverUrl: 'https://example.com',
        booksId: 8,
        bookName: '网络账本',
      },
    });
  });

  it('allows omitting source for floating ball captures', () => {
    expect(parseQuickBookDraftTaskData(BASE_DATA)).toEqual({
      draftId: 'draft-1',
      imagePath: '/tmp/share.jpg',
      target: LOCAL_TARGET,
    });
  });

  it('rejects an unknown source', () => {
    expect(() =>
      parseQuickBookDraftTaskData({ ...BASE_DATA, source: 'unknown' }),
    ).toThrow('Headless 参数 source 格式不正确');
  });
});

describe('QuickBookDraftTask', () => {
  beforeEach(() => {
    mockedRunQuickBookDraft.mockClear();
  });

  it('forwards the share source and native outcome reporting', async () => {
    await QuickBookDraftTask({ ...BASE_DATA, source: 'share' });

    expect(mockedRunQuickBookDraft).toHaveBeenCalledWith({
      draftId: 'draft-1',
      imagePath: '/tmp/share.jpg',
      target: LOCAL_TARGET,
      source: 'share',
      reportOutcome: true,
    });
  });

  it('resolves when draft generation fails so native receives the task finish', async () => {
    mockedRunQuickBookDraft.mockRejectedValueOnce(new Error('生成草稿失败'));

    await expect(QuickBookDraftTask(BASE_DATA)).resolves.toBeUndefined();
  });

  it('resolves when task data is invalid so native receives the task finish', async () => {
    await expect(QuickBookDraftTask({})).resolves.toBeUndefined();

    expect(mockedRunQuickBookDraft).not.toHaveBeenCalled();
  });
});
