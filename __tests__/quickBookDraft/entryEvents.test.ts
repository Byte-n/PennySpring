import { DeviceEventEmitter } from 'react-native';

import { subscribeEntryDisabledByUser } from '../../src/features/quickBookDraft/entryEvents';

const ENTRY_DISABLED_BY_USER_EVENT = 'QuickBookDraftEntryDisabledByUser';

describe('subscribeEntryDisabledByUser', () => {
  it('calls the handler when the native event fires', () => {
    const handler = jest.fn();
    const unsubscribe = subscribeEntryDisabledByUser(handler);

    DeviceEventEmitter.emit(ENTRY_DISABLED_BY_USER_EVENT);

    expect(handler).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('stops listening after unsubscribe', () => {
    const handler = jest.fn();
    const unsubscribe = subscribeEntryDisabledByUser(handler);
    unsubscribe();

    DeviceEventEmitter.emit(ENTRY_DISABLED_BY_USER_EVENT);

    expect(handler).not.toHaveBeenCalled();
  });
});
