import type { Api, RecordDetail } from '@pennyspring/api';

import {
  createDeleteRecordsTool,
  type DeleteRecordsToolDeps,
} from '../../src/agent/tools/deleteRecords';

function recordDetail(recordId: number): RecordDetail {
  return {
    record: {
      id: recordId,
      typeId: 2,
      assetId: 0,
      intoAssetId: 0,
      booksId: 1,
      amount: 3000,
      finalAmount: 3000,
      charge: 0,
      remark: '',
      reimbursable: 0,
      recordTime: 0,
      createdTime: 0,
      updatedTime: 0,
    },
    tagIds: [],
    imagePaths: [],
    relatedRecordIds: [],
  } as unknown as RecordDetail;
}

function createApi(
  overrides: {
    detail?: jest.Mock;
    deleteMany?: jest.Mock;
  } = {},
): Api {
  return {
    record: {
      getDetailById:
        overrides.detail ??
        jest.fn(async (recordId: number) => recordDetail(recordId)),
      deleteMany: overrides.deleteMany ?? jest.fn(async () => undefined),
    },
  } as unknown as Api;
}

function createExecute(
  api: Api,
  overrides: Omit<DeleteRecordsToolDeps, 'api' | 'booksId'> = {},
) {
  const created = createDeleteRecordsTool({ api, booksId: 1, ...overrides });
  return created.execute as (
    input: Record<string, unknown>,
    options: unknown,
  ) => Promise<unknown>;
}

describe('createDeleteRecordsTool', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes the whole batch after verifying every record exists', async () => {
    const detail = jest.fn(async (recordId: number) => recordDetail(recordId));
    const deleteMany = jest.fn(async () => undefined);
    const execute = createExecute(createApi({ detail, deleteMany }));

    const output = await execute({ recordIds: [100, 101] }, {});

    expect(detail.mock.calls.map(call => call[0])).toEqual([100, 101]);
    expect(deleteMany).toHaveBeenCalledWith([100, 101], 1);
    expect(output).toEqual({
      ok: true,
      count: 2,
      recordIds: [100, 101],
    });
  });

  it('does not delete when any record cannot be read', async () => {
    const detail = jest.fn(async (recordId: number) => {
      if (recordId === 101) throw new Error('记录不存在: 101');
      return recordDetail(recordId);
    });
    const deleteMany = jest.fn();
    const execute = createExecute(createApi({ detail, deleteMany }));

    await expect(execute({ recordIds: [100, 101] }, {})).rejects.toThrow(
      '工具 deleteRecords 执行失败：记录不存在: 101',
    );
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('rejects duplicate ids before reading or deleting', async () => {
    const detail = jest.fn(async () => recordDetail(100));
    const deleteMany = jest.fn();
    const execute = createExecute(createApi({ detail, deleteMany }));

    await expect(execute({ recordIds: [100, 100] }, {})).rejects.toThrow(
      'recordIds 不能包含重复的记录 id',
    );
    expect(detail).not.toHaveBeenCalled();
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('wraps delete failures with the tool name', async () => {
    const deleteMany = jest.fn(async () => {
      throw new Error('database locked');
    });
    const execute = createExecute(createApi({ deleteMany }));

    await expect(execute({ recordIds: [100] }, {})).rejects.toThrow(
      '工具 deleteRecords 执行失败：database locked',
    );
  });

  it('notifies after the whole batch is deleted', async () => {
    const onRecordsChanged = jest.fn();
    const execute = createExecute(createApi(), { onRecordsChanged });

    await execute({ recordIds: [100] }, {});

    expect(onRecordsChanged).toHaveBeenCalledTimes(1);
  });

  it('does not notify when the delete is rejected', async () => {
    const onRecordsChanged = jest.fn();
    const execute = createExecute(
      createApi({
        deleteMany: jest.fn(async () => {
          throw new Error('database locked');
        }),
      }),
      { onRecordsChanged },
    );

    await expect(execute({ recordIds: [100] }, {})).rejects.toThrow(
      '工具 deleteRecords 执行失败：database locked',
    );
    expect(onRecordsChanged).not.toHaveBeenCalled();
  });
});
