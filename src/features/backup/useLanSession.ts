import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  clearLanMessages,
  createLanSessionToken,
  getLanMessages,
  getLanNearby,
  getLanServerStatus,
  isLanTransferSupported,
  sendLanMessage,
  setLanPackage,
  startLanSession,
  stopLanSession,
  toLanPeer,
  type LanSessionInfo,
} from './lan';
import { downloadLanPackage, type LanDownloadProgress } from './lanDownload';
import {
  createLanCode,
  createLanRequestId,
  createVerificationCode,
  isValidLanCode,
  parseLanMessage,
  type LanMessage,
  type LanPeer,
} from './lanProtocol';
import { createLanMessageHandlers } from './lanSessionMessages';
import type {
  LanOffer,
  LanOfferInput,
  LanSessionView,
} from './lanSessionModel';

export type {
  LanIncomingPair,
  LanOffer,
  LanOfferInput,
  LanPhase,
  LanResult,
  LanSessionView,
  LanTransferState,
} from './lanSessionModel';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const NEARBY_POLL_MS = 1000;
const MESSAGE_POLL_MS = 400;
const STATUS_POLL_MS = 1500;
const PAIR_TIMEOUT_MS = 10 * 60 * 1000;
const OFFER_TIMEOUT_MS = 2 * 60 * 1000;
const CODE_ROTATE_MS = 10 * 60 * 1000;

const INITIAL_STATE: LanSessionView = {
  supported: false,
  phase: 'starting',
  session: null,
  localCode: '',
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

type TimeoutHandle = ReturnType<typeof setTimeout>;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useLanSession() {
  const supported = isLanTransferSupported();
  const [view, setView] = useState<LanSessionView>(INITIAL_STATE);
  const stateRef = useRef<LanSessionView>(INITIAL_STATE);
  const pairRequestIdRef = useRef('');
  const sessionRef = useRef<LanSessionInfo | null>(null);
  const mountedRef = useRef(true);
  const startingRef = useRef(false);
  const pollingNearbyRef = useRef(false);
  const pollingMessagesRef = useRef(false);
  const pollingStatusRef = useRef(false);
  const wrongCodeAttemptsRef = useRef(0);
  const pairTimeoutRef = useRef<TimeoutHandle | null>(null);
  const offerTimeoutRef = useRef<TimeoutHandle | null>(null);
  const codeRotateTimerRef = useRef<TimeoutHandle | null>(null);

  const commit = useCallback((patch: Partial<LanSessionView>): void => {
    if (!mountedRef.current) return;
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setView(next);
  }, []);

  const clearPairTimeout = useCallback((): void => {
    if (pairTimeoutRef.current) {
      clearTimeout(pairTimeoutRef.current);
      pairTimeoutRef.current = null;
    }
  }, []);

  const clearOfferTimeout = useCallback((): void => {
    if (offerTimeoutRef.current) {
      clearTimeout(offerTimeoutRef.current);
      offerTimeoutRef.current = null;
    }
  }, []);

  const scheduleCodeRotation = useCallback((): void => {
    if (codeRotateTimerRef.current) {
      clearTimeout(codeRotateTimerRef.current);
    }
    codeRotateTimerRef.current = setTimeout(() => {
      const state = stateRef.current;
      if (
        state.phase === 'discovering' &&
        !state.pairTarget &&
        !state.incomingPair &&
        !state.connectedPeer
      ) {
        wrongCodeAttemptsRef.current = 0;
        commit({ localCode: createLanCode() });
      }
      scheduleCodeRotation();
    }, CODE_ROTATE_MS);
  }, [commit]);

  const localPeer = useCallback((): LanPeer | null => {
    const session = sessionRef.current;
    return session ? toLanPeer(session) : null;
  }, []);

  const sendTo = useCallback(
    async (peer: LanPeer, message: LanMessage): Promise<void> => {
      await sendLanMessage(peer, message);
    },
    [],
  );

  const handleMessage = useMemo(
    () =>
      createLanMessageHandlers({
        getState: () => stateRef.current,
        commit,
        getLocalPeer: localPeer,
        sendTo,
        clearPairTimeout,
        clearOfferTimeout,
        pairRequestIdRef,
        wrongCodeAttemptsRef,
      }),
    [clearOfferTimeout, clearPairTimeout, commit, localPeer, sendTo],
  );

  useEffect(() => {
    mountedRef.current = true;
    if (!supported) {
      commit({
        supported: false,
        phase: 'error',
        errorText: '当前安装包不支持局域网发现，请重新构建应用',
      });
      return () => {
        mountedRef.current = false;
      };
    }

    if (startingRef.current) return undefined;
    startingRef.current = true;

    const start = async (): Promise<void> => {
      try {
        const session = await startLanSession(SESSION_TIMEOUT_MS);
        if (!mountedRef.current) {
          await stopLanSession().catch(() => undefined);
          return;
        }
        sessionRef.current = session;
        commit({
          supported: true,
          session,
          phase: 'discovering',
          localCode: createLanCode(),
          errorText: '',
        });
        scheduleCodeRotation();
      } catch (error: unknown) {
        commit({
          supported: true,
          phase: 'error',
          errorText: getErrorMessage(error, '无法启动局域网服务'),
        });
      }
    };

    start().catch(() => undefined);

    return () => {
      mountedRef.current = false;
      startingRef.current = false;
      clearPairTimeout();
      clearOfferTimeout();
      if (codeRotateTimerRef.current) {
        clearTimeout(codeRotateTimerRef.current);
        codeRotateTimerRef.current = null;
      }
      sessionRef.current = null;
      stopLanSession().catch(() => undefined);
    };
  }, [
    clearOfferTimeout,
    clearPairTimeout,
    commit,
    scheduleCodeRotation,
    supported,
  ]);

  useEffect(() => {
    if (!supported || view.phase === 'starting' || view.phase === 'error') {
      return undefined;
    }

    let active = true;

    const pollNearby = async (): Promise<void> => {
      if (pollingNearbyRef.current || !active) return;
      pollingNearbyRef.current = true;
      try {
        const peers = await getLanNearby();
        if (!active) return;
        const selfId = sessionRef.current?.id;
        commit({ nearby: peers.filter(peer => peer.id !== selfId) });
      } catch {
        // 发现失败下一轮继续，不打断当前会话。
      } finally {
        pollingNearbyRef.current = false;
      }
    };

    const pollMessages = async (): Promise<void> => {
      if (pollingMessagesRef.current || !active) return;
      pollingMessagesRef.current = true;
      try {
        const envelopes = await getLanMessages();
        if (!active || envelopes.length === 0) return;
        const handledIds: string[] = [];
        for (const envelope of envelopes) {
          const message = parseLanMessage(envelope.body);
          handledIds.push(envelope.id);
          if (!message) continue;
          try {
            await handleMessage(message);
          } catch {
            // 单条消息处理失败不阻塞后续消息。
          }
        }
        await clearLanMessages(handledIds);
      } catch {
        // 下一轮继续轮询。
      } finally {
        pollingMessagesRef.current = false;
      }
    };

    const pollStatus = async (): Promise<void> => {
      if (pollingStatusRef.current || !active) return;
      pollingStatusRef.current = true;
      try {
        const status = await getLanServerStatus();
        if (!active) return;
        if (status.state === 'error' && status.error) {
          commit({ errorText: status.error });
        }
      } catch {
        // 状态轮询失败不打断会话。
      } finally {
        pollingStatusRef.current = false;
      }
    };

    const nearbyTimer = setInterval(() => {
      pollNearby();
    }, NEARBY_POLL_MS);
    const messageTimer = setInterval(() => {
      pollMessages();
    }, MESSAGE_POLL_MS);
    const statusTimer = setInterval(() => {
      pollStatus();
    }, STATUS_POLL_MS);
    pollNearby();
    pollMessages();

    return () => {
      active = false;
      clearInterval(nearbyTimer);
      clearInterval(messageTimer);
      clearInterval(statusTimer);
    };
  }, [commit, handleMessage, supported, view.phase]);

  const openPair = useCallback(
    (peer: LanPeer): void => {
      commit({
        pairTarget: peer,
        pairCode: '',
        pairError: '',
        phase: stateRef.current.connectedPeer ? 'connected' : 'discovering',
      });
    },
    [commit],
  );

  const closePair = useCallback((): void => {
    clearPairTimeout();
    pairRequestIdRef.current = '';
    commit({
      pairTarget: null,
      pairCode: '',
      pairError: '',
      busy: false,
      phase: stateRef.current.connectedPeer ? 'connected' : 'discovering',
    });
  }, [clearPairTimeout, commit]);

  const setPairCode = useCallback(
    (code: string): void => {
      commit({ pairCode: code.slice(0, 6), pairError: '' });
    },
    [commit],
  );

  const submitPair = useCallback(
    async (peer: LanPeer, code: string): Promise<void> => {
      if (!isValidLanCode(code)) {
        commit({ pairError: '请输入对方屏幕上的 6 位口令' });
        return;
      }
      const self = localPeer();
      if (!self || !sessionRef.current) {
        commit({ pairError: '局域网服务尚未就绪' });
        return;
      }

      const requestId = createLanRequestId('pair');
      const verificationCode = createVerificationCode(
        sessionRef.current.nonce,
        peer.nonce,
      );

      pairRequestIdRef.current = requestId;
      commit({
        pairTarget: peer,
        pairCode: code,
        pairError: '',
        verificationCode,
        phase: 'waiting-peer',
        busy: true,
      });

      try {
        await sendTo(peer, {
          kind: 'pair',
          from: self,
          requestId,
          code,
        });
        if (!mountedRef.current) return;
        clearPairTimeout();
        pairTimeoutRef.current = setTimeout(() => {
          pairRequestIdRef.current = '';
          commit({
            phase: 'discovering',
            pairError: '对方未在 10 分钟内确认连接',
            busy: false,
          });
        }, PAIR_TIMEOUT_MS);
      } catch (error: unknown) {
        commit({
          phase: 'discovering',
          pairError: getErrorMessage(error, '连接对方失败'),
          busy: false,
        });
      }
    },
    [clearPairTimeout, commit, localPeer, sendTo],
  );

  const allowPair = useCallback(async (): Promise<void> => {
    const state = stateRef.current;
    const pair = state.incomingPair;
    const self = localPeer();
    if (!pair || !self || state.busy) return;

    commit({ busy: true, errorText: '' });
    try {
      const sessionToken = await createLanSessionToken();
      await sendTo(pair.peer, {
        kind: 'pair-confirm',
        from: self,
        requestId: pair.requestId,
        accepted: true,
        verificationCode: pair.verificationCode,
        sessionToken,
      });
      if (!mountedRef.current) return;
      commit({
        phase: 'connected',
        connectedPeer: pair.peer,
        sessionToken,
        verificationCode: pair.verificationCode,
        incomingPair: null,
        pairError: '',
        busy: false,
      });
    } catch (error: unknown) {
      commit({
        busy: false,
        errorText: getErrorMessage(error, '无法确认连接'),
      });
    }
  }, [commit, localPeer, sendTo]);

  const denyPair = useCallback(async (): Promise<void> => {
    const state = stateRef.current;
    const pair = state.incomingPair;
    const self = localPeer();
    if (!pair || !self) return;

    commit({ busy: true });
    try {
      await sendTo(pair.peer, {
        kind: 'pair-confirm',
        from: self,
        requestId: pair.requestId,
        accepted: false,
        reason: 'denied',
      });
    } catch {
      // 拒绝消息发送失败不影响本地关闭。
    } finally {
      commit({
        phase: 'discovering',
        incomingPair: null,
        busy: false,
      });
    }
  }, [commit, localPeer, sendTo]);

  const disconnect = useCallback(async (): Promise<void> => {
    const state = stateRef.current;
    const self = localPeer();
    if (state.connectedPeer && self) {
      await sendTo(state.connectedPeer, {
        kind: 'disconnect',
        from: self,
      }).catch(() => undefined);
    }
    clearPairTimeout();
    clearOfferTimeout();
    pairRequestIdRef.current = '';
    commit({
      phase: 'discovering',
      connectedPeer: null,
      sessionToken: '',
      verificationCode: '',
      incomingPair: null,
      incomingOffer: null,
      outgoingOffer: null,
      transfer: null,
      result: null,
      pairTarget: null,
      pairCode: '',
      pairError: '',
      errorText: '',
      busy: false,
    });
  }, [clearOfferTimeout, clearPairTimeout, commit, localPeer, sendTo]);

  const sendOffer = useCallback(
    async (input: LanOfferInput): Promise<void> => {
      const state = stateRef.current;
      const self = localPeer();
      if (!state.connectedPeer || !self || !state.sessionToken) {
        commit({ errorText: '连接已断开，请重新配对' });
        return;
      }
      if (state.phase !== 'connected') return;

      const offerId = createLanRequestId('offer');
      commit({ busy: true, errorText: '' });

      try {
        await setLanPackage(input.fileUri, input.fileName, state.sessionToken);
        const offer: LanOffer = {
          offerId,
          peer: state.connectedPeer,
          sessionToken: state.sessionToken,
          fileName: input.fileName,
          sizeBytes: input.sizeBytes,
          totalRecords: input.totalRecords,
          books: input.books,
        };
        await sendTo(state.connectedPeer, {
          kind: 'offer',
          from: self,
          offerId,
          sessionToken: state.sessionToken,
          fileName: input.fileName,
          sizeBytes: input.sizeBytes,
          totalRecords: input.totalRecords,
          books: input.books,
        });
        if (!mountedRef.current) return;
        commit({
          phase: 'waiting-offer',
          outgoingOffer: offer,
          busy: false,
        });
        clearOfferTimeout();
        offerTimeoutRef.current = setTimeout(() => {
          commit({
            phase: 'connected',
            outgoingOffer: null,
            errorText: '对方未在 2 分钟内接受传输提议',
          });
        }, OFFER_TIMEOUT_MS);
      } catch (error: unknown) {
        commit({
          phase: 'connected',
          busy: false,
          errorText: getErrorMessage(error, '发送传输提议失败'),
        });
      }
    },
    [clearOfferTimeout, commit, localPeer, sendTo],
  );

  const cancelOffer = useCallback((): void => {
    clearOfferTimeout();
    commit({
      phase: stateRef.current.connectedPeer ? 'connected' : 'discovering',
      outgoingOffer: null,
      errorText: '已撤回传输提议',
    });
  }, [clearOfferTimeout, commit]);

  const acceptOffer = useCallback(async (): Promise<void> => {
    const state = stateRef.current;
    const offer = state.incomingOffer;
    const self = localPeer();
    if (!offer || !self || state.busy) return;

    commit({ busy: true, errorText: '' });
    try {
      await sendTo(offer.peer, {
        kind: 'offer-response',
        from: self,
        offerId: offer.offerId,
        accepted: true,
      });
      if (!mountedRef.current) return;
      commit({
        phase: 'receiving',
        transfer: {
          direction: 'receive',
          fileName: offer.fileName,
          sizeBytes: offer.sizeBytes,
          bytesRead: 0,
          percent: 0,
        },
        busy: false,
      });
    } catch (error: unknown) {
      commit({
        busy: false,
        errorText: getErrorMessage(error, '接受传输失败'),
      });
    }
  }, [commit, localPeer, sendTo]);

  const declineOffer = useCallback(async (): Promise<void> => {
    const state = stateRef.current;
    const offer = state.incomingOffer;
    const self = localPeer();
    if (!offer || !self) return;

    commit({ busy: true });
    try {
      await sendTo(offer.peer, {
        kind: 'offer-response',
        from: self,
        offerId: offer.offerId,
        accepted: false,
        reason: 'denied',
      });
    } catch {
      // 本地拒绝即可，对端会超时。
    } finally {
      commit({
        incomingOffer: null,
        busy: false,
        phase: 'connected',
      });
    }
  }, [commit, localPeer, sendTo]);

  const updateReceiveProgress = useCallback(
    (progress: LanDownloadProgress): void => {
      const state = stateRef.current;
      if (state.phase !== 'receiving' || !state.transfer) return;
      const contentLength =
        progress.contentLength > 0
          ? progress.contentLength
          : state.transfer.sizeBytes;
      const percent =
        contentLength > 0
          ? Math.min(
              100,
              Math.round((progress.bytesRead / contentLength) * 100),
            )
          : 0;
      commit({
        transfer: {
          ...state.transfer,
          bytesRead: progress.bytesRead,
          percent,
        },
      });
    },
    [commit],
  );

  const downloadReceivePackage = useCallback(async () => {
    const state = stateRef.current;
    const offer = state.incomingOffer;
    if (!offer || state.phase !== 'receiving') {
      throw new Error('没有正在接收的传输');
    }
    return downloadLanPackage(offer.peer, offer.sessionToken, progress =>
      updateReceiveProgress(progress),
    );
  }, [updateReceiveProgress]);

  const completeReceive = useCallback(
    async (success: boolean, subtitle: string): Promise<void> => {
      const state = stateRef.current;
      const offer = state.incomingOffer;
      const self = localPeer();
      if (offer && self) {
        await sendTo(offer.peer, {
          kind: 'transfer-complete',
          from: self,
          sessionToken: offer.sessionToken,
          success,
        }).catch(() => undefined);
      }
      if (success) {
        commit({
          phase: 'done',
          transfer: null,
          incomingOffer: null,
          result: {
            status: 'success',
            direction: 'receive',
            title: '接收完成',
            subtitle,
          },
        });
      } else {
        commit({
          phase: 'connected',
          transfer: null,
          incomingOffer: null,
          result: {
            status: 'error',
            direction: 'receive',
            title: '接收失败',
            subtitle,
          },
        });
      }
    },
    [commit, localPeer, sendTo],
  );

  const closeResult = useCallback((): void => {
    const state = stateRef.current;
    commit({
      result: null,
      transfer: null,
      outgoingOffer: null,
      incomingOffer: null,
      errorText: '',
      phase: state.connectedPeer ? 'connected' : 'discovering',
    });
  }, [commit]);

  const refreshCode = useCallback((): void => {
    wrongCodeAttemptsRef.current = 0;
    commit({
      localCode: createLanCode(),
      pairError: '',
    });
  }, [commit]);

  const clearError = useCallback((): void => {
    commit({ errorText: '' });
  }, [commit]);

  const refreshNearby = useCallback(async (): Promise<void> => {
    try {
      const peers = await getLanNearby();
      const selfId = sessionRef.current?.id;
      commit({ nearby: peers.filter(peer => peer.id !== selfId) });
    } catch {
      // 保留上一轮发现结果。
    }
  }, [commit]);

  return {
    view,
    openPair,
    closePair,
    setPairCode,
    submitPair,
    allowPair,
    denyPair,
    disconnect,
    sendOffer,
    cancelOffer,
    acceptOffer,
    declineOffer,
    downloadReceivePackage,
    updateReceiveProgress,
    completeReceive,
    closeResult,
    refreshCode,
    refreshNearby,
    clearError,
  };
}
