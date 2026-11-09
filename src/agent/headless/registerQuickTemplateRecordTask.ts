import { AppRegistry } from 'react-native';

import {
  QUICK_TEMPLATE_RECORD_TASK_NAME,
  QuickTemplateRecordTask,
} from './QuickTemplateRecordTask';

/**
 * 注册桌面小组件直接记账 Headless 任务。
 * 本模块不加载 App.tsx，避免把导航、主题与动画带进后台任务。
 */
export function registerQuickTemplateRecordTask(): void {
  AppRegistry.registerHeadlessTask(
    QUICK_TEMPLATE_RECORD_TASK_NAME,
    () => QuickTemplateRecordTask,
  );
}
