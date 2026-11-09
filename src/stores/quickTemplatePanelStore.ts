import { create } from 'zustand';

interface QuickTemplatePanelState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/** 首页快捷模板浮层的全局开关；供小组件深链从应用根打开。 */
export const useQuickTemplatePanelStore = create<QuickTemplatePanelState>(
  set => ({
    open: false,
    setOpen: open => set({ open }),
  }),
);
