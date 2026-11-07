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

describe('parseQuickBookDraftTaskData', () => {
  it('keeps a valid share source', () => {
    expect(
      parseQuickBookDraftTaskData({ ...BASE_DATA, source: 'share' }),
    ).toEqual({ ...BASE_DATA, source: 'share' });
  });

  it('allows omitting source for floating ball captures', () => {
    expect(parseQuickBookDraftTaskData(BASE_DATA)).toEqual(BASE_DATA);
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

  it('forwards the share source to the draft runner', async () => {
    await QuickBookDraftTask({ ...BASE_DATA, source: 'share' });

    expect(mockedRunQuickBookDraft).toHaveBeenCalledWith({
      ...BASE_DATA,
      source: 'share',
    });
  });
});
