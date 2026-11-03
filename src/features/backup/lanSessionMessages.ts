import type { MutableRefObject } from 'react';

import {
  createLanCode,
  createVerificationCode,
  type LanMessage,
  type LanOfferMessage,
  type LanPairConfirmMessage,
  type LanPairMessage,
  type LanPeer,
} from './lanProtocol';
import type { LanSessionView } from './lanSessionModel';

const MAX_CODE_ATTEMPTS = 5;

export interface LanMessageContext {
  getState: () => LanSessionView;
  commit: (patch: Partial<LanSessionView>) => void;
  getLocalPeer: () => LanPeer | null;
  sendTo: (peer: LanPeer, message: LanMessage) => Promise<void>;
  clearPairTimeout: () => void;
  clearOfferTimeout: () => void;
  pairRequestIdRef: MutableRefObject<string>;
  wrongCodeAttemptsRef: MutableRefObject<number>;
}

function pairErrorText(reason: string | undefined): string {
  switch (reason) {
    case 'code':
      return '口令不正确，请核对对方屏幕';
    case 'busy':
      return '对方正在处理另一台设备';
    case 'expired':
      return '连接请求已过期';
    default:
      return '对方拒绝了连接';
  }
}

export function createLanMessageHandlers(ctx: LanMessageContext) {
  const handlePairMessage = async (message: LanPairMessage): Promise<void> => {
    const state = ctx.getState();
    if (
      state.connectedPeer ||
      state.incomingPair ||
      state.pairTarget ||
      state.phase === 'waiting-peer' ||
      state.phase === 'sending' ||
      state.phase === 'receiving' ||
      state.phase === 'waiting-offer'
    ) {
      const self = ctx.getLocalPeer();
      if (self) {
        await ctx.sendTo(message.from, {
          kind: 'pair-confirm',
          from: self,
          requestId: message.requestId,
          accepted: false,
          reason: 'busy',
        });
      }
      return;
    }

    if (message.code !== state.localCode) {
      ctx.wrongCodeAttemptsRef.current += 1;
      const self = ctx.getLocalPeer();
      if (self) {
        await ctx.sendTo(message.from, {
          kind: 'pair-confirm',
          from: self,
          requestId: message.requestId,
          accepted: false,
          reason: 'code',
        });
      }
      if (ctx.wrongCodeAttemptsRef.current >= MAX_CODE_ATTEMPTS) {
        ctx.wrongCodeAttemptsRef.current = 0;
        ctx.commit({ localCode: createLanCode() });
      }
      return;
    }

    const session = state.session;
    if (!session) return;

    ctx.wrongCodeAttemptsRef.current = 0;
    ctx.commit({
      incomingPair: {
        peer: message.from,
        requestId: message.requestId,
        verificationCode: createVerificationCode(
          session.nonce,
          message.from.nonce,
        ),
      },
      phase: 'waiting-peer',
      pairError: '',
    });
  };

  const handlePairConfirm = async (
    message: LanPairConfirmMessage,
  ): Promise<void> => {
    const state = ctx.getState();
    if (message.requestId !== ctx.pairRequestIdRef.current) return;
    ctx.clearPairTimeout();

    if (!message.accepted) {
      ctx.pairRequestIdRef.current = '';
      ctx.commit({
        phase: 'discovering',
        pairError: pairErrorText(message.reason),
        busy: false,
      });
      return;
    }

    if (
      !message.verificationCode ||
      message.verificationCode !== state.verificationCode ||
      !message.sessionToken
    ) {
      ctx.pairRequestIdRef.current = '';
      ctx.commit({
        phase: 'discovering',
        pairError: '校验码不一致，请重新连接',
        pairTarget: null,
        busy: false,
      });
      return;
    }

    ctx.pairRequestIdRef.current = '';
    ctx.commit({
      phase: 'connected',
      connectedPeer: message.from,
      sessionToken: message.sessionToken,
      verificationCode: message.verificationCode,
      pairTarget: null,
      pairCode: '',
      pairError: '',
      busy: false,
    });
  };

  const handleOfferMessage = async (
    message: LanOfferMessage,
  ): Promise<void> => {
    const state = ctx.getState();
    const self = ctx.getLocalPeer();
    if (!self) return;

    const isExpectedPeer =
      state.connectedPeer?.id === message.from.id &&
      state.sessionToken === message.sessionToken;

    if (!isExpectedPeer || state.phase !== 'connected' || state.incomingOffer) {
      await ctx.sendTo(message.from, {
        kind: 'offer-response',
        from: self,
        offerId: message.offerId,
        accepted: false,
        reason: isExpectedPeer ? 'busy' : 'denied',
      });
      return;
    }

    ctx.commit({
      incomingOffer: {
        offerId: message.offerId,
        peer: message.from,
        sessionToken: message.sessionToken,
        fileName: message.fileName,
        sizeBytes: message.sizeBytes,
        totalRecords: message.totalRecords,
        books: message.books,
      },
    });
  };

  const handleOfferResponse = (message: {
    offerId: string;
    accepted: boolean;
    reason?: string;
  }): void => {
    const state = ctx.getState();
    if (
      !state.outgoingOffer ||
      message.offerId !== state.outgoingOffer.offerId
    ) {
      return;
    }
    ctx.clearOfferTimeout();

    if (!message.accepted) {
      ctx.commit({
        phase: 'connected',
        outgoingOffer: null,
        errorText:
          message.reason === 'busy'
            ? '对方正在处理另一台设备'
            : '对方拒绝了传输',
      });
      return;
    }

    ctx.commit({
      phase: 'sending',
      transfer: {
        direction: 'send',
        fileName: state.outgoingOffer.fileName,
        sizeBytes: state.outgoingOffer.sizeBytes,
        bytesRead: 0,
        percent: 0,
      },
    });
  };

  const handleTransferComplete = (message: {
    sessionToken?: string;
    success: boolean;
    from: LanPeer;
  }): void => {
    const state = ctx.getState();
    if (message.sessionToken !== state.sessionToken) return;
    if (message.from.id !== state.connectedPeer?.id) return;
    if (state.phase !== 'sending') return;

    if (!message.success) {
      ctx.commit({
        phase: 'connected',
        outgoingOffer: null,
        transfer: null,
        result: {
          status: 'error',
          direction: 'send',
          title: '发送失败',
          subtitle: '对方未能完成导入，请重试',
        },
      });
      return;
    }

    ctx.commit({
      phase: 'done',
      outgoingOffer: null,
      transfer: null,
      result: {
        status: 'success',
        direction: 'send',
        title: '发送完成',
        subtitle: state.connectedPeer
          ? `账本已送达 ${state.connectedPeer.name}`
          : '账本已送达接收端',
      },
    });
  };

  const handleDisconnect = (message: { from: LanPeer }): void => {
    const state = ctx.getState();
    if (message.from.id !== state.connectedPeer?.id) return;
    ctx.clearPairTimeout();
    ctx.clearOfferTimeout();
    ctx.commit({
      phase: 'discovering',
      connectedPeer: null,
      sessionToken: '',
      verificationCode: '',
      incomingPair: null,
      incomingOffer: null,
      outgoingOffer: null,
      transfer: null,
      result: null,
      errorText: '对方已断开连接',
    });
  };

  return async (message: LanMessage): Promise<void> => {
    switch (message.kind) {
      case 'pair':
        await handlePairMessage(message);
        break;
      case 'pair-confirm':
        await handlePairConfirm(message);
        break;
      case 'offer':
        await handleOfferMessage(message);
        break;
      case 'offer-response':
        handleOfferResponse(message);
        break;
      case 'transfer-complete':
        handleTransferComplete(message);
        break;
      case 'disconnect':
        handleDisconnect(message);
        break;
      default:
        break;
    }
  };
}
