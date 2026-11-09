import { NativeModules, Platform } from 'react-native';

export interface QuickTemplateWidgetTemplate {
  id: number;
  name: string;
}

export interface QuickTemplateWidgetBook {
  kind: 'local' | 'remote';
  serverUrl: string;
  booksId: number;
  bookName: string;
  available: boolean;
  unavailableReason: string;
  templates: QuickTemplateWidgetTemplate[];
}

export interface QuickTemplateWidgetCatalog {
  version: number;
  book: QuickTemplateWidgetBook | null;
}

export interface QuickTemplateRecordOutcome {
  requestId: string;
  status: 'success' | 'failed';
  templateName?: string;
  amountCents?: number;
  message?: string;
}

interface QuickTemplateWidgetNativeModule {
  setCatalog: (catalogJson: string) => Promise<unknown>;
  reportRecordOutcome: (
    outcome: QuickTemplateRecordOutcome,
  ) => Promise<unknown>;
}

function getNativeModule(): QuickTemplateWidgetNativeModule | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  return (
    (NativeModules.QuickTemplateWidget as
      QuickTemplateWidgetNativeModule | undefined) ?? null
  );
}

export function hasQuickTemplateWidgetNativeModule(): boolean {
  return getNativeModule() !== null;
}

function toChineseError(action: string): Error {
  return new Error(`无法${action}，请稍后重试`);
}

export async function setQuickTemplateWidgetCatalog(
  catalogJson: string,
): Promise<boolean> {
  const module = getNativeModule();
  if (!module) {
    return false;
  }
  try {
    return (await module.setCatalog(catalogJson)) === true;
  } catch {
    throw toChineseError('同步桌面小组件');
  }
}

export async function reportQuickTemplateRecordOutcome(
  outcome: QuickTemplateRecordOutcome,
): Promise<void> {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    await module.reportRecordOutcome(outcome);
  } catch {
    throw toChineseError('回报桌面小组件记账结果');
  }
}
