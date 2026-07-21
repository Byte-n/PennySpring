import { relations } from 'drizzle-orm'

import {
  assets,
  books,
  imageWithRelated,
  records,
  recordWithRecord,
  tags,
  tagWithRecord,
  types,
} from '../schema'

export const booksRelations = relations(books, ({ many }) => ({
  assets: many(assets),
  records: many(records),
  tags: many(tags),
  types: many(types),
}))

export const assetsRelations = relations(assets, ({ many, one }) => ({
  books: one(books, {
    fields: [assets.booksId],
    references: [books.id],
  }),
  outgoingRecords: many(records, { relationName: 'record_asset' }),
  incomingTransferRecords: many(records, { relationName: 'record_into_asset' }),
}))

export const typesRelations = relations(types, ({ many, one }) => ({
  books: one(books, {
    fields: [types.booksId],
    references: [books.id],
  }),
  records: many(records),
}))

export const recordsRelations = relations(records, ({ many, one }) => ({
  asset: one(assets, {
    fields: [records.assetId],
    references: [assets.id],
    relationName: 'record_asset',
  }),
  intoAsset: one(assets, {
    fields: [records.intoAssetId],
    references: [assets.id],
    relationName: 'record_into_asset',
  }),
  books: one(books, {
    fields: [records.booksId],
    references: [books.id],
  }),
  type: one(types, {
    fields: [records.typeId],
    references: [types.id],
  }),
  imageRelations: many(imageWithRelated),
  relatedRecords: many(recordWithRecord, { relationName: 'record_related_records' }),
  sourceRecordLinks: many(recordWithRecord, { relationName: 'record_source_links' }),
  tagRelations: many(tagWithRecord),
}))

export const recordWithRecordRelations = relations(recordWithRecord, ({ one }) => ({
  record: one(records, {
    fields: [recordWithRecord.recordId],
    references: [records.id],
    relationName: 'record_related_records',
  }),
  relatedRecord: one(records, {
    fields: [recordWithRecord.relatedRecordId],
    references: [records.id],
    relationName: 'record_source_links',
  }),
}))

export const tagsRelations = relations(tags, ({ many, one }) => ({
  books: one(books, {
    fields: [tags.booksId],
    references: [books.id],
  }),
  recordRelations: many(tagWithRecord),
}))

export const tagWithRecordRelations = relations(tagWithRecord, ({ one }) => ({
  record: one(records, {
    fields: [tagWithRecord.recordId],
    references: [records.id],
  }),
  tag: one(tags, {
    fields: [tagWithRecord.tagId],
    references: [tags.id],
  }),
}))

export const imageWithRelatedRelations = relations(imageWithRelated, ({ one }) => ({
  record: one(records, {
    fields: [imageWithRelated.recordId],
    references: [records.id],
  }),
}))
