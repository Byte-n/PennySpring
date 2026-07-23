export { createBook, deleteBook, getAllBooks, getBookById, getDefaultBook, updateBook } from './book-service'
export { createAsset, deleteAsset, getAllAssets, getAssetsByBook, updateAsset } from './asset-service'
export { createRecord, deleteRecord, getRecordDetailById, getRecordsByBook, updateRecord } from './record-service'
export { createTag, deleteTag, getAllTags, updateTag } from './tag-service'
export { buildCategoryTree, createType, deleteType, getAllTypes, getTypesByCategory, updateType } from './type-service'
export { ensureDefaultBook, seedSystemTypesForBook } from './seed-service'
export type { CategoryItem } from './type-service'
export type {
  AssetRow,
  BookRow,
  CreateAssetInput,
  CreateBookInput,
  CreateRecordInput,
  CreateTagInput,
  CreateTypeInput,
  RecordDetail,
  RecordRow,
  TagRow,
  Tx,
  TypeRow,
  UpdateAssetInput,
  UpdateBookInput,
  UpdateRecordInput,
  UpdateTagInput,
  UpdateTypeInput,
} from './types'
