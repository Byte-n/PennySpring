import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { bookStorage } from '../../stores/bookStorage';
import { useBookStore } from '../../stores/bookStore';
import {
  type NewQuickTemplate,
  type QuickTemplate,
  createTemplateId,
} from './types';

const QUICK_TEMPLATE_STORE_KEY = 'pennyspring-quick-template-store';

const EMPTY_LIST: QuickTemplate[] = [];

interface QuickTemplateStore {
  /** 按账本 ID 分组的模板列表 */
  templatesByBook: Record<number, QuickTemplate[]>;
  /** 新增模板（自动生成 id 与 sort） */
  addTemplate: (bookId: number, tpl: NewQuickTemplate) => QuickTemplate;
  /** 局部更新模板 */
  updateTemplate: (bookId: number, id: string, patch: Partial<NewQuickTemplate>) => void;
  /** 删除模板 */
  deleteTemplate: (bookId: number, id: string) => void;
  /** 整体替换某账本的模板列表（用于排序） */
  setTemplates: (bookId: number, list: QuickTemplate[]) => void;
}

function nextSort(list: QuickTemplate[]): number {
  if (list.length === 0) return 1;
  return list.reduce((max, tpl) => Math.max(max, tpl.sort), 0) + 1;
}

function withBook(
  state: QuickTemplateStore,
  bookId: number,
  list: QuickTemplate[],
): QuickTemplateStore {
  return {
    ...state,
    templatesByBook: { ...state.templatesByBook, [bookId]: list },
  };
}

export const useQuickTemplateStore = create<QuickTemplateStore>()(
  persist(
    (set, get) => ({
      templatesByBook: {},

      addTemplate: (bookId, tpl) => {
        const list = get().templatesByBook[bookId] ?? [];
        const template: QuickTemplate = {
          ...tpl,
          id: createTemplateId(),
          sort: nextSort(list),
        };
        set(state => withBook(state, bookId, [...list, template]));
        return template;
      },

      updateTemplate: (bookId, id, patch) => {
        const list = get().templatesByBook[bookId] ?? [];
        const next = list.map(tpl =>
          tpl.id === id ? { ...tpl, ...patch } : tpl,
        );
        set(state => withBook(state, bookId, next));
      },

      deleteTemplate: (bookId, id) => {
        const list = get().templatesByBook[bookId] ?? [];
        const next = list.filter(tpl => tpl.id !== id);
        set(state => withBook(state, bookId, next));
      },

      setTemplates: (bookId, list) => {
        set(state => withBook(state, bookId, list));
      },
    }),
    {
      name: QUICK_TEMPLATE_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): Pick<QuickTemplateStore, 'templatesByBook'> => ({
        templatesByBook: state.templatesByBook,
      }),
    },
  ),
);

/**
 * 取当前账本的模板列表。
 * 账本切换时 currentBook.id 变化，hook 自动返回新账本下的模板。
 * 返回稳定引用：store 在 addTemplate 时按递增 sort 追加、setTemplates 整体替换，
 * 故列表天然按 sort 升序，无需在此排序以避免每次渲染生成新数组。
 */
export function useQuickTemplates(): QuickTemplate[] {
  const bookId = useBookStore(state => state.currentBook?.id);
  return useQuickTemplateStore(state => {
    if (bookId === undefined) {
      return EMPTY_LIST;
    }
    return state.templatesByBook[bookId] ?? EMPTY_LIST;
  });
}
