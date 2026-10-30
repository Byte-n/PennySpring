import type { UIMessage } from 'ai';

import {
  hasUiMessageFileParts,
  hasUiMessageImages,
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
});
