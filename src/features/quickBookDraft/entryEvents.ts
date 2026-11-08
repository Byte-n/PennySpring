import { DeviceEventEmitter } from 'react-native';

const ENTRY_DISABLED_BY_USER_EVENT = 'QuickBookDraftEntryDisabledByUser';

/** 原生通知动作已在通知栏关闭入口；JS 消费原生标记并关闭设置开关。 */
export function subscribeEntryDisabledByUser(handler: () => void): () => void {
  const subscription = DeviceEventEmitter.addListener(
    ENTRY_DISABLED_BY_USER_EVENT,
    handler,
  );
  return () => {
    subscription.remove();
  };
}
