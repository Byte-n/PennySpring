import { useCallback, useEffect, useRef, useState } from 'react';

import { ensureMicPermission } from './permission';
import { sherpaSpeechDeps } from './sherpaDeps';
import { VoiceSession } from './speechSession';
import type { SpeechSessionDeps } from './speechSession';

export type VoiceInputStatus = 'idle' | 'preparing' | 'listening' | 'finalizing';

export interface VoiceInputOptions {
  onComplete: (text: string) => void;
  onError?: (message: string) => void;
  deps?: SpeechSessionDeps;
}

export interface VoiceInputController {
  status: VoiceInputStatus;
  partialText: string;
  isActive: boolean;
  start: () => void;
  stop: () => void;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : '语音识别失败';
}

export function useVoiceInput({
  onComplete,
  onError,
  deps,
}: VoiceInputOptions): VoiceInputController {
  const [status, setStatus] = useState<VoiceInputStatus>('idle');
  const [partialText, setPartialText] = useState('');
  const statusRef = useRef<VoiceInputStatus>('idle');
  const requestIdRef = useRef(0);
  const sessionRef = useRef<VoiceSession | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  });

  const getSession = useCallback((): VoiceSession => {
    if (!sessionRef.current) {
      sessionRef.current = new VoiceSession(deps ?? sherpaSpeechDeps);
    }
    return sessionRef.current;
  }, [deps]);

  const applyStatus = useCallback((next: VoiceInputStatus): void => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const fail = useCallback(
    (message: string): void => {
      requestIdRef.current += 1;
      sessionRef.current?.cancel().catch(() => undefined);
      applyStatus('idle');
      setPartialText('');
      onErrorRef.current?.(message);
    },
    [applyStatus],
  );

  const start = useCallback((): void => {
    if (statusRef.current !== 'idle') {
      return;
    }

    const session = getSession();
    const id = requestIdRef.current + 1;
    requestIdRef.current = id;
    setPartialText('');
    applyStatus('preparing');

    (async () => {
      try {
        const granted = await ensureMicPermission();
        if (!granted) {
          throw new Error('未获得麦克风权限，无法进行语音输入');
        }
        if (requestIdRef.current !== id) {
          return;
        }

        await session.start(
          text => {
            if (requestIdRef.current === id) {
              setPartialText(text);
            }
          },
          message => {
            if (requestIdRef.current === id) {
              fail(message);
            }
          },
        );

        if (requestIdRef.current !== id) {
          await session.cancel();
          return;
        }
        applyStatus('listening');
      } catch (error) {
        if (requestIdRef.current === id) {
          fail(toMessage(error));
        }
      }
    })().catch(() => undefined);
  }, [applyStatus, fail, getSession]);

  const stop = useCallback((): void => {
    const current = statusRef.current;
    if (current === 'idle') {
      return;
    }

    if (current === 'preparing') {
      requestIdRef.current += 1;
      sessionRef.current?.cancel().catch(() => undefined);
      applyStatus('idle');
      setPartialText('');
      return;
    }

    requestIdRef.current += 1;
    applyStatus('finalizing');
    const session = getSession();

    (async () => {
      try {
        const text = (await session.stop()).trim();
        applyStatus('idle');
        setPartialText('');
        if (text) {
          onCompleteRef.current(text);
        }
      } catch (error) {
        fail(toMessage(error));
      }
    })().catch(() => undefined);
  }, [applyStatus, fail, getSession]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      const session = sessionRef.current;
      sessionRef.current = null;
      session?.dispose().catch(() => undefined);
    },
    [],
  );

  return {
    status,
    partialText,
    isActive: status !== 'idle',
    start,
    stop,
  };
}
