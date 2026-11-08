import {
  applyQuickBookDraftStreamEvent,
  beginQuickBookDraftProgress,
  clearQuickBookDraftProgress,
  EMPTY_QUICK_BOOK_DRAFT_PROGRESS,
  reduceQuickBookDraftProgress,
  useQuickBookDraftProgressStore,
  type QuickBookDraftProgress,
  type QuickBookDraftStreamEvent,
} from '../../src/features/quickBookDraft/draftProgress';

function reduceAll(
  events: readonly QuickBookDraftStreamEvent[],
  progress: QuickBookDraftProgress = EMPTY_QUICK_BOOK_DRAFT_PROGRESS,
): QuickBookDraftProgress {
  return events.reduce(
    (current, event, index) =>
      reduceQuickBookDraftProgress(current, event, index + 1),
    progress,
  );
}

beforeEach(() => {
  useQuickBookDraftProgressStore.setState({ progressById: {} });
});

describe('reduceQuickBookDraftProgress', () => {
  it('keeps reasoning, text and tool parts in stream order', () => {
    const progress = reduceAll([
      { type: 'reasoning-start', id: 'r1' },
      { type: 'reasoning-delta', id: 'r1', text: '先看金额' },
      { type: 'reasoning-end', id: 'r1' },
      { type: 'text-start', id: 't1' },
      { type: 'text-delta', id: 't1', text: '识别到两笔' },
      { type: 'text-end', id: 't1' },
      {
        type: 'tool-call',
        toolCallId: 'call-1',
        toolName: 'saveRecordDrafts',
      },
    ]);

    expect(progress.parts).toEqual([
      { type: 'reasoning', id: 'r1', text: '先看金额', isDone: true },
      { type: 'text', id: 't1', text: '识别到两笔', isDone: true },
      {
        type: 'tool',
        toolCallId: 'call-1',
        toolName: 'saveRecordDrafts',
        status: 'running',
      },
    ]);
  });

  it('merges deltas into the same open part', () => {
    const progress = reduceAll([
      { type: 'text-start', id: 't1' },
      { type: 'text-delta', id: 't1', text: '午餐' },
      { type: 'text-delta', id: 't1', text: '两笔' },
    ]);

    expect(progress.parts).toEqual([
      { type: 'text', id: 't1', text: '午餐两笔', isDone: false },
    ]);
  });

  it('creates a new part when a reused id starts again after completion', () => {
    const progress = reduceAll([
      { type: 'reasoning-start', id: 'r1' },
      { type: 'reasoning-delta', id: 'r1', text: '第一轮' },
      { type: 'reasoning-end', id: 'r1' },
      { type: 'reasoning-start', id: 'r1' },
      { type: 'reasoning-delta', id: 'r1', text: '第二轮' },
    ]);

    expect(progress.parts).toEqual([
      { type: 'reasoning', id: 'r1', text: '第一轮', isDone: true },
      { type: 'reasoning', id: 'r1', text: '第二轮', isDone: false },
    ]);
  });

  it('marks a matching tool call as done when its result arrives', () => {
    const progress = reduceAll([
      { type: 'tool-call', toolCallId: 'call-1', toolName: 'listTypes' },
      { type: 'tool-result', toolCallId: 'call-1' },
    ]);

    expect(progress.parts).toEqual([
      {
        type: 'tool',
        toolCallId: 'call-1',
        toolName: 'listTypes',
        status: 'done',
      },
    ]);
  });

  it('shows a tool as preparing while its input streams', () => {
    const progress = reduceAll([
      {
        type: 'tool-input-start',
        toolCallId: 'call-1',
        toolName: 'saveRecordDrafts',
      },
      {
        type: 'tool-input',
        toolCallId: 'call-1',
        toolName: 'saveRecordDrafts',
        summary: '午餐两笔',
        itemCount: 2,
      },
      { type: 'tool-call', toolCallId: 'call-1', toolName: 'saveRecordDrafts' },
    ]);

    expect(progress.parts).toEqual([
      {
        type: 'tool',
        toolCallId: 'call-1',
        toolName: 'saveRecordDrafts',
        status: 'running',
        summary: '午餐两笔',
        itemCount: 2,
      },
    ]);
  });

  it('creates a preparing tool part when only its input preview arrives', () => {
    const progress = reduceAll([
      {
        type: 'tool-input',
        toolCallId: 'call-1',
        toolName: 'saveRecordDrafts',
        summary: '两笔午餐',
        itemCount: 2,
      },
    ]);

    expect(progress.parts).toEqual([
      {
        type: 'tool',
        toolCallId: 'call-1',
        toolName: 'saveRecordDrafts',
        status: 'preparing',
        summary: '两笔午餐',
        itemCount: 2,
      },
    ]);
  });

  it('marks a matching tool call as failed when an error arrives', () => {
    const progress = reduceAll([
      { type: 'tool-call', toolCallId: 'call-1', toolName: 'listTypes' },
      { type: 'tool-error', toolCallId: 'call-1' },
    ]);

    expect(progress.parts).toEqual([
      {
        type: 'tool',
        toolCallId: 'call-1',
        toolName: 'listTypes',
        status: 'error',
      },
    ]);
  });

  it('returns the same progress object when an event changes nothing', () => {
    const progress = reduceAll([
      { type: 'text-start', id: 't1' },
      { type: 'text-delta', id: 't1', text: '内容' },
    ]);

    expect(
      reduceQuickBookDraftProgress(progress, {
        type: 'text-delta',
        id: 't1',
        text: '',
      }),
    ).toBe(progress);
    expect(
      reduceQuickBookDraftProgress(progress, {
        type: 'tool-result',
        toolCallId: 'missing',
      }),
    ).toBe(progress);
  });
});

describe('quick book draft progress store', () => {
  it('resets the previous parts when a new run begins', () => {
    beginQuickBookDraftProgress('draft-1');
    applyQuickBookDraftStreamEvent('draft-1', {
      type: 'text-start',
      id: 't1',
    });
    applyQuickBookDraftStreamEvent('draft-1', {
      type: 'text-delta',
      id: 't1',
      text: '旧内容',
    });

    beginQuickBookDraftProgress('draft-1');

    expect(
      useQuickBookDraftProgressStore.getState().progressById['draft-1'],
    ).toBe(EMPTY_QUICK_BOOK_DRAFT_PROGRESS);
  });

  it('clears only the requested draft', () => {
    beginQuickBookDraftProgress('draft-1');
    beginQuickBookDraftProgress('draft-2');

    clearQuickBookDraftProgress('draft-1');

    const progressById = useQuickBookDraftProgressStore.getState().progressById;
    expect(progressById['draft-1']).toBeUndefined();
    expect(progressById['draft-2']).toBe(EMPTY_QUICK_BOOK_DRAFT_PROGRESS);
  });
});
