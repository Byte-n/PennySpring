/**
 * 用户可调整的助手规则。角色、工具用法与安全约束不放在这里，
 * 由 buildSystemPrompt / buildQuickBookDraftSystemPrompt 固定拼接。
 */
export const DEFAULT_AGENT_RULES = [
  '1. 金额无法确定时先问我，不要猜。',
  '2. 分类由你按账本里的分类自行判断，优先选最具体的；拿不准时选最接近的，不要为分类反复问我。',
  '3. 日期不明确时按今天。',
  '4. 回答用中文、结论简洁，金额保留两位小数；没有记录就直接说没有。',
].join('\n');

export const DEFAULT_QUICK_BOOK_DRAFT_RULES = [
  '1. 分类拿不准时留空，不要为分类反复确认。',
  '2. 日期不明确按今天，时间不明确按当前时间。',
  '3. 一张图片有多笔交易时，按实际笔数拆开。',
  '4. 用中文写摘要和提示；提示只写这一笔缺了什么或哪里不确定。',
].join('\n');

export function resolvePromptRules(
  customRules: string | undefined,
  defaultRules: string,
): string {
  const trimmed = customRules?.trim();
  return trimmed ? trimmed : defaultRules;
}
