import type { Api } from '@pennyspring/api';

import { resolveBookApi } from '../../features/quickBookDraft/bookApi';
import type { QuickTemplateRecordTaskInput } from '../../features/quickTemplateWidget/taskData';
import { bumpRecordVersion } from '../../stores/syncVersionStore';
import {
  buildCreateRecordInput,
  validateAddRecordDraft,
} from '../../screens/addRecord/addRecordDraft';
import {
  buildDraftFromTemplate,
  tabTypeFor,
} from '../../screens/quickTemplate/buildDraft';

export interface QuickTemplateRecordResult {
  templateName: string;
  amountCents: number;
}

/**
 * 按模板直接写入一条记录。
 * 与应用内快捷模板面板共用同一套草稿校验与 createRecord 输入构造。
 */
export async function runQuickTemplateRecord(
  input: QuickTemplateRecordTaskInput,
): Promise<QuickTemplateRecordResult> {
  const api: Api = await resolveBookApi(input.target);
  const templates = await api.quickTemplate.list(input.target.booksId);
  const template = templates.find(item => item.id === input.templateId);
  if (!template) {
    throw new Error('模板已失效，请打开应用刷新');
  }
  const types = await api.type.getAll(input.target.booksId);
  const typeRow = types.find(item => item.id === template.typeId);
  if (!typeRow) {
    throw new Error('模板分类已失效，请打开应用编辑');
  }

  const tabType = tabTypeFor(typeRow);
  const draft = buildDraftFromTemplate(template, input.target.booksId, typeRow);
  const validationMessage = validateAddRecordDraft(tabType, draft);
  if (validationMessage !== undefined) {
    throw new Error(validationMessage);
  }
  await api.record.create(buildCreateRecordInput(tabType, draft));
  bumpRecordVersion();

  return {
    templateName: template.name,
    amountCents: template.amount,
  };
}
