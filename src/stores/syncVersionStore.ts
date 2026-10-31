import { create } from 'zustand';

interface SyncVersionState {
  providerVersion: number;
  templateVersion: number;
  bumpProviderVersion: () => void;
  bumpTemplateVersion: () => void;
}

/** 服务器级 provider/选择与账本级模板写入后的失效信号。 */
export const useSyncVersionStore = create<SyncVersionState>(set => ({
  providerVersion: 0,
  templateVersion: 0,
  bumpProviderVersion: () =>
    set(state => ({ providerVersion: state.providerVersion + 1 })),
  bumpTemplateVersion: () =>
    set(state => ({ templateVersion: state.templateVersion + 1 })),
}));
