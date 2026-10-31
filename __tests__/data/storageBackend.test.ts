import fs from 'fs'
import path from 'path'

import SqliteDatabase from 'better-sqlite3'
import { createApi, type Api, type AgentProviderModel, type Database } from '@pennyspring/data'

import { createDatabase } from '../../packages/data-server/src/adapter-better-sqlite/database'

type Connection = InstanceType<typeof SqliteDatabase>

const MIGRATIONS_DIR = path.join(__dirname, '../../packages/data/drizzle')

const PROVIDER_MODELS: AgentProviderModel[] = [
  {
    modelId: 'm1',
    contextWindow: 200_000,
    reasoningEffort: 'off',
    multimodal: false,
  },
  {
    modelId: 'm2',
    contextWindow: 400_000,
    reasoningEffort: 'high',
    multimodal: true,
  },
]

function applyMigrations(connection: Connection): void {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const source = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    for (const statement of source.split('--> statement-breakpoint')) {
      if (statement.trim()) {
        connection.exec(statement)
      }
    }
  }
}

describe('storage backend api', () => {
  let connection: Connection
  let api: Api
  let booksId: number

  beforeEach(async () => {
    connection = new SqliteDatabase(':memory:')
    applyMigrations(connection)
    const db = createDatabase(connection) as unknown as Database
    api = createApi(async () => db)
    const book = await api.book.create({ name: '测试账本' })
    booksId = book.id
  })

  afterEach(() => {
    connection.close()
  })

  async function createProvider() {
    return api.provider.create({
      descriptorId: 'openai-chat',
      name: '测试提供商',
      baseUrl: 'https://example.com/v1',
      defaultModelId: 'm1',
      models: PROVIDER_MODELS,
      storeResponses: true,
    })
  }

  test('provider rows are server scoped and round-trip their model config', async () => {
    const provider = await createProvider()
    await api.book.create({ name: '另一个账本' })

    const providers = await api.provider.getAll()

    expect(typeof provider.id).toBe('number')
    expect(providers).toHaveLength(1)
    expect(providers[0]).toMatchObject({
      id: provider.id,
      descriptorId: 'openai-chat',
      defaultModelId: 'm1',
      models: PROVIDER_MODELS,
      storeResponses: true,
    })
  })

  test('provider update normalizes the default model and deletion clears references', async () => {
    const provider = await createProvider()
    await api.credential.setKey(booksId, provider.id, 'sk-test')
    await api.provider.setSelection({ providerId: provider.id, modelId: 'm1' })
    const thread = await api.agent.createThread(booksId, {
      providerId: provider.id,
      modelId: 'm1',
    })

    const updated = await api.provider.update({
      id: provider.id,
      descriptorId: 'openai-chat',
      name: '更新后的提供商',
      baseUrl: 'https://example.com/v2',
      defaultModelId: 'missing',
      models: PROVIDER_MODELS,
      storeResponses: false,
    })

    expect(updated.name).toBe('更新后的提供商')
    expect(updated.defaultModelId).toBe('m1')
    expect(updated.storeResponses).toBe(false)

    await api.provider.delete(provider.id)

    expect(await api.provider.getAll()).toEqual([])
    expect(await api.provider.getSelection()).toEqual({ providerId: 0, modelId: '' })
    expect(await api.credential.getKey(booksId, provider.id)).toBe('')
    const detail = await api.agent.getThreadDetail(thread.id)
    expect(detail.thread.providerId).toBe(0)
    expect(detail.thread.modelId).toBe('')
  })

  test('agent and quick book selections are stored independently', async () => {
    const provider = await createProvider()

    await api.provider.setSelection({ providerId: provider.id, modelId: 'm2' })
    await api.quickBook.setSelection({ providerId: 0, modelId: '' })

    expect(await api.provider.getSelection()).toEqual({
      providerId: provider.id,
      modelId: 'm2',
    })
    expect(await api.quickBook.getSelection()).toEqual({
      providerId: 0,
      modelId: '',
    })
  })

  test('selection rejects a model that does not belong to the provider', async () => {
    const provider = await createProvider()

    await expect(
      api.provider.setSelection({ providerId: provider.id, modelId: 'missing' }),
    ).rejects.toThrow('模型不存在')
  })

  test('updating a provider rebinds selection and threads that lose their model', async () => {
    const provider = await createProvider()
    await api.provider.setSelection({ providerId: provider.id, modelId: 'm1' })
    await api.quickBook.setSelection({ providerId: provider.id, modelId: 'm1' })
    const thread = await api.agent.createThread(booksId, {
      providerId: provider.id,
      modelId: 'm1',
    })

    const updated = await api.provider.update({
      id: provider.id,
      descriptorId: provider.descriptorId,
      name: provider.name,
      baseUrl: provider.baseUrl,
      defaultModelId: 'm2',
      models: PROVIDER_MODELS.slice(1),
      storeResponses: provider.storeResponses,
    })

    expect(updated.defaultModelId).toBe('m2')
    expect(await api.provider.getSelection()).toEqual({
      providerId: provider.id,
      modelId: 'm2',
    })
    expect(await api.quickBook.getSelection()).toEqual({
      providerId: provider.id,
      modelId: 'm2',
    })
    expect((await api.agent.getThreadDetail(thread.id)).thread.modelId).toBe('m2')

    const next = await api.agent.createThread(
      booksId,
      await api.provider.getSelection(),
    )
    expect(next.modelId).toBe('m2')
  })

  test('removing every provider model clears invalid selections and thread bindings', async () => {
    const provider = await createProvider()
    await api.provider.setSelection({ providerId: provider.id, modelId: 'm1' })
    const thread = await api.agent.createThread(booksId, {
      providerId: provider.id,
      modelId: 'm1',
    })

    await api.provider.update({
      id: provider.id,
      descriptorId: provider.descriptorId,
      name: provider.name,
      baseUrl: provider.baseUrl,
      defaultModelId: 'm1',
      models: [],
      storeResponses: provider.storeResponses,
    })

    expect(await api.provider.getSelection()).toEqual({
      providerId: provider.id,
      modelId: '',
    })
    expect((await api.agent.getThreadDetail(thread.id)).thread.modelId).toBe('')

    const next = await api.agent.createThread(
      booksId,
      await api.provider.getSelection(),
    )
    expect(next.modelId).toBe('')
  })

  test('credentials are isolated per book and empty value clears the key', async () => {
    const provider = await createProvider()
    const otherBook = await api.book.create({ name: '另一个账本' })

    await api.credential.setKey(booksId, provider.id, 'sk-test')

    expect(await api.credential.getKey(booksId, provider.id)).toBe('sk-test')
    expect(await api.credential.hasKey(booksId, provider.id)).toBe(true)
    expect(await api.credential.getKey(otherBook.id, provider.id)).toBe('')
    expect(await api.credential.hasKey(otherBook.id, provider.id)).toBe(false)

    await api.credential.setKey(booksId, provider.id, '')

    expect(await api.credential.hasKey(booksId, provider.id)).toBe(false)
  })

  test('threads persist their model binding at creation and can update it', async () => {
    const provider = await createProvider()

    const thread = await api.agent.createThread(booksId, {
      providerId: provider.id,
      modelId: 'm1',
    })

    expect(thread.providerId).toBe(provider.id)
    expect(thread.modelId).toBe('m1')

    const updated = await api.agent.updateThreadModel(thread.id, {
      providerId: provider.id,
      modelId: 'm2',
    })

    expect(updated.providerId).toBe(provider.id)
    expect(updated.modelId).toBe('m2')

    const detail = await api.agent.getThreadDetail(thread.id)
    expect(detail.thread.modelId).toBe('m2')
  })

  test('latest thread lookup does not create a session', async () => {
    const provider = await createProvider()

    const detail = await api.agent.getLatestThreadWithMessages(booksId, {
      providerId: provider.id,
      modelId: 'm2',
    })

    expect(detail).toBeNull()
    expect(await api.agent.listThreads(booksId)).toEqual([])
  })

  test('quick templates round-trip json tags and boolean reimbursable', async () => {
    const type = await api.type.create({
      booksId,
      name: '餐饮',
      icon: '',
      typeCategory: 'expense',
    })
    const tag = await api.tag.create({ booksId, name: '早餐' })

    const template = await api.quickTemplate.create({
      booksId,
      name: '早餐',
      typeCategory: 'expense',
      typeId: type.id,
      amount: 600,
      reimbursable: true,
      tagIds: [tag.id],
    })

    expect(template.tagIds).toEqual([tag.id])
    expect(template.reimbursable).toBe(true)
    expect(template.sort).toBe(1)

    const updated = await api.quickTemplate.update({
      id: template.id,
      booksId,
      name: '午餐',
      typeCategory: 'expense',
      typeId: type.id,
      amount: 900,
      reimbursable: false,
      tagIds: [],
    })

    expect(updated.name).toBe('午餐')
    expect(updated.reimbursable).toBe(false)
    expect(updated.tagIds).toEqual([])
  })

  test('quick templates are isolated by book and reorder persists sort', async () => {
    const type = await api.type.create({
      booksId,
      name: '餐饮',
      icon: '',
      typeCategory: 'expense',
    })
    const otherBook = await api.book.create({ name: '另一个账本' })

    const first = await api.quickTemplate.create({
      booksId,
      name: '第一个',
      typeCategory: 'expense',
      typeId: type.id,
      amount: 100,
    })
    const second = await api.quickTemplate.create({
      booksId,
      name: '第二个',
      typeCategory: 'expense',
      typeId: type.id,
      amount: 200,
    })

    expect(await api.quickTemplate.list(otherBook.id)).toEqual([])

    await api.quickTemplate.reorder(booksId, [second.id, first.id])

    expect((await api.quickTemplate.list(booksId)).map(item => item.id)).toEqual([
      second.id,
      first.id,
    ])

    await api.quickTemplate.delete(first.id, booksId)

    expect((await api.quickTemplate.list(booksId)).map(item => item.id)).toEqual([
      second.id,
    ])
  })
})
