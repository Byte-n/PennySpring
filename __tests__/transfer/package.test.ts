import type {
  AiConfigSnapshot,
  BookSnapshot,
  LibrarySnapshot,
} from '@pennyspring/api';

import {
  buildSnapshotPackage,
  cleanupImportedMedia,
  parseSnapshotPackage,
  prepareImportedLibrary,
  unzipSnapshotPackage,
  zipSnapshotPackage,
  type BookContentOptions,
  type TransferFileSystem,
} from '../../src/features/transfer';
import type { SettingsSnapshot } from '../../src/features/transfer/settings';
import type { NetworkBooksSnapshot } from '../../src/features/transfer/networkBooks';

const COVER_URI = 'file:///docs/cover.jpg';
const RECEIPT_URI = 'file:///docs/receipt.jpg';
const DATA_URL = 'data:image/jpeg;base64,QUJD';
const NOW = 1_700_000_000_000;

const AI_CONFIG: AiConfigSnapshot = {
  providers: [
    {
      id: 1,
      descriptorId: 'openai-compatible',
      name: '主提供商',
      baseUrl: 'https://api.example.com/v1',
      defaultModelId: 'gpt-4.1',
      models: [
        {
          modelId: 'gpt-4.1',
          contextWindow: 200_000,
          reasoningEffort: 'off',
          multimodal: true,
        },
      ],
      storeResponses: true,
      apiKey: 'sk-package',
    },
  ],
  agentSelection: { providerId: 1, modelId: 'gpt-4.1' },
  quickBookSelection: { providerId: 0, modelId: '' },
};

const SETTINGS: SettingsSnapshot = {
  quickBook: {
    freshWindowSeconds: 90,
    presetPrompt: '请识别截图中的消费信息',
    nudgeEnabled: true,
    autoApproveScreenshot: false,
  },
  theme: { themeMode: 'dark', themePreset: 'kaori' },
};

const NETWORK_BOOKS: NetworkBooksSnapshot = {
  servers: [{ serverUrl: 'http://192.168.1.10:8787', token: 'token-a' }],
  refs: [{ serverUrl: 'http://192.168.1.10:8787', bookId: 3 }],
};

function contentOptions(
  includeImages: boolean,
  includeAgent: boolean,
  includeAiConfig = false,
): Record<number, BookContentOptions> {
  return { 1: { includeImages, includeAgent, includeAiConfig } };
}

class MemoryFileSystem implements TransferFileSystem {
  readonly readFiles = new Map<string, string>([
    [COVER_URI, 'Q09WRVI='],
    [RECEIPT_URI, 'UkVDRUlQVA=='],
  ]);
  readonly written: string[] = [];
  readonly deleted: string[] = [];

  async readBase64(uri: string): Promise<string> {
    const value = this.readFiles.get(uri);
    if (value === undefined) throw new Error(`missing file: ${uri}`);
    return value;
  }

  async writeBase64ToDocuments(
    fileName: string,
    base64: string,
  ): Promise<string> {
    const uri = `file:///docs/${fileName}`;
    this.readFiles.set(uri, base64);
    this.written.push(uri);
    return uri;
  }

  async delete(uri: string): Promise<void> {
    this.readFiles.delete(uri);
    this.deleted.push(uri);
  }
}

function makeBook(): BookSnapshot {
  return {
    book: {
      id: 1,
      name: '家庭账本',
      description: '家庭日常',
      background: COVER_URI,
      createdTime: NOW,
      updatedTime: NOW,
    },
    types: [
      {
        id: 1,
        booksId: 1,
        parentId: 0,
        name: '餐饮',
        icon: 'ForkKnife',
        typeCategory: 'expense',
        isSystem: 'system',
        specialBehavior: '',
        sort: 1,
        createdTime: NOW,
        updatedTime: NOW,
      },
    ],
    assets: [
      {
        id: 1,
        booksId: 1,
        name: '储蓄卡',
        balance: 100_000,
        totalAmount: 0,
        billingDate: 0,
        repaymentDate: 0,
        type: 'capital_account',
        classification: 'debit_card',
        invisible: 'visible',
        openBank: '',
        cardNo: '',
        remark: '',
        sort: 1,
        createdTime: NOW,
        updatedTime: NOW,
      },
    ],
    tags: [
      {
        id: 1,
        booksId: 1,
        name: '旅行',
        invisible: 'visible',
        icon: 'Airplane',
        createdTime: NOW,
        updatedTime: NOW,
      },
    ],
    records: [
      {
        id: 1,
        typeId: 1,
        assetId: 1,
        intoAssetId: 0,
        booksId: 1,
        amount: 1_000,
        finalAmount: 1_000,
        charge: 0,
        remark: '午餐',
        reimbursable: 'none',
        recordTime: NOW,
        createdTime: NOW,
        updatedTime: NOW,
      },
    ],
    recordRelations: [],
    tagRelations: [],
    images: [
      {
        id: 1,
        recordId: 1,
        imagePath: RECEIPT_URI,
        createdTime: NOW,
        updatedTime: NOW,
      },
    ],
    quickTemplates: [
      {
        id: 1,
        booksId: 1,
        name: '午餐',
        typeCategory: 'expense',
        typeId: 1,
        amount: 1_000,
        charge: 0,
        remark: '',
        assetId: 1,
        intoAssetId: 0,
        reimbursable: false,
        tagIds: [1],
        icon: 'ForkKnife',
        sort: 1,
        createdTime: NOW,
        updatedTime: NOW,
      },
    ],
    agentThreads: [
      {
        id: 1,
        booksId: 1,
        title: '餐饮分析',
        providerId: 5,
        modelId: 'model-x',
        createdTime: NOW,
        updatedTime: NOW,
      },
    ],
    agentMessages: [
      {
        id: 1,
        threadId: 1,
        role: 'user',
        message: JSON.stringify({
          id: 'm1',
          role: 'user',
          parts: [
            {
              type: 'file',
              mediaType: 'image/jpeg',
              filename: 'photo.jpg',
              url: DATA_URL,
            },
            { type: 'text', text: '看这张图' },
          ],
          metadata: {
            attachments: [
              {
                id: 'att1',
                ref: RECEIPT_URI,
                localPath: RECEIPT_URI,
                mediaType: 'image/jpeg',
                filename: 'receipt.jpg',
              },
            ],
          },
        }),
        usage: '{"inputTokens":1}',
        createdTime: NOW,
        updatedTime: NOW,
      },
    ],
  };
}

function makeLibrary(): LibrarySnapshot {
  return { books: [makeBook()] };
}

describe('snapshot package', () => {
  it('builds a manifest, rewrites media refs, and round-trips through zip', async () => {
    const fs = new MemoryFileSystem();
    const pkg = await buildSnapshotPackage(
      makeLibrary(),
      {
        bookOptions: contentOptions(true, true),
        appVersion: 'test',
        createdAt: NOW,
      },
      fs,
    );

    expect(pkg.manifest).toMatchObject({
      format: 'pennyspring.snapshot',
      formatVersion: 2,
      appVersion: 'test',
      scope: 'book',
      media: { count: 3, totalBytes: 15 },
      options: { includeSettings: false, includeNetworkBooks: false },
    });
    expect(pkg.manifest.books[0]).toMatchObject({
      key: 'b1',
      name: '家庭账本',
      recordRange: [NOW, NOW],
      options: {
        includeImages: true,
        includeAgent: true,
        includeAiConfig: false,
      },
    });
    expect(pkg.manifest.books[0]?.counts.records).toBe(1);

    const bookJson = JSON.parse(
      new TextDecoder().decode(pkg.files['books/b1/book.json']),
    );
    const imagesJson = JSON.parse(
      new TextDecoder().decode(pkg.files['books/b1/images.json']),
    );
    const messagesJson = JSON.parse(
      new TextDecoder().decode(pkg.files['books/b1/agent-messages.json']),
    );
    expect(bookJson.background).toBe('media:m1.jpg');
    expect(imagesJson[0].imagePath).toBe('media:m2.jpg');
    expect(messagesJson[0].message).toContain('media:m2.jpg');
    expect(messagesJson[0].message).toContain('media:m3.jpg');
    expect(messagesJson[0].message).not.toContain(RECEIPT_URI);
    expect(messagesJson[0].message).not.toContain('localPath');

    const zipped = await zipSnapshotPackage(pkg.files);
    const parsed = await parseSnapshotPackage(zipped);
    expect(parsed.manifest.media.count).toBe(3);
    expect(Object.keys(parsed.mediaFiles).sort()).toEqual([
      'm1.jpg',
      'm2.jpg',
      'm3.jpg',
    ]);
    expect(parsed.library.books[0]?.book.background).toBe('media:m1.jpg');
    expect(parsed.library.books[0]?.images[0]?.imagePath).toBe('media:m2.jpg');
  });

  it('prepares imported media and cleans it up', async () => {
    const fs = new MemoryFileSystem();
    const pkg = await buildSnapshotPackage(
      makeLibrary(),
      { bookOptions: contentOptions(true, true), createdAt: NOW },
      fs,
    );
    const parsed = await parseSnapshotPackage(
      await zipSnapshotPackage(pkg.files),
    );
    const importedFs = new MemoryFileSystem();
    const prepared = await prepareImportedLibrary(parsed, importedFs);

    expect(prepared.mediaUris).toHaveLength(3);
    expect(prepared.library.books[0]?.book.background).toMatch(
      /^file:\/\/\/docs\/ps-import-/,
    );
    expect(prepared.library.books[0]?.images[0]?.imagePath).toMatch(
      /^file:\/\/\/docs\/ps-import-/,
    );
    expect(prepared.library.books[0]?.agentMessages[0]?.message).not.toContain(
      'media:',
    );
    expect(importedFs.written).toHaveLength(3);

    await cleanupImportedMedia(prepared.mediaUris, importedFs);
    expect(importedFs.deleted).toHaveLength(3);
  });

  it('clears book images when includeImages is false but keeps AI text media', async () => {
    const fs = new MemoryFileSystem();
    const pkg = await buildSnapshotPackage(
      makeLibrary(),
      { bookOptions: contentOptions(false, true), createdAt: NOW },
      fs,
    );

    const bookJson = JSON.parse(
      new TextDecoder().decode(pkg.files['books/b1/book.json']),
    );
    const imagesJson = JSON.parse(
      new TextDecoder().decode(pkg.files['books/b1/images.json']),
    );
    expect(bookJson.background).toBe('');
    expect(imagesJson).toEqual([]);
    expect(pkg.manifest.media.count).toBe(2);
  });

  it('drops agent rows when includeAgent is false', async () => {
    const fs = new MemoryFileSystem();
    const pkg = await buildSnapshotPackage(
      makeLibrary(),
      { bookOptions: contentOptions(true, false), createdAt: NOW },
      fs,
    );

    const threadsJson = JSON.parse(
      new TextDecoder().decode(pkg.files['books/b1/agent-threads.json']),
    );
    const messagesJson = JSON.parse(
      new TextDecoder().decode(pkg.files['books/b1/agent-messages.json']),
    );
    expect(threadsJson).toEqual([]);
    expect(messagesJson).toEqual([]);
    expect(pkg.manifest.media.count).toBe(2);
  });

  it('round-trips per-book ai config and system settings', async () => {
    const fs = new MemoryFileSystem();
    const pkg = await buildSnapshotPackage(
      makeLibrary(),
      {
        bookOptions: contentOptions(true, false, true),
        aiConfigs: { 1: AI_CONFIG },
        settings: SETTINGS,
        networkBooks: NETWORK_BOOKS,
        createdAt: NOW,
      },
      fs,
    );

    expect(pkg.manifest.books[0]?.options).toMatchObject({
      includeImages: true,
      includeAgent: false,
      includeAiConfig: true,
    });
    expect(pkg.manifest.options).toMatchObject({
      includeSettings: true,
      includeNetworkBooks: true,
    });

    const parsed = await parseSnapshotPackage(
      await zipSnapshotPackage(pkg.files),
    );
    expect(parsed.bookAiConfigs).toEqual({ b1: AI_CONFIG });
    expect(parsed.settings).toEqual(SETTINGS);
    expect(parsed.networkBooks).toEqual(NETWORK_BOOKS);
  });

  it('supports config-only packages with system settings', async () => {
    const fs = new MemoryFileSystem();
    const pkg = await buildSnapshotPackage(
      { books: [] },
      {
        bookOptions: {},
        settings: SETTINGS,
        networkBooks: NETWORK_BOOKS,
        createdAt: NOW,
      },
      fs,
    );

    expect(pkg.manifest.books).toEqual([]);
    const parsed = await parseSnapshotPackage(
      await zipSnapshotPackage(pkg.files),
    );
    expect(parsed.settings).toEqual(SETTINGS);
    expect(parsed.networkBooks).toEqual(NETWORK_BOOKS);
  });

  it('normalizes v1 global content options into per-book options', async () => {
    const fs = new MemoryFileSystem();
    const pkg = await buildSnapshotPackage(
      makeLibrary(),
      { bookOptions: contentOptions(false, true), createdAt: NOW },
      fs,
    );
    const files = await unzipSnapshotPackage(
      await zipSnapshotPackage(pkg.files),
    );
    const manifest = JSON.parse(
      new TextDecoder().decode(files['manifest.json']),
    ) as Record<string, unknown>;
    manifest.formatVersion = 1;
    manifest.options = { includeImages: false, includeAgent: true };
    const legacyBook = (manifest.books as Array<Record<string, unknown>>)[0]!;
    delete legacyBook.options;
    files['manifest.json'] = new TextEncoder().encode(JSON.stringify(manifest));

    const parsed = await parseSnapshotPackage(await zipSnapshotPackage(files));

    expect(parsed.manifest.formatVersion).toBe(1);
    expect(parsed.manifest.books[0]?.options).toEqual({
      includeImages: false,
      includeAgent: true,
      includeAiConfig: false,
    });
    expect(parsed.manifest.options).toEqual({
      includeSettings: false,
      includeNetworkBooks: false,
    });
  });

  it('rejects a package missing a referenced media file', async () => {
    const fs = new MemoryFileSystem();
    const pkg = await buildSnapshotPackage(
      makeLibrary(),
      { bookOptions: contentOptions(true, false), createdAt: NOW },
      fs,
    );
    const files = await unzipSnapshotPackage(
      await zipSnapshotPackage(pkg.files),
    );
    delete files['media/m2.jpg'];
    const broken = await zipSnapshotPackage(files);

    await expect(parseSnapshotPackage(broken)).rejects.toThrow(
      '备份缺少媒体文件',
    );
  });
});
