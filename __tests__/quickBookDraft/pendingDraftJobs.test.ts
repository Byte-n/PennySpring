jest.mock('../../src/features/quickBookDraft/native', () => ({
  ackQuickBookDraftJob: jest.fn(),
}));

jest.mock('../../src/features/quickBookDraft/draftCacheStorage', () => ({
  quickBookDraftCache: {
    getById: jest.fn(),
    createPlaceholder: jest.fn(),
    markFailed: jest.fn(),
  },
}));

import { ackQuickBookDraftJob } from '../../src/features/quickBookDraft/native';
import { quickBookDraftCache } from '../../src/features/quickBookDraft/draftCacheStorage';
import { materializeInterruptedDraftJobs } from '../../src/features/quickBookDraft/pendingDraftJobs';

const mockedAckJob = ackQuickBookDraftJob as jest.Mock;
const mockedGetById = quickBookDraftCache.getById as unknown as jest.Mock;
const mockedCreatePlaceholder =
  quickBookDraftCache.createPlaceholder as unknown as jest.Mock;
const mockedMarkFailed = quickBookDraftCache.markFailed as unknown as jest.Mock;

const ERROR_TEXT = '生成被中断，请重试';

const JOB = {
  draftId: 'draft-1',
  imagePath: '/tmp/share.jpg',
  bookRef: JSON.stringify({
    kind: 'local',
    serverUrl: '',
    booksId: 3,
    bookName: '草稿账本',
  }),
  booksId: 3,
  assetId: 0,
  typeId: 0,
  source: 'share',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedAckJob.mockResolvedValue(undefined);
  mockedGetById.mockRejectedValue(new Error('草稿不存在'));
  mockedCreatePlaceholder.mockResolvedValue({ status: 'generating' });
  mockedMarkFailed.mockResolvedValue(undefined);
});

describe('materializeInterruptedDraftJobs', () => {
  it('creates a failed draft and acks the job when the draft is missing', async () => {
    await expect(
      materializeInterruptedDraftJobs([JOB], ERROR_TEXT),
    ).resolves.toBe(1);

    expect(mockedCreatePlaceholder).toHaveBeenCalledWith({
      id: 'draft-1',
      target: {
        kind: 'local',
        serverUrl: '',
        booksId: 3,
        bookName: '草稿账本',
      },
      imagePath: '/tmp/share.jpg',
      source: 'share',
    });
    expect(mockedMarkFailed).toHaveBeenCalledWith('draft-1', ERROR_TEXT);
    expect(mockedAckJob).toHaveBeenCalledWith('draft-1');
  });

  it('keeps an existing draft untouched and acks the job', async () => {
    mockedGetById.mockResolvedValue({ id: 'draft-1' });

    await expect(
      materializeInterruptedDraftJobs([JOB], ERROR_TEXT),
    ).resolves.toBe(0);

    expect(mockedCreatePlaceholder).not.toHaveBeenCalled();
    expect(mockedMarkFailed).not.toHaveBeenCalled();
    expect(mockedAckJob).toHaveBeenCalledWith('draft-1');
  });

  it('drops an invalid job with an ack', async () => {
    await expect(
      materializeInterruptedDraftJobs(
        [{ ...JOB, source: 'unknown' }],
        ERROR_TEXT,
      ),
    ).resolves.toBe(0);

    expect(mockedCreatePlaceholder).not.toHaveBeenCalled();
    expect(mockedAckJob).toHaveBeenCalledWith('draft-1');
  });

  it('keeps the job for the next launch when placeholder creation fails', async () => {
    mockedCreatePlaceholder.mockRejectedValue(new Error('存储不可用'));

    await expect(
      materializeInterruptedDraftJobs([JOB], ERROR_TEXT),
    ).resolves.toBe(0);

    expect(mockedMarkFailed).not.toHaveBeenCalled();
    expect(mockedAckJob).not.toHaveBeenCalled();
  });

  it('keeps the preset from the journal', async () => {
    await expect(
      materializeInterruptedDraftJobs(
        [{ ...JOB, assetId: 5, typeId: 7 }],
        ERROR_TEXT,
      ),
    ).resolves.toBe(1);

    expect(mockedCreatePlaceholder).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: { assetId: 5, typeId: 7 },
      }),
    );
  });

  it('skips jobs whose draft is still live', async () => {
    await expect(
      materializeInterruptedDraftJobs([JOB], ERROR_TEXT, {
        isDraftLive: draftId => draftId === 'draft-1',
      }),
    ).resolves.toBe(0);

    expect(mockedGetById).not.toHaveBeenCalled();
    expect(mockedCreatePlaceholder).not.toHaveBeenCalled();
    expect(mockedAckJob).not.toHaveBeenCalled();
  });
});
