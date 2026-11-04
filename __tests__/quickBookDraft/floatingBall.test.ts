import { getFloatingBallEnableBlockReason } from '../../src/features/quickBookDraft/floatingBall';

const READY_CONTEXT = {
  isSupported: true,
  isConfigured: true,
  isLocalBook: true,
};

describe('getFloatingBallEnableBlockReason', () => {
  it('allows enabling when platform, model and book are all ready', () => {
    expect(getFloatingBallEnableBlockReason(READY_CONTEXT)).toBeNull();
  });

  it('rejects unsupported platforms first', () => {
    const reason = getFloatingBallEnableBlockReason({
      isSupported: false,
      isConfigured: false,
      isLocalBook: false,
    });

    expect(reason).toBe('当前平台不支持悬浮球截图记账。');
  });

  it('asks for a multimodal model before enabling', () => {
    const reason = getFloatingBallEnableBlockReason({
      ...READY_CONTEXT,
      isConfigured: false,
    });

    expect(reason).toBe('请先配置支持图片的 AI 模型。');
  });

  it('rejects remote or missing books', () => {
    const reason = getFloatingBallEnableBlockReason({
      ...READY_CONTEXT,
      isLocalBook: false,
    });

    expect(reason).toBe('悬浮球只支持本地账本，请先切换到本地账本。');
  });
});
