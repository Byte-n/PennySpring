/** 草稿操作错误：优先使用数据层/任务的中文错误，否则回退通用文案。 */
export function getDraftErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
