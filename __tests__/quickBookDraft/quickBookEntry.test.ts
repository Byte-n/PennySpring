import type { QuickBookDraftNativeStatus } from '../../src/features/quickBookDraft/native';
import {
  getQuickBookEntryEnableBlockReason,
  isEntryActive,
  isEntryPermissionMissing,
} from '../../src/features/quickBookDraft/quickBookEntry';

const READY_CONTEXT = {
  isSupported: true,
  isConfigured: true,
};

const READY_STATUS: QuickBookDraftNativeStatus = {
  overlayPermission: true,
  notificationPermission: true,
  accessibilityPermission: true,
  floatingBallRunning: false,
  notificationTriggerActive: false,
  entryDisabledByUser: false,
  supported: true,
  excludedPackages: [],
};

describe('getQuickBookEntryEnableBlockReason', () => {
  it('allows enabling when platform, model and book are all ready', () => {
    expect(getQuickBookEntryEnableBlockReason(READY_CONTEXT)).toBeNull();
  });

  it('rejects unsupported platforms first', () => {
    const reason = getQuickBookEntryEnableBlockReason({
      isSupported: false,
      isConfigured: false,
    });

    expect(reason).toBe('当前平台不支持截图记账入口。');
  });

  it('asks for a multimodal model before enabling', () => {
    const reason = getQuickBookEntryEnableBlockReason({
      ...READY_CONTEXT,
      isConfigured: false,
    });

    expect(reason).toBe('请先配置支持图片的 AI 模型。');
  });
});

describe('isEntryPermissionMissing', () => {
  it('does not require overlay permission in notification mode', () => {
    expect(
      isEntryPermissionMissing(
        { ...READY_STATUS, overlayPermission: false },
        'notification',
      ),
    ).toBe(false);
  });

  it('requires overlay permission in floating ball mode', () => {
    expect(
      isEntryPermissionMissing(
        { ...READY_STATUS, overlayPermission: false },
        'floatingBall',
      ),
    ).toBe(true);
  });

  it('requires notification and accessibility permissions in both modes', () => {
    expect(
      isEntryPermissionMissing(
        { ...READY_STATUS, notificationPermission: false },
        'floatingBall',
      ),
    ).toBe(true);
    expect(
      isEntryPermissionMissing(
        { ...READY_STATUS, accessibilityPermission: false },
        'notification',
      ),
    ).toBe(true);
  });
});

describe('isEntryActive', () => {
  it('reads the active flag for the selected mode', () => {
    const floatingBallStatus = {
      ...READY_STATUS,
      floatingBallRunning: true,
    };
    const notificationStatus = {
      ...READY_STATUS,
      notificationTriggerActive: true,
    };

    expect(isEntryActive(floatingBallStatus, 'floatingBall')).toBe(true);
    expect(isEntryActive(floatingBallStatus, 'notification')).toBe(false);
    expect(isEntryActive(notificationStatus, 'notification')).toBe(true);
    expect(isEntryActive(notificationStatus, 'floatingBall')).toBe(false);
  });
});
