import type { FileUIPart } from 'ai';

export interface QuickBookImage {
  localPath: string;
  base64: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
}

export type QuickBookSource = 'share' | 'nudge';

export type QuickBookConfigErrorReason =
  | 'no-book'
  | 'provider-missing'
  | 'model-missing'
  | 'model-not-multimodal'
  | 'api-key-missing'
  | 'agent-busy'
  | 'image-unavailable'
  | 'failed';

export type QuickBookStartResult =
  | { ok: true }
  | {
      ok: false;
      reason: QuickBookConfigErrorReason;
      message: string;
    };

export interface PendingQuickBookMessage {
  id: string;
  threadId: number;
  text: string;
  files: FileUIPart[];
}

export type QuickBookScreenshotResult =
  | {
      status: 'ok';
      assetId: string;
      dateAddedSeconds: number;
      image: QuickBookImage;
    }
  | {
      status: 'permission' | 'empty' | 'stale' | 'unavailable';
    };
