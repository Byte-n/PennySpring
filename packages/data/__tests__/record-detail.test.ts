import { getRecordDetailById } from '../src/services/record-service'
import type { Database } from '../src/runtime'

function buildDb(options: {
  record: unknown
  tagRows: { tagId: number }[]
  imageRows: { imagePath: string }[]
  relatedRows: { relatedRecordId: number }[]
}): Database {
  const recordWhere = jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue(options.record),
  })
  const junctionResults = [options.tagRows, options.imageRows, options.relatedRows]
  let junctionCall = 0
  const junctionWhere = jest.fn().mockImplementation(() => {
    const result = junctionResults[junctionCall] ?? []
    junctionCall += 1
    return Promise.resolve(result)
  })

  let selectCall = 0
  const from = jest.fn().mockImplementation(() => {
    const isRecordSelect = selectCall === 0
    selectCall += 1
    return { where: isRecordSelect ? recordWhere : junctionWhere }
  })

  return {
    select: jest.fn().mockReturnValue({ from }),
  } as unknown as Database
}

describe('getRecordDetailById', () => {
  test('returns record with tag, image and related ids', async () => {
    const record = {
      id: 7,
      typeId: 2,
      assetId: 3,
      intoAssetId: 0,
      booksId: 1,
      amount: 5000,
      finalAmount: 5000,
      charge: 0,
      remark: '午餐',
      reimbursable: 'notReimbursable',
      recordTime: 1700000000000,
      createdTime: 1700000000000,
      updatedTime: 1700000000000,
    }
    const db = buildDb({
      record,
      tagRows: [{ tagId: 11 }, { tagId: 12 }],
      imageRows: [{ imagePath: 'file:///a.jpg' }],
      relatedRows: [{ relatedRecordId: 99 }],
    })

    const detail = await getRecordDetailById(db, 7)

    expect(detail.record).toEqual(record)
    expect(detail.tagIds).toEqual([11, 12])
    expect(detail.imagePaths).toEqual(['file:///a.jpg'])
    expect(detail.relatedRecordIds).toEqual([99])
  })

  test('throws when record not found', async () => {
    const db = buildDb({
      record: undefined,
      tagRows: [],
      imageRows: [],
      relatedRows: [],
    })

    await expect(getRecordDetailById(db, 404)).rejects.toThrow('记录不存在: 404')
  })
})
