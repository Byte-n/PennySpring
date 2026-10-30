export const AGENT_NOT_CONFIGURED_MESSAGE =
  '尚未配置助手，请先打开设置添加 AI 提供商。';

export const AGENT_NO_MODEL_MESSAGE =
  '当前提供商还没有可用模型，请先在模型设置中添加。';

export const AGENT_MODEL_NO_IMAGE_MESSAGE =
  '当前模型不支持图片，请先切换到支持多模态的模型。';

export const AGENT_IMAGE_UNREADABLE_MESSAGE =
  '有图片读取失败，请重新选择后再发送。';

export const AGENT_IMAGE_PICK_FAILED_MESSAGE = '选择图片失败，请稍后再试。';

export const AGENT_IMAGE_UNAVAILABLE_MESSAGE = '当前会话暂不支持发送图片。';

export const IMAGE_MESSAGE_TITLE = '图片消息';

export const EMPTY_REPLY_MESSAGE = '助手没有返回内容，请换个问法再试。';

export const PARTIAL_SAVE_FAILED_MESSAGE = '回答已生成，但保存到本地失败。';

export const TITLE_MAX_LENGTH = 30;

export const THINKING_TEXT = '正在思考…';

export const QUERY_RECORDS_TOOL_NAME = 'queryRecords';

export function toolStatusText(toolName: string, isDone: boolean): string {
  const label =
    toolName === QUERY_RECORDS_TOOL_NAME ? '账本数据' : '工具';
  return isDone ? `已查询${label}` : `正在查询${label}…`;
}

export function toolErrorText(toolName: string): string {
  const label =
    toolName === QUERY_RECORDS_TOOL_NAME ? '账本数据' : '工具';
  return `查询${label}失败，请稍后再试。`;
}
