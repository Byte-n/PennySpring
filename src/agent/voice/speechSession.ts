export interface SpeechResult {
  text: string;
}

export interface SpeechStreamHandle {
  processAudioChunk(
    samples: Float32Array | number[],
    sampleRate: number,
  ): Promise<{ result: SpeechResult; isEndpoint: boolean }>;
  inputFinished(): Promise<void>;
  getResult(): Promise<SpeechResult>;
  release(): Promise<void>;
}

export interface SpeechEngineHandle {
  createStream(): Promise<SpeechStreamHandle>;
  destroy(): Promise<void>;
}

export interface MicHandle {
  start(): Promise<void>;
  stop(): Promise<void>;
  onData(
    callback: (samples: Float32Array, sampleRate: number) => void,
  ): () => void;
  onError(callback: (message: string) => void): () => void;
}

export interface SpeechSessionDeps {
  createEngine(): Promise<SpeechEngineHandle>;
  createMic(): MicHandle;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : '语音识别失败';
}

export class VoiceSession {
  private readonly deps: SpeechSessionDeps;
  private engine: SpeechEngineHandle | null = null;
  private enginePromise: Promise<SpeechEngineHandle> | null = null;
  private stream: SpeechStreamHandle | null = null;
  private mic: MicHandle | null = null;
  private unsubscribers: Array<() => void> = [];
  private queue: Promise<void> = Promise.resolve();
  private latestText = '';
  private active = false;
  private generation = 0;
  private onPartial: ((text: string) => void) | null = null;
  private onError: ((message: string) => void) | null = null;

  constructor(deps: SpeechSessionDeps) {
    this.deps = deps;
  }

  async start(
    onPartial: (text: string) => void,
    onError: (message: string) => void,
  ): Promise<void> {
    if (this.active) {
      return;
    }

    const generation = ++this.generation;
    this.active = true;
    this.latestText = '';
    this.onPartial = onPartial;
    this.onError = onError;

    try {
      const engine = await this.ensureEngine();
      if (generation !== this.generation) {
        this.active = false;
        return;
      }

      const stream = await engine.createStream();
      if (generation !== this.generation) {
        await stream.release().catch(() => undefined);
        this.active = false;
        return;
      }
      this.stream = stream;

      const mic = this.deps.createMic();
      this.mic = mic;
      this.unsubscribers.push(
        mic.onData((samples, sampleRate) => this.enqueue(samples, sampleRate)),
      );
      this.unsubscribers.push(
        mic.onError(message => {
          if (generation !== this.generation) {
            return;
          }
          this.active = false;
          this.onError?.(message);
        }),
      );

      await mic.start();

      if (generation !== this.generation) {
        await this.cancel();
      }
    } catch (error) {
      await this.cancel();
      throw error;
    }
  }

  async stop(): Promise<string> {
    if (!this.active) {
      return this.latestText;
    }

    this.active = false;
    await this.teardownInput();
    await this.queue;

    const stream = this.stream;
    this.stream = null;
    if (!stream) {
      return this.latestText;
    }

    try {
      await stream.inputFinished();
      const result = await stream.getResult();
      const text = result.text.trim();
      if (text) {
        this.latestText = text;
      }
    } finally {
      await stream.release().catch(() => undefined);
    }

    return this.latestText;
  }

  async cancel(): Promise<void> {
    this.generation += 1;
    this.active = false;
    this.onPartial = null;
    this.onError = null;
    await this.teardownInput();

    const stream = this.stream;
    this.stream = null;
    await this.queue;
    if (stream) {
      await stream.release().catch(() => undefined);
    }
  }

  async dispose(): Promise<void> {
    await this.cancel();
    const engine = this.engine;
    this.engine = null;
    this.enginePromise = null;
    if (engine) {
      await engine.destroy().catch(() => undefined);
    }
  }

  private enqueue(samples: Float32Array, sampleRate: number): void {
    const stream = this.stream;
    if (!stream) {
      return;
    }

    this.queue = this.queue
      .then(async () => {
        if (this.stream !== stream) {
          return;
        }
        const { result } = await stream.processAudioChunk(samples, sampleRate);
        const text = result.text.trim();
        if (!text || text === this.latestText) {
          return;
        }
        this.latestText = text;
        this.onPartial?.(text);
      })
      .catch(error => {
        if (this.stream === stream) {
          this.onError?.(toMessage(error));
        }
      });
  }

  private async teardownInput(): Promise<void> {
    const mic = this.mic;
    this.mic = null;
    if (mic) {
      await mic.stop().catch(() => undefined);
    }
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }

  private async ensureEngine(): Promise<SpeechEngineHandle> {
    if (this.engine) {
      return this.engine;
    }
    if (!this.enginePromise) {
      this.enginePromise = this.deps
        .createEngine()
        .then(engine => {
          this.engine = engine;
          return engine;
        })
        .finally(() => {
          this.enginePromise = null;
        });
    }
    return this.enginePromise;
  }
}
