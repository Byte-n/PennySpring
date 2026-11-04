import { create } from 'zustand';

interface DraftVersionState {
  draftVersion: number;
  bumpDraftVersion: () => void;
}

/**
 * 草稿全局失效信号：生成、确认、丢弃与重试后由写入方 bump，
 * 草稿 Tab、角标与详情把 draftVersion 放进刷新依赖。
 */
export const useDraftVersionStore = create<DraftVersionState>(set => ({
  draftVersion: 0,
  bumpDraftVersion: () =>
    set(state => ({ draftVersion: state.draftVersion + 1 })),
}));

/** 非 React 写入路径（如 headless 任务、agent 工具）使用的命令入口。 */
export function bumpDraftVersion(): void {
  useDraftVersionStore.getState().bumpDraftVersion();
}

export function useDraftVersion(): number {
  return useDraftVersionStore(state => state.draftVersion);
}
