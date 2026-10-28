export const AGENT_NOT_CONFIGURED_MESSAGE =
  '尚未配置助手，请先打开设置添加 AI 提供商。';

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
