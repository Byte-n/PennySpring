import { create } from 'zustand';

interface SyncVersionState {
  providerVersion: number;
  templateVersion: number;
  recordVersion: number;
  bumpProviderVersion: () => void;
  bumpTemplateVersion: () => void;
  bumpRecordVersion: () => void;
}

/**
 * 全局失效信号：写入方只负责 bump，读取方把对应版本放进 refreshDeps。
 * recordVersion 覆盖所有会改变当前账本记录/资产余额的写入。
 */
export const useSyncVersionStore = create<SyncVersionState>(set => ({
  providerVersion: 0,
  templateVersion: 0,
  recordVersion: 0,
  bumpProviderVersion: () =>
    set(state => ({ providerVersion: state.providerVersion + 1 })),
  bumpTemplateVersion: () =>
    set(state => ({ templateVersion: state.templateVersion + 1 })),
  bumpRecordVersion: () =>
    set(state => ({ recordVersion: state.recordVersion + 1 })),
}));

/** 非 React 写入路径（如 agent 工具）使用的命令入口。 */
export function bumpRecordVersion(): void {
  useSyncVersionStore.getState().bumpRecordVersion();
}

export function useRecordVersion(): number {
  return useSyncVersionStore(state => state.recordVersion);
}
