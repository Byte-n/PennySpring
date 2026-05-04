import * as schema from '../src/schema'
import * as relations from '../src/relations'
import * as publicApi from '../src'

describe('data package schema exports', () => {
  test('exports all documented business tables', () => {
    expect(Object.keys(schema).sort()).toEqual([
      'assetClassifications',
      'assets',
      'books',
      'icons',
      'imageWithRelated',
      'recordWithRecord',
      'records',
      'tagWithRecord',
      'tags',
      'types',
    ])
  })

  test('exports relation metadata for every table with documented ER edges', () => {
    expect(Object.keys(relations).sort()).toEqual([
      'assetClassificationsRelations',
      'assetsRelations',
      'booksRelations',
      'iconsRelations',
      'imageWithRelatedRelations',
      'recordWithRecordRelations',
      'recordsRelations',
      'tagWithRecordRelations',
      'tagsRelations',
      'typesRelations',
    ])
  })

  test('exports schema, runtime bootstrap, and table definitions from the package root', () => {
    expect(typeof publicApi.createDatabase).toBe('function')
    expect(typeof publicApi.runMigrations).toBe('function')
    expect(publicApi.schema.books).toBe(schema.books)
    expect(publicApi.schema.booksRelations).toBe(relations.booksRelations)
    expect(publicApi.assets).toBe(schema.assets)
  })

  test('exports an app-side migration bundle from the package root', () => {
    expect(publicApi.migrations.journal.entries).toEqual([])
    expect(publicApi.migrations.migrations).toEqual({})
  })
})
