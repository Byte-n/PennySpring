import type {
  CreateAssetInput,
  CreateBookInput,
  CreateRecordInput,
  CreateTagInput,
  CreateTypeInput,
  UpdateAssetInput,
  UpdateBookInput,
  UpdateRecordInput,
  UpdateTagInput,
  UpdateTypeInput,
} from './services';
import type { RecordTypeCategoryValue } from './constants';
export * from './services/types'
export type { CategoryItem } from './services'
export type { CreateAssetInput, CreateBookInput, UpdateAssetInput, UpdateBookInput } from './services'
export * from './constants';
export * from './schema';
export * from './relations';
export { buildCategoryTree } from './services';
export { createDatabase, runMigrations, schema } from './runtime';

import { createDatabase, runMigrations, type Database } from './runtime';
import * as services from './services';

let dbInstance: Database | null = null;

async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const { open } = await import('@op-engineering/op-sqlite');
  const connection = open({ name: 'pennyspring.db' });
  dbInstance = createDatabase(connection);
  await runMigrations(dbInstance);

  return dbInstance;
}

export const api = {
  get: getDatabase,
  record: {
    create: async (input: CreateRecordInput) => {
      const database = await getDatabase();
      return services.createRecord(database, input);
    },
    update: async (input: UpdateRecordInput) => {
      const database = await getDatabase();
      return services.updateRecord(database, input);
    },
    delete: async (recordId: number) => {
      const database = await getDatabase();
      return services.deleteRecord(database, recordId);
    },
  },
  tag: {
    getAll: async () => {
      const database = await getDatabase();
      return services.getAllTags(database);
    },
    create: async (input: CreateTagInput) => {
      const database = await getDatabase();
      return services.createTag(database, input);
    },
    update: async (input: UpdateTagInput) => {
      const database = await getDatabase();
      return services.updateTag(database, input);
    },
    delete: async (tagId: number) => {
      const database = await getDatabase();
      return services.deleteTag(database, tagId);
    },
  },
  type: {
    getAll: async () => {
      const database = await getDatabase();
      return services.getAllTypes(database);
    },
    create: async (input: CreateTypeInput) => {
      const database = await getDatabase();
      return services.createType(database, input);
    },
    update: async (input: UpdateTypeInput) => {
      const database = await getDatabase();
      return services.updateType(database, input);
    },
    delete: async (typeId: number) => {
      const database = await getDatabase();
      return services.deleteType(database, typeId);
    },
    getByCategory: async (typeCategory: RecordTypeCategoryValue) => {
      const database = await getDatabase();
      return services.getTypesByCategory(database, typeCategory);
    },
  },
  book: {
    getAll: async () => {
      const database = await getDatabase();
      return services.getAllBooks(database);
    },
    getDefault: async () => {
      const database = await getDatabase();
      return services.getDefaultBook(database);
    },
    getById: async (bookId: number) => {
      const database = await getDatabase();
      return services.getBookById(database, bookId);
    },
    create: async (input: CreateBookInput) => {
      const database = await getDatabase();
      return services.createBook(database, input);
    },
    update: async (input: UpdateBookInput) => {
      const database = await getDatabase();
      return services.updateBook(database, input);
    },
    delete: async (bookId: number) => {
      const database = await getDatabase();
      return services.deleteBook(database, bookId);
    },
  },
  asset: {
    getAll: async () => {
      const database = await getDatabase();
      return services.getAllAssets(database);
    },
    getByBook: async (booksId: number) => {
      const database = await getDatabase();
      return services.getAssetsByBook(database, booksId);
    },
    create: async (input: CreateAssetInput) => {
      const database = await getDatabase();
      return services.createAsset(database, input);
    },
    update: async (input: UpdateAssetInput) => {
      const database = await getDatabase();
      return services.updateAsset(database, input);
    },
    delete: async (assetId: number) => {
      const database = await getDatabase();
      return services.deleteAsset(database, assetId);
    },
  },
};
