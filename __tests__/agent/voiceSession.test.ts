import {
  VoiceSession,
  type MicHandle,
  type SpeechEngineHandle,
  type SpeechStreamHandle,
} from '../../src/agent/voice/speechSession';

interface FakeMic extends MicHandle {
  stopped: boolean;
  emitData(samples: Float32Array, sampleRate: number): void;
  emitError(message: string): void;
}

function createFakeMic(): FakeMic {
  const dataListeners = new Set<
    (samples: Float32Array, sampleRate: number) => void
  >();
  const errorListeners = new Set<(message: string) => void>();
  const mic: FakeMic = {
    stopped: false,
    start: async () => undefined,
    stop: async () => {
      mic.stopped = true;
    },
    onData: callback => {
      dataListeners.add(callback);
      return () => dataListeners.delete(callback);
    },
    onError: callback => {
      errorListeners.add(callback);
      return () => errorListeners.delete(callback);
    },
    emitData: (samples, sampleRate) => {
      dataListeners.forEach(callback => callback(samples, sampleRate));
    },
    emitError: message => {
      errorListeners.forEach(callback => callback(message));
    },
  };
  return mic;
}

function createStreamMock(
  partialText = '',
  finalText = '',
): {
  stream: SpeechStreamHandle;
  release: jest.Mock;
  inputFinished: jest.Mock;
  processAudioChunk: jest.Mock;
} {
  const release = jest.fn(async () => undefined);
  const inputFinished = jest.fn(async () => undefined);
  const processAudioChunk = jest.fn(async () => ({
    result: { text: partialText },
    isEndpoint: false,
  }));
  const getResult = jest.fn(async () => ({ text: finalText }));
  const stream: SpeechStreamHandle = {
    processAudioChunk,
    inputFinished,
    getResult,
    release,
  };
  return { stream, release, inputFinished, processAudioChunk };
}

function createEngineMock(stream: SpeechStreamHandle): {
  engine: SpeechEngineHandle;
  createStream: jest.Mock;
  destroy: jest.Mock;
} {
  const createStream = jest.fn(async () => stream);
  const destroy = jest.fn(async () => undefined);
  return { engine: { createStream, destroy }, createStream, destroy };
}

function flush(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}

describe('VoiceSession', () => {
  it('emits partial text while listening and returns the final text on stop', async () => {
    const mic = createFakeMic();
    const { stream, release } = createStreamMock('午饭', '午饭 25 块');
    const { engine } = createEngineMock(stream);
    const session = new VoiceSession({
      createEngine: async () => engine,
      createMic: () => mic,
    });
    const partials: string[] = [];

    await session.start(text => partials.push(text), jest.fn());
    const samples = new Float32Array([0.1, 0.2]);
    mic.emitData(samples, 16000);
    await flush();

    expect(partials).toEqual(['午饭']);
    expect(stream.processAudioChunk).toHaveBeenCalledWith(samples, 16000);

    const text = await session.stop();

    expect(text).toBe('午饭 25 块');
    expect(mic.stopped).toBe(true);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('does not emit the same partial text twice', async () => {
    const mic = createFakeMic();
    const { stream } = createStreamMock('打车', '打车 18');
    const { engine } = createEngineMock(stream);
    const session = new VoiceSession({
      createEngine: async () => engine,
      createMic: () => mic,
    });
    const partials: string[] = [];

    await session.start(text => partials.push(text), jest.fn());
    mic.emitData(new Float32Array([0.1]), 16000);
    mic.emitData(new Float32Array([0.2]), 16000);
    await flush();

    expect(partials).toEqual(['打车']);
    await session.cancel();
  });

  it('aborts an in-flight start when cancelled', async () => {
    let resolveEngine: (engine: SpeechEngineHandle) => void = () => undefined;
    const enginePromise = new Promise<SpeechEngineHandle>(resolve => {
      resolveEngine = resolve;
    });
    const createStream = jest.fn(async () => createStreamMock().stream);
    const createMic = jest.fn(() => createFakeMic());
    const session = new VoiceSession({
      createEngine: () => enginePromise,
      createMic,
    });

    const startPromise = session.start(jest.fn(), jest.fn());
    await session.cancel();
    resolveEngine({ createStream, destroy: jest.fn(async () => undefined) });
    await startPromise;

    expect(createStream).not.toHaveBeenCalled();
    expect(createMic).not.toHaveBeenCalled();
  });

  it('forwards microphone errors to the caller', async () => {
    const mic = createFakeMic();
    const { stream } = createStreamMock();
    const { engine } = createEngineMock(stream);
    const session = new VoiceSession({
      createEngine: async () => engine,
      createMic: () => mic,
    });
    const onError = jest.fn();

    await session.start(jest.fn(), onError);
    mic.emitError('麦克风不可用');

    expect(onError).toHaveBeenCalledWith('麦克风不可用');
    await session.cancel();
  });

  it('reuses the created engine across sessions', async () => {
    const createEngine = jest.fn(async () => {
      const { stream } = createStreamMock('', '');
      return createEngineMock(stream).engine;
    });
    const session = new VoiceSession({
      createEngine,
      createMic: () => createFakeMic(),
    });

    await session.start(jest.fn(), jest.fn());
    await session.stop();
    await session.start(jest.fn(), jest.fn());
    await session.stop();

    expect(createEngine).toHaveBeenCalledTimes(1);
  });

  it('releases the stream when cancelled', async () => {
    const mic = createFakeMic();
    const { stream, release } = createStreamMock();
    const { engine } = createEngineMock(stream);
    const session = new VoiceSession({
      createEngine: async () => engine,
      createMic: () => mic,
    });

    await session.start(jest.fn(), jest.fn());
    await session.cancel();

    expect(release).toHaveBeenCalledTimes(1);
    expect(mic.stopped).toBe(true);
  });

  it('destroys the engine on dispose', async () => {
    const { stream } = createStreamMock();
    const { engine, destroy } = createEngineMock(stream);
    const session = new VoiceSession({
      createEngine: async () => engine,
      createMic: () => createFakeMic(),
    });

    await session.start(jest.fn(), jest.fn());
    await session.dispose();

    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
