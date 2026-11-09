import './src/agent/runtime/polyfills';
import './src/utils/prototype';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { registerQuickBookDraftTask } from './src/agent/headless/registerQuickBookDraftTask';
import { registerQuickTemplateRecordTask } from './src/agent/headless/registerQuickTemplateRecordTask';

registerQuickBookDraftTask();
registerQuickTemplateRecordTask();
// Headless 任务与 App 共用入口；延迟加载 App，避免后台任务带入导航、主题与动画依赖。
AppRegistry.registerComponent(appName, () => require('./App').default);
