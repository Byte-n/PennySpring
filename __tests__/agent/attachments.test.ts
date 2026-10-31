import type { FileUIPart, UIMessage } from 'ai';

import {
  buildAttachmentMessageParts,
  collectMessageAttachments,
  createAgentAttachment,
  hasUiMessageFileParts,
  hasUiMessageImages,
  readMessageAttachments,
  resolveAttachmentsByIds,
  stripAttachmentCaptions,
  stripUiMessageFiles,
} from '../../src/agent/core/attachments';

const TEXT_PART = { type: 'text' as const, text: '看看这张小票' };
const IMAGE_PART = {
  type: 'file' as const,
  mediaType: 'image/jpeg',
  filename: 'receipt.jpg',
  url: 'data:image/jpeg;base64,QUJD',
};

describe('agent message attachments', () => {
  it('detects image parts and other file parts', () => {
    const imageMessage: UIMessage = {
      id: 'user-image',
      role: 'user',
      parts: [TEXT_PART, IMAGE_PART],
    };
    const textMessage: UIMessage = {
      id: 'user-text',
      role: 'user',
      parts: [TEXT_PART],
    };

    expect(hasUiMessageImages(imageMessage)).toBe(true);
    expect(hasUiMessageFileParts(imageMessage)).toBe(true);
    expect(hasUiMessageImages(textMessage)).toBe(false);
    expect(hasUiMessageFileParts(textMessage)).toBe(false);
  });

  it('strips file parts and drops messages left empty', () => {
    const mixed: UIMessage = {
      id: 'user-mixed',
      role: 'user',
      parts: [TEXT_PART, IMAGE_PART],
    };
    const imageOnly: UIMessage = {
      id: 'user-image-only',
      role: 'user',
      parts: [IMAGE_PART],
    };
    const assistant: UIMessage = {
      id: 'assistant-1',
      role: 'assistant',
      parts: [{ type: 'text', text: '收到。' }],
    };

    expect(stripUiMessageFiles([mixed, imageOnly, assistant])).toEqual([
      { ...mixed, parts: [TEXT_PART] },
      assistant,
    ]);
  });

  it('keeps untouched messages by reference', () => {
    const assistant: UIMessage = {
      id: 'assistant-1',
      role: 'assistant',
      parts: [{ type: 'text', text: '收到。' }],
    };

    expect(stripUiMessageFiles([assistant])[0]).toBe(assistant);
  });

  it('reads, collects and dedupes attachment metadata across messages', () => {
    const attachment = createAgentAttachment({
      id: 'att_1',
      ref: 'file:///tmp/quick-book/shot.jpg',
      localPath: 'file:///tmp/quick-book/shot.jpg',
      mediaType: 'image/jpeg',
      filename: 'shot.jpg',
    });
    const first: UIMessage = {
      id: 'user-1',
      role: 'user',
      parts: [TEXT_PART],
      metadata: { attachments: [attachment] },
    };
    const second: UIMessage = {
      id: 'user-2',
      role: 'user',
      parts: [TEXT_PART],
      metadata: { attachments: [attachment] },
    };
    const invalid: UIMessage = {
      id: 'user-3',
      role: 'user',
      parts: [TEXT_PART],
      metadata: { attachments: [{ id: '', ref: '' }] },
    };

    expect(readMessageAttachments(first)).toEqual([attachment]);
    expect(readMessageAttachments(invalid)).toEqual([]);
    expect(collectMessageAttachments([first, second, invalid])).toEqual([
      attachment,
    ]);
  });

  it('resolves requested attachment ids and reports missing ones', () => {
    const first = createAgentAttachment({
      id: 'att_1',
      ref: 'file:///tmp/shot.jpg',
      localPath: 'file:///tmp/shot.jpg',
      mediaType: 'image/jpeg',
      filename: 'shot.jpg',
    });
    const second = createAgentAttachment({
      id: 'att_2',
      ref: 'file:///tmp/receipt.jpg',
      localPath: 'file:///tmp/receipt.jpg',
      mediaType: 'image/jpeg',
      filename: 'receipt.jpg',
    });

    expect(
      resolveAttachmentsByIds([first, second], ['att_2', 'att_missing']),
    ).toEqual({
      resolved: [second],
      missingIds: ['att_missing'],
    });
  });

  it('interleaves images with model-visible captions without local paths', () => {
    const first = createAgentAttachment({
      id: 'att_1',
      ref: 'file:///secret/shot.jpg',
      localPath: 'file:///secret/shot.jpg',
      mediaType: 'image/jpeg',
      filename: 'shot.jpg',
    });
    const second = createAgentAttachment({
      id: 'att_2',
      ref: 'file:///secret/receipt.jpg',
      localPath: 'file:///secret/receipt.jpg',
      mediaType: 'image/jpeg',
      filename: 'receipt.jpg',
    });
    const files: FileUIPart[] = [
      {
        type: 'file',
        mediaType: 'image/jpeg',
        filename: 'shot.jpg',
        url: 'data:image/jpeg;base64,QUJD',
      },
      {
        type: 'file',
        mediaType: 'image/jpeg',
        filename: 'receipt.jpg',
        url: 'data:image/jpeg;base64,REVG',
      },
    ];

    const parts = buildAttachmentMessageParts(
      files,
      [first, second],
      '请根据这两张截图记账。',
    );
    const text = parts
      .filter(part => part.type === 'text')
      .map(part => (part.type === 'text' ? part.text : ''))
      .join('\n');

    expect(parts.map(part => part.type)).toEqual([
      'file',
      'text',
      'file',
      'text',
      'text',
    ]);
    expect(text).toContain('att_1');
    expect(text).toContain('att_2');
    expect(text).not.toContain('file:///secret/shot.jpg');
    expect(stripAttachmentCaptions(text)).toBe('请根据这两张截图记账。');
    expect(stripAttachmentCaptions('【图片附件 att_1：shot.jpg】')).toBe('');
    expect(buildAttachmentMessageParts([], [], '')).toEqual([]);
  });
});
