import type {
  FileUIPart,
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITools,
} from 'ai';

type AgentUiPart = UIMessagePart<UIDataTypes, UITools>;

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
