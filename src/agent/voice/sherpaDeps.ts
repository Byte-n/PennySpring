import { createPcmLiveStream } from 'react-native-sherpa-onnx/audio';
import { createStreamingSTT } from 'react-native-sherpa-onnx/stt';

import type { SpeechSessionDeps } from './speechSession';

const MODEL_ASSET_PATH = 'models/streaming-zipformer-zh-14M';
const SAMPLE_RATE = 16000;
const INFERENCE_THREADS = 2;

export const sherpaSpeechDeps: SpeechSessionDeps = {
  createEngine: () =>
    createStreamingSTT({
      modelPath: { type: 'asset', path: MODEL_ASSET_PATH },
      modelType: 'transducer',
      enableEndpoint: false,
      numThreads: INFERENCE_THREADS,
    }),
  createMic: () =>
    createPcmLiveStream({ sampleRate: SAMPLE_RATE, channelCount: 1 }),
};
