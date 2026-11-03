import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';

import { schema } from '../src/db';
import {
  applyAiConfigSnapshot,
  buildAiConfigSnapshot,
} from '../src/services/ai-config-service';
import {
  createProvider,
  getAgentSelection,
  setAgentSelection,
} from '../src/services/agent-provider-service';
import { setProviderKey } from '../src/services/agent-credential-service';
import { createBook } from '../src/services/book-service';
import type { Database as AppDatabase } from '../src/types';

const MIGRATIONS_FOLDER = path.resolve(__dirname, '../drizzle');

const MODELS = [
  {
    modelId: 'gpt-4.1',
    contextWindow: 200_000,
    reasoningEffort: 'off' as const,
    multimodal: true,
  },
  {
    modelId: 'gpt-4.1-mini',
    contextWindow: 128_000,
    reasoningEffort: 'low' as const,
    multimodal: false,
  },
];

function createTestDatabase(): AppDatabase {
  const connection = new Database(':memory:');
  const db = drizzle(connection, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  const patched = db as unknown as {
    transaction: (fn: (tx: unknown) => Promise<unknown>) => Promise<unknown>;
  };
  patched.transaction = fn => fn(db);
  return db as unknown as AppDatabase;
}

async function seedProvider(db: AppDatabase, name = '主提供商') {
  return createProvider(db, {
    descriptorId: 'openai-compatible',
    name,
    baseUrl: 'https://api.example.com/v1',
    models: MODELS,
    defaultModelId: 'gpt-4.1',
    storeResponses: true,
  });
}

async function insertDanglingThread(
  db: AppDatabase,
  booksId: number,
  providerId: number,
  modelId: string,
) {
  const rows = await db
    .insert(schema.agentThreads)
    .values({
      booksId,
      title: '历史会话',
      providerId,
      modelId,
    })
    .returning();
  const thread = rows[0];
  if (!thread) throw new Error('failed to create thread');
  return thread;
}

describe('ai-config-service', () => {
  it('exports provider definitions, selections and the current book api key', async () => {
    const db = createTestDatabase();
    const book = await createBook(db, { name: '家庭账本' });
    const provider = await seedProvider(db);
    await setAgentSelection(db, 'agent', {
      providerId: provider.id,
      modelId: 'gpt-4.1-mini',
    });
    await setAgentSelection(db, 'quickBook', {
      providerId: provider.id,
      modelId: 'gpt-4.1',
    });
    await setProviderKey(db, book.id, provider.id, 'sk-secret');

    const snapshot = await buildAiConfigSnapshot(db, book.id);

    expect(snapshot.providers).toEqual([
      {
        id: provider.id,
        descriptorId: 'openai-compatible',
        name: '主提供商',
        baseUrl: 'https://api.example.com/v1',
        defaultModelId: 'gpt-4.1',
        models: MODELS,
        storeResponses: true,
        apiKey: 'sk-secret',
      },
    ]);
    expect(snapshot.agentSelection).toEqual({
      providerId: provider.id,
      modelId: 'gpt-4.1-mini',
    });
    expect(snapshot.quickBookSelection).toEqual({
      providerId: provider.id,
      modelId: 'gpt-4.1',
    });
  });

  it('exports only the selected book api keys', async () => {
    const db = createTestDatabase();
    const currentBook = await createBook(db, { name: '当前账本' });
    const otherBook = await createBook(db, { name: '其他账本' });
    const provider = await seedProvider(db);
    await setProviderKey(db, currentBook.id, provider.id, 'sk-current');
    await setProviderKey(db, otherBook.id, provider.id, 'sk-other');

    const snapshot = await buildAiConfigSnapshot(db, currentBook.id);

    expect(snapshot.providers[0]?.apiKey).toBe('sk-current');
    expect(JSON.stringify(snapshot)).not.toContain('sk-other');
  });

  it('imports providers and remaps dangling thread and selection references', async () => {
    const sourceDb = createTestDatabase();
    const targetDb = createTestDatabase();
    const sourceBook = await createBook(sourceDb, { name: '源账本' });
    const sourceProvider = await seedProvider(sourceDb);
    await setAgentSelection(sourceDb, 'agent', {
      providerId: sourceProvider.id,
      modelId: 'gpt-4.1-mini',
    });
    await setAgentSelection(sourceDb, 'quickBook', {
      providerId: sourceProvider.id,
      modelId: 'gpt-4.1',
    });
    await setProviderKey(
      sourceDb,
      sourceBook.id,
      sourceProvider.id,
      'sk-source',
    );
    const snapshot = await buildAiConfigSnapshot(sourceDb, sourceBook.id);

    const targetBook = await createBook(targetDb, { name: '恢复账本' });
    const targetThread = await insertDanglingThread(
      targetDb,
      targetBook.id,
      sourceProvider.id,
      'gpt-4.1-mini',
    );

    const result = await applyAiConfigSnapshot(
      targetDb,
      snapshot,
      targetBook.id,
    );

    const providers = await targetDb.select().from(schema.agentProviders).all();
    expect(providers).toHaveLength(1);
    expect(providers[0]?.id).toBe(result.providerIdMap[sourceProvider.id]);
    expect(await getAgentSelection(targetDb, 'agent')).toEqual({
      providerId: providers[0]?.id,
      modelId: 'gpt-4.1-mini',
    });
    expect(await getAgentSelection(targetDb, 'quickBook')).toEqual({
      providerId: providers[0]?.id,
      modelId: 'gpt-4.1',
    });

    const threads = await targetDb
      .select()
      .from(schema.agentThreads)
      .where(eq(schema.agentThreads.id, targetThread.id))
      .all();
    expect(threads[0]?.providerId).toBe(providers[0]?.id);
    expect(threads[0]?.modelId).toBe('gpt-4.1-mini');
    expect(result.providersCreated).toBe(1);
    expect(result.threadsUpdated).toBe(1);
    expect(result.keysUpdated).toBe(1);

    const keys = await targetDb.select().from(schema.bookProviderKeys).all();
    expect(keys).toEqual([
      expect.objectContaining({
        booksId: targetBook.id,
        providerId: providers[0]?.id,
        apiKey: 'sk-source',
      }),
    ]);
  });

  it('reuses a provider with the same descriptor, base url and name', async () => {
    const sourceDb = createTestDatabase();
    const targetDb = createTestDatabase();
    const sourceBook = await createBook(sourceDb, { name: '源账本' });
    const sourceProvider = await seedProvider(sourceDb);
    const snapshot = await buildAiConfigSnapshot(sourceDb, sourceBook.id);

    const targetBook = await createBook(targetDb, { name: '目标账本' });
    const existing = await createProvider(targetDb, {
      descriptorId: 'openai-compatible',
      name: '主提供商',
      baseUrl: 'https://api.example.com/v1',
      models: [MODELS[0]!],
      defaultModelId: 'gpt-4.1',
    });
    await setProviderKey(targetDb, targetBook.id, existing.id, 'sk-target');
    const targetThread = await insertDanglingThread(
      targetDb,
      targetBook.id,
      sourceProvider.id,
      'gpt-4.1-mini',
    );

    const result = await applyAiConfigSnapshot(
      targetDb,
      snapshot,
      targetBook.id,
    );

    expect(result.providersCreated).toBe(0);
    expect(result.providersUpdated).toBe(1);
    expect(result.keysUpdated).toBe(0);
    expect(result.providerIdMap[sourceProvider.id]).toBe(existing.id);
    const providers = await targetDb.select().from(schema.agentProviders).all();
    expect(providers).toHaveLength(1);
    expect(JSON.parse(providers[0]?.models ?? '[]')).toHaveLength(2);

    const keys = await targetDb.select().from(schema.bookProviderKeys).all();
    expect(keys).toEqual([
      expect.objectContaining({
        booksId: targetBook.id,
        providerId: existing.id,
        apiKey: 'sk-target',
      }),
    ]);

    const threads = await targetDb
      .select()
      .from(schema.agentThreads)
      .where(eq(schema.agentThreads.id, targetThread.id))
      .all();
    expect(threads[0]?.providerId).toBe(existing.id);
    expect(threads[0]?.modelId).toBe('gpt-4.1-mini');
  });

  it('falls back to the provider default model when the imported thread model is gone', async () => {
    const sourceDb = createTestDatabase();
    const targetDb = createTestDatabase();
    const sourceBook = await createBook(sourceDb, { name: '源账本' });
    const sourceProvider = await seedProvider(sourceDb);
    const snapshot = await buildAiConfigSnapshot(sourceDb, sourceBook.id);
    const compactSnapshot = {
      ...snapshot,
      providers: snapshot.providers.map(provider => ({
        ...provider,
        models: [MODELS[0]!],
        defaultModelId: 'gpt-4.1',
      })),
    };

    const targetBook = await createBook(targetDb, { name: '恢复账本' });
    const targetThread = await insertDanglingThread(
      targetDb,
      targetBook.id,
      sourceProvider.id,
      'gpt-4.1-mini',
    );

    await applyAiConfigSnapshot(targetDb, compactSnapshot, targetBook.id);

    const threads = await targetDb
      .select()
      .from(schema.agentThreads)
      .where(eq(schema.agentThreads.id, targetThread.id))
      .all();
    expect(threads[0]?.modelId).toBe('gpt-4.1');
  });

  it('rejects duplicate providers in the package and rolls back', async () => {
    const sourceDb = createTestDatabase();
    const targetDb = createTestDatabase();
    const sourceBook = await createBook(sourceDb, { name: '源账本' });
    const targetBook = await createBook(targetDb, { name: '目标账本' });
    const provider = await seedProvider(sourceDb);
    const snapshot = await buildAiConfigSnapshot(sourceDb, sourceBook.id);
    const invalid = {
      ...snapshot,
      providers: [
        snapshot.providers[0]!,
        { ...snapshot.providers[0]!, id: provider.id + 1 },
      ],
    };

    await expect(
      applyAiConfigSnapshot(targetDb, invalid, targetBook.id),
    ).rejects.toThrow('AI 配置包含重复的提供商');
    expect(await targetDb.select().from(schema.agentProviders).all()).toEqual(
      [],
    );
  });
});
