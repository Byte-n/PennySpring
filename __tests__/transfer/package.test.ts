import type { BookSnapshot, LibrarySnapshot } from '@pennyspring/api';

import {
  buildSnapshotPackage,
  cleanupImportedMedia,
  parseSnapshotPackage,
  prepareImportedLibrary,
  unzipSnapshotPackage,
  zipSnapshotPackage,
  type TransferFileSystem,
} from '../../src/features/transfer';

const COVER_URI = 'file:///docs/cover.jpg';
const RECEIPT_URI = 'file:///docs/receipt.jpg';
const DATA_URL = 'data:image/jpeg;base64,QUJD';
const NOW = 1_700_000_000_000;

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
        includeImages: true,
        includeAgent: true,
        appVersion: 'test',
        createdAt: NOW,
      },
      fs,
    );

    expect(pkg.manifest).toMatchObject({
      format: 'pennyspring.snapshot',
      formatVersion: 1,
      appVersion: 'test',
      scope: 'book',
      media: { count: 3, totalBytes: 15 },
      options: { includeImages: true, includeAgent: true },
    });
    expect(pkg.manifest.books[0]).toMatchObject({
      key: 'b1',
      name: '家庭账本',
      recordRange: [NOW, NOW],
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
      { includeImages: true, includeAgent: true, createdAt: NOW },
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
      { includeImages: false, includeAgent: true, createdAt: NOW },
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
      { includeImages: true, includeAgent: false, createdAt: NOW },
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

  it('rejects a package missing a referenced media file', async () => {
    const fs = new MemoryFileSystem();
    const pkg = await buildSnapshotPackage(
      makeLibrary(),
      { includeImages: true, includeAgent: false, createdAt: NOW },
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
