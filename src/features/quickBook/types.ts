import type { FileUIPart } from 'ai';

import type { AgentAttachment } from '../../agent/core/attachments';

export interface QuickBookImage {
  localPath: string;
  base64: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
}

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
  attachments: AgentAttachment[];
  /** 本次消息创建记录时跳过人工确认。 */
  autoApproveCreate: boolean;
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
