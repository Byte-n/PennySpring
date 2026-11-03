import { createLanMessageHandlers } from '../../src/features/backup/lanSessionMessages';
import type { LanSessionView } from '../../src/features/backup/lanSessionModel';
import {
  createVerificationCode,
  type LanMessage,
  type LanPeer,
} from '../../src/features/backup/lanProtocol';

const selfPeer: LanPeer = {
  id: 'self',
  name: '本机',
  platform: 'ios',
  nonce: 'self-nonce',
  host: '192.168.1.2',
  port: 5000,
};

const peer: LanPeer = {
  id: 'peer',
  name: '对方的手机',
  platform: 'android',
  nonce: 'peer-nonce',
  host: '192.168.1.3',
  port: 6000,
};

function createInitialState(): LanSessionView {
  return {
    supported: true,
    phase: 'discovering',
    session: {
      ...selfPeer,
      urls: ['http://192.168.1.2:5000'],
    },
    localCode: '123456',
    nearby: [],
    pairTarget: null,
    pairCode: '',
    pairError: '',
    incomingPair: null,
    connectedPeer: null,
    verificationCode: '',
    sessionToken: '',
    incomingOffer: null,
    outgoingOffer: null,
    transfer: null,
    result: null,
    errorText: '',
    busy: false,
  };
}

function createHarness(initial: Partial<LanSessionView> = {}) {
  let state: LanSessionView = { ...createInitialState(), ...initial };
  const sent: LanMessage[] = [];
  const pairRequestIdRef = { current: '' };
  const wrongCodeAttemptsRef = { current: 0 };
  const clearPairTimeout = jest.fn();
  const clearOfferTimeout = jest.fn();
  const commit = jest.fn((patch: Partial<LanSessionView>) => {
    state = { ...state, ...patch };
  });

  const handleMessage = createLanMessageHandlers({
    getState: () => state,
    commit,
    getLocalPeer: () => selfPeer,
    sendTo: async (_target, message) => {
      sent.push(message);
    },
    clearPairTimeout,
    clearOfferTimeout,
    pairRequestIdRef,
    wrongCodeAttemptsRef,
  });

  return {
    handleMessage,
    getState: () => state,
    sent,
    pairRequestIdRef,
    wrongCodeAttemptsRef,
    clearPairTimeout,
    clearOfferTimeout,
  };
}

describe('LAN session message handling', () => {
  it('shows a pairing request when the entered code matches', async () => {
    const harness = createHarness();

    await harness.handleMessage({
      kind: 'pair',
      from: peer,
      requestId: 'pair-1',
      code: '123456',
    });

    expect(harness.getState().incomingPair).toEqual({
      peer,
      requestId: 'pair-1',
      verificationCode: createVerificationCode(selfPeer.nonce, peer.nonce),
    });
    expect(harness.getState().phase).toBe('waiting-peer');
  });

  it('rejects a wrong pairing code and rotates after five attempts', async () => {
    const harness = createHarness();

    for (let index = 0; index < 4; index += 1) {
      await harness.handleMessage({
        kind: 'pair',
        from: peer,
        requestId: `pair-${index}`,
        code: '000000',
      });
    }

    expect(harness.getState().incomingPair).toBeNull();
    expect(harness.wrongCodeAttemptsRef.current).toBe(4);
    expect(harness.sent).toHaveLength(4);
    expect(harness.sent[0]).toMatchObject({
      kind: 'pair-confirm',
      accepted: false,
      reason: 'code',
    });

    await harness.handleMessage({
      kind: 'pair',
      from: peer,
      requestId: 'pair-5',
      code: '000000',
    });

    expect(harness.wrongCodeAttemptsRef.current).toBe(0);
    expect(harness.getState().localCode).not.toBe('123456');
  });

  it('connects only when the returned verification code matches', async () => {
    const harness = createHarness({
      phase: 'waiting-peer',
      verificationCode: 'ABCD',
    });
    harness.pairRequestIdRef.current = 'pair-1';

    await harness.handleMessage({
      kind: 'pair-confirm',
      from: peer,
      requestId: 'pair-1',
      accepted: true,
      verificationCode: 'WRONG',
      sessionToken: 'a'.repeat(32),
    });

    expect(harness.getState().connectedPeer).toBeNull();
    expect(harness.getState().pairError).toBe('校验码不一致，请重新连接');

    harness.pairRequestIdRef.current = 'pair-2';
    await harness.handleMessage({
      kind: 'pair-confirm',
      from: peer,
      requestId: 'pair-2',
      accepted: true,
      verificationCode: 'ABCD',
      sessionToken: 'a'.repeat(32),
    });

    expect(harness.getState()).toMatchObject({
      phase: 'connected',
      connectedPeer: peer,
      sessionToken: 'a'.repeat(32),
      verificationCode: 'ABCD',
    });
  });

  it('exposes an incoming transfer offer and rejects unexpected peers', async () => {
    const harness = createHarness({
      phase: 'connected',
      connectedPeer: peer,
      sessionToken: 'token',
    });

    await harness.handleMessage({
      kind: 'offer',
      from: peer,
      offerId: 'offer-1',
      sessionToken: 'wrong-token',
      fileName: '日常账本.psb',
      sizeBytes: 100,
      totalRecords: 10,
      books: [{ name: '日常账本', records: 10, assets: 1, images: 0 }],
    });

    expect(harness.getState().incomingOffer).toBeNull();
    expect(harness.sent[0]).toMatchObject({
      kind: 'offer-response',
      accepted: false,
      reason: 'denied',
    });

    await harness.handleMessage({
      kind: 'offer',
      from: peer,
      offerId: 'offer-2',
      sessionToken: 'token',
      fileName: '日常账本.psb',
      sizeBytes: 100,
      totalRecords: 10,
      books: [{ name: '日常账本', records: 10, assets: 1, images: 0 }],
    });

    expect(harness.getState().incomingOffer).toMatchObject({
      offerId: 'offer-2',
      peer,
    });
  });

  it('starts sending after the receiver accepts the offer', async () => {
    const harness = createHarness({
      phase: 'waiting-offer',
      connectedPeer: peer,
      sessionToken: 'token',
      outgoingOffer: {
        offerId: 'offer-1',
        peer,
        sessionToken: 'token',
        fileName: '日常账本.psb',
        sizeBytes: 100,
        totalRecords: 10,
        books: [],
      },
    });

    await harness.handleMessage({
      kind: 'offer-response',
      from: peer,
      offerId: 'offer-1',
      accepted: true,
    });

    expect(harness.getState().phase).toBe('sending');
    expect(harness.getState().transfer).toMatchObject({
      direction: 'send',
      fileName: '日常账本.psb',
    });
    expect(harness.clearOfferTimeout).toHaveBeenCalled();
  });

  it('reports success or failure when the receiver finishes', async () => {
    const base = {
      phase: 'sending' as const,
      connectedPeer: peer,
      sessionToken: 'token',
      outgoingOffer: {
        offerId: 'offer-1',
        peer,
        sessionToken: 'token',
        fileName: '日常账本.psb',
        sizeBytes: 100,
        totalRecords: 10,
        books: [],
      },
    };

    const success = createHarness(base);
    await success.handleMessage({
      kind: 'transfer-complete',
      from: peer,
      sessionToken: 'token',
      success: true,
    });
    expect(success.getState().result).toMatchObject({
      status: 'success',
      title: '发送完成',
    });

    const failure = createHarness(base);
    await failure.handleMessage({
      kind: 'transfer-complete',
      from: peer,
      sessionToken: 'token',
      success: false,
    });
    expect(failure.getState().result).toMatchObject({
      status: 'error',
      title: '发送失败',
    });
  });

  it('resets the session when the peer disconnects', async () => {
    const harness = createHarness({
      phase: 'connected',
      connectedPeer: peer,
      sessionToken: 'token',
    });

    await harness.handleMessage({ kind: 'disconnect', from: peer });

    expect(harness.getState()).toMatchObject({
      phase: 'discovering',
      connectedPeer: null,
      sessionToken: '',
      errorText: '对方已断开连接',
    });
  });
});
