import type {
  QuickBookImage,
  QuickBookScreenshotResult,
} from './types';

export type ScreenshotNudgeDecision =
  | {
      shouldPrompt: true;
      assetId: string;
      image: QuickBookImage;
    }
  | {
      shouldPrompt: false;
      reason:
        | 'permission'
        | 'empty'
        | 'stale'
        | 'unavailable'
        | 'duplicate';
    };

export function decideScreenshotNudge(
  result: QuickBookScreenshotResult,
  lastHandledAssetId: string | null,
  windowSeconds: number,
  nowSeconds: number,
): ScreenshotNudgeDecision {
  if (result.status !== 'ok') {
    return { shouldPrompt: false, reason: result.status };
  }
  if (result.assetId === lastHandledAssetId) {
    return { shouldPrompt: false, reason: 'duplicate' };
  }
  if (nowSeconds - result.dateAddedSeconds > windowSeconds) {
    return { shouldPrompt: false, reason: 'stale' };
  }
  return {
    shouldPrompt: true,
    assetId: result.assetId,
    image: result.image,
  };
}
