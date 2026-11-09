import { parseQuickTemplateRecordTaskData } from '../../src/features/quickTemplateWidget/taskData';

describe('quick template record task data', () => {
  test('parses a local book ref from a JSON string', () => {
    const parsed = parseQuickTemplateRecordTaskData({
      requestId: 'request-1',
      templateId: 7,
      bookRef: JSON.stringify({
        kind: 'local',
        serverUrl: '',
        booksId: 2,
        bookName: '日常账本',
      }),
    });

    expect(parsed.requestId).toBe('request-1');
    expect(parsed.templateId).toBe(7);
    expect(parsed.target).toEqual({
      kind: 'local',
      serverUrl: '',
      booksId: 2,
      bookName: '日常账本',
    });
  });

  test('parses a remote book ref from an object', () => {
    const parsed = parseQuickTemplateRecordTaskData({
      requestId: 'request-2',
      templateId: 9,
      bookRef: {
        kind: 'remote',
        serverUrl: 'https://example.com',
        booksId: 3,
        bookName: '工作账本',
      },
    });

    expect(parsed.target.kind).toBe('remote');
    expect(parsed.target.serverUrl).toBe('https://example.com');
    expect(parsed.target.booksId).toBe(3);
  });

  test('rejects a missing request id', () => {
    expect(() =>
      parseQuickTemplateRecordTaskData({
        templateId: 1,
        bookRef: { kind: 'local', booksId: 1 },
      }),
    ).toThrow('Headless 参数 requestId 缺失或格式不正确');
  });

  test('rejects an invalid template id', () => {
    expect(() =>
      parseQuickTemplateRecordTaskData({
        requestId: 'request-3',
        templateId: 0,
        bookRef: { kind: 'local', booksId: 1 },
      }),
    ).toThrow('Headless 参数 templateId 格式不正确');
  });

  test('rejects a remote book without a server url', () => {
    expect(() =>
      parseQuickTemplateRecordTaskData({
        requestId: 'request-4',
        templateId: 1,
        bookRef: {
          kind: 'remote',
          serverUrl: '',
          booksId: 1,
        },
      }),
    ).toThrow('Headless 参数 bookRef 格式不正确');
  });
});
