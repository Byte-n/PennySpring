declare module 'text-encoding-utf-8' {
  export interface TextDecoderOptions {
    fatal?: boolean;
    ignoreBOM?: boolean;
  }

  export interface TextDecodeOptions {
    stream?: boolean;
  }

  export class TextDecoder {
    constructor(label?: string, options?: TextDecoderOptions);
    readonly encoding: string;
    decode(
      input?: ArrayBuffer | ArrayBufferView,
      options?: TextDecodeOptions,
    ): string;
  }

  export class TextEncoder {
    readonly encoding: string;
    encode(input?: string): Uint8Array;
  }
}
