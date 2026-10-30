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

export const THINKING_LABEL = '思考过程';

export const QUERY_RECORDS_TOOL_NAME = 'queryRecords';
export const CREATE_RECORD_TOOL_NAME = 'createRecord';

const TOOL_LABELS: Record<string, string> = {
  queryRecords: '账本数据',
  listTypes: '类型清单',
  listTags: '标签清单',
  listAssets: '资产清单',
  createRecord: '记账',
};

function toolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] ?? '工具';
}

export function toolStatusText(toolName: string, isDone: boolean): string {
  if (toolName === CREATE_RECORD_TOOL_NAME) {
    return isDone ? '已记账' : '正在记账…';
  }
  const label = toolLabel(toolName);
  return isDone ? `已查询${label}` : `正在查询${label}…`;
}

export function toolErrorText(toolName: string): string {
  if (toolName === CREATE_RECORD_TOOL_NAME) {
    return '记账失败，请稍后再试。';
  }
  return `查询${toolLabel(toolName)}失败，请稍后再试。`;
}
