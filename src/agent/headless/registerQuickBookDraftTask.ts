import { AppRegistry } from 'react-native';

import {
  QUICK_BOOK_DRAFT_TASK_NAME,
  QuickBookDraftTask,
} from './QuickBookDraftTask';

/**
 * 注册截图记账 Headless 任务。
 * 本模块不加载 App.tsx，避免把导航、主题与 Reanimated 带进后台任务。
 */
export function registerQuickBookDraftTask(): void {
  AppRegistry.registerHeadlessTask(
    QUICK_BOOK_DRAFT_TASK_NAME,
    () => QuickBookDraftTask,
  );
}
