import type {
  FileUIPart,
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITools,
} from 'ai';

type AgentUiPart = UIMessagePart<UIDataTypes, UITools>;

export interface AgentAttachment {
  id: string;
  ref: string;
  localPath?: string;
  mediaType: string;
  filename: string;
}

export interface AgentAttachmentInput {
  ref: string;
  id?: string;
  localPath?: string;
  mediaType?: string;
  filename?: string;
}

export interface AgentMessageMetadata {
  attachments?: AgentAttachment[];
  /** 本次用户消息由截图记账触发，可跳过新增记录的写入确认。 */
  autoApproveCreate?: boolean;
}

const DEFAULT_ATTACHMENT_MEDIA_TYPE = 'image/jpeg';
const DEFAULT_ATTACHMENT_FILENAME = 'image.jpg';

let attachmentSequence = 0;

function createAttachmentId(): string {
  attachmentSequence += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `att_${Date.now().toString(36)}_${attachmentSequence.toString(36)}_${random}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAgentAttachment(value: unknown): value is AgentAttachment {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id.trim() !== '' &&
    typeof value.ref === 'string' &&
    value.ref.trim() !== '' &&
    (value.localPath === undefined ||
      (typeof value.localPath === 'string' && value.localPath.trim() !== '')) &&
    typeof value.mediaType === 'string' &&
    value.mediaType.trim() !== '' &&
    typeof value.filename === 'string' &&
    value.filename.trim() !== ''
  );
}

export function createAgentAttachment(
  input: AgentAttachmentInput,
): AgentAttachment {
  const ref = input.ref.trim();
  if (!ref) {
    throw new Error('附件引用不能为空');
  }
  return {
    id: input.id ?? createAttachmentId(),
    ref,
    ...(input.localPath ? { localPath: input.localPath } : {}),
    mediaType: input.mediaType?.startsWith('image/')
      ? input.mediaType
      : DEFAULT_ATTACHMENT_MEDIA_TYPE,
    filename: input.filename?.trim() || DEFAULT_ATTACHMENT_FILENAME,
  };
}

export function readMessageAttachments(message: UIMessage): AgentAttachment[] {
  const metadata = message.metadata;
  if (!isRecord(metadata) || !Array.isArray(metadata.attachments)) {
    return [];
  }
  return metadata.attachments.filter(isAgentAttachment);
}

/** 仅截图快捷记账会在消息元数据里声明免审批，普通对话不受历史消息影响。 */
export function shouldAutoApproveCreate(message: UIMessage): boolean {
  const metadata = message.metadata;
  return isRecord(metadata) && metadata.autoApproveCreate === true;
}

export function collectMessageAttachments(
  messages: readonly UIMessage[],
): AgentAttachment[] {
  const seen = new Set<string>();
  const attachments: AgentAttachment[] = [];

  for (const message of messages) {
    for (const attachment of readMessageAttachments(message)) {
      if (seen.has(attachment.id)) {
        continue;
      }
      seen.add(attachment.id);
      attachments.push(attachment);
    }
  }

  return attachments;
}

export function resolveAttachmentsByIds(
  attachments: readonly AgentAttachment[],
  ids: readonly string[],
): { resolved: AgentAttachment[]; missingIds: string[] } {
  const byId = new Map(
    attachments.map(attachment => [attachment.id, attachment]),
  );
  const resolved: AgentAttachment[] = [];
  const missingIds: string[] = [];

  for (const id of new Set(ids)) {
    const attachment = byId.get(id);
    if (attachment === undefined) {
      missingIds.push(id);
    } else {
      resolved.push(attachment);
    }
  }

  return { resolved, missingIds };
}

const ATTACHMENT_CAPTION_PATTERN = /^【图片附件 att_[a-z0-9_]+：.*】$/;

export function formatAttachmentCaption(attachment: AgentAttachment): string {
  return `【图片附件 ${attachment.id}：${attachment.filename}】`;
}

export function buildAttachmentMessageParts(
  files: readonly FileUIPart[],
  attachments: readonly AgentAttachment[],
  text: string,
): AgentUiPart[] {
  const parts: AgentUiPart[] = [];

  files.forEach((file, index) => {
    parts.push(file);
    const attachment = attachments[index];
    if (attachment !== undefined) {
      parts.push({ type: 'text', text: formatAttachmentCaption(attachment) });
    }
  });

  const body = text.trim();
  if (body) {
    parts.push({ type: 'text', text: body });
  }

  return parts;
}

export function stripAttachmentCaptions(text: string): string {
  return text
    .split('\n')
    .filter(line => !ATTACHMENT_CAPTION_PATTERN.test(line.trim()))
    .join('\n')
    .trim();
}

export function isUiFilePart(part: AgentUiPart): part is FileUIPart {
  return part.type === 'file';
}

export function isUiImagePart(part: AgentUiPart): part is FileUIPart {
  return part.type === 'file' && part.mediaType.startsWith('image/');
}

export function hasUiMessageImages(message: UIMessage): boolean {
  return message.parts.some(isUiImagePart);
}

export function hasUiMessageFileParts(message: UIMessage): boolean {
  return message.parts.some(isUiFilePart);
}

/**
 * 去掉消息里的文件片段；过滤后没有任何片段的消息不再发送给模型。
 * 用于把带图历史回放给不支持图片的模型。
 */
export function stripUiMessageFiles(
  messages: readonly UIMessage[],
): UIMessage[] {
  const stripped: UIMessage[] = [];

  for (const message of messages) {
    const parts = message.parts.filter(part => !isUiFilePart(part));
    if (parts.length === 0) {
      continue;
    }
    stripped.push(
      parts.length === message.parts.length ? message : { ...message, parts },
    );
  }

  return stripped;
}
