import type { SnapshotIdMaps } from '@pennyspring/api'

import {
  rewriteAgentMessageIds,
  rewriteAgentMessageMedia,
} from '../../src/features/transfer'

const DATA_URL = 'data:image/jpeg;base64,QUJD'
const FILE_URI = 'file:///docs/attachment.jpg'
const MEDIA_REF = 'media:m1.jpg'

function parse(json: string): Record<string, any> {
  return JSON.parse(json) as Record<string, any>
}

describe('agent message rewrites', () => {
  it('rewrites local attachment refs and data urls for export', () => {
    const message = JSON.stringify({
      id: 'm1',
      role: 'user',
      parts: [
        { type: 'file', mediaType: 'image/jpeg', filename: 'a.jpg', url: DATA_URL },
        { type: 'text', text: '你好' },
      ],
      metadata: {
        attachments: [
          {
            id: 'att1',
            ref: FILE_URI,
            localPath: FILE_URI,
            mediaType: 'image/jpeg',
            filename: 'a.jpg',
          },
        ],
      },
    })

    const result = parse(
      rewriteAgentMessageMedia(
        message,
        value => (value === DATA_URL || value === FILE_URI ? MEDIA_REF : undefined),
        'export',
      ),
    )

    expect(result.parts[0].url).toBe(MEDIA_REF)
    expect(result.parts[1].text).toBe('你好')
    expect(result.metadata.attachments[0]).toMatchObject({
      id: 'att1',
      ref: MEDIA_REF,
      mediaType: 'image/jpeg',
    })
    expect(result.metadata.attachments[0].localPath).toBeUndefined()
  })

  it('rewrites packaged media refs to local paths for import', () => {
    const message = JSON.stringify({
      id: 'm1',
      role: 'user',
      parts: [
        { type: 'file', mediaType: 'image/jpeg', filename: 'a.jpg', url: MEDIA_REF },
      ],
      metadata: {
        attachments: [
          {
            id: 'att1',
            ref: MEDIA_REF,
            mediaType: 'image/jpeg',
            filename: 'a.jpg',
          },
        ],
      },
    })

    const result = parse(
      rewriteAgentMessageMedia(
        message,
        value => (value === MEDIA_REF ? FILE_URI : undefined),
        'import',
      ),
    )

    expect(result.parts[0].url).toBe(FILE_URI)
    expect(result.metadata.attachments[0]).toMatchObject({
      ref: FILE_URI,
      localPath: FILE_URI,
    })
  })

  it('leaves external image urls untouched', () => {
    const external = 'https://example.com/image.jpg'
    const message = JSON.stringify({
      id: 'm1',
      role: 'assistant',
      parts: [{ type: 'file', mediaType: 'image/jpeg', url: external }],
    })

    const result = parse(
      rewriteAgentMessageMedia(message, () => undefined, 'export'),
    )

    expect(result.parts[0].url).toBe(external)
  })

  it('remaps structured tool ids but not text', () => {
    const message = JSON.stringify({
      id: 'm1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-createRecord',
          input: { typeId: 3, assetId: 4, tagIds: [6, 7] },
          output: {
            recordId: 10,
            relatedRecordIds: [11],
            intoAssetId: 5,
            text: 'recordId 10 保持不变',
          },
        },
      ],
    })
    const maps: SnapshotIdMaps = {
      types: new Map([[3, 103]]),
      assets: new Map([[4, 104], [5, 105]]),
      tags: new Map([[6, 106], [7, 107]]),
      records: new Map([[10, 110], [11, 111]]),
      threads: new Map(),
    }

    const result = parse(rewriteAgentMessageIds(message, maps))
    const part = result.parts[0]

    expect(part.input).toEqual({ typeId: 103, assetId: 104, tagIds: [106, 107] })
    expect(part.output).toMatchObject({
      recordId: 110,
      relatedRecordIds: [111],
      intoAssetId: 105,
      text: 'recordId 10 保持不变',
    })
  })
})
