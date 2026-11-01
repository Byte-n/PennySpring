import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';

import {
  QUICK_BOOK_IMAGE_MAX_DIMENSION,
  QUICK_BOOK_IMAGE_QUALITY_PERCENT,
  QUICK_BOOK_SHARE_EVENT,
} from './constants';
import type { QuickBookImage, QuickBookScreenshotResult } from './types';

interface NativeScreenshotModule {
  getLatestScreenshot: (
    maxAgeSeconds: number,
    maxEdge: number,
    quality: number,
  ) => Promise<unknown>;
}

/**
 * 截图查询与分享接收目前只有 Android 原生实现。
 * iOS 没有等价的系统截屏感知能力；分享入口需要单独的 Share Extension，暂不提供。
 */
interface NativeShareModule {
  consumeSharedImage: (maxEdge: number, quality: number) => Promise<unknown>;
}

const NativeScreenshot = NativeModules.QuickBookScreenshot as
  NativeScreenshotModule | undefined;
const NativeShare = NativeModules.QuickBookShare as
  NativeShareModule | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseImagePayload(value: unknown): QuickBookImage | null {
  if (!isRecord(value)) {
    return null;
  }
  const { localPath, base64, mimeType, fileName, fileSize, width, height } =
    value;
  if (
    typeof localPath !== 'string' ||
    localPath.length === 0 ||
    typeof base64 !== 'string' ||
    base64.length === 0 ||
    typeof mimeType !== 'string' ||
    typeof fileName !== 'string' ||
    !isFiniteNumber(fileSize) ||
    !isFiniteNumber(width) ||
    !isFiniteNumber(height)
  ) {
    return null;
  }
  return {
    localPath,
    base64,
    mimeType,
    fileName,
    fileSize,
    width,
    height,
  };
}

function parseScreenshotResult(value: unknown): QuickBookScreenshotResult {
  if (!isRecord(value)) {
    return { status: 'unavailable' };
  }
  const status = value.status;
  if (status !== 'ok') {
    if (status === 'permission' || status === 'empty' || status === 'stale') {
      return { status };
    }
    return { status: 'unavailable' };
  }
  const image = parseImagePayload(value);
  if (
    image === null ||
    typeof value.assetId !== 'string' ||
    !isFiniteNumber(value.dateAddedSeconds)
  ) {
    return { status: 'unavailable' };
  }
  return {
    status: 'ok',
    assetId: value.assetId,
    dateAddedSeconds: value.dateAddedSeconds,
    image,
  };
}

export async function getLatestScreenshot(
  maxAgeSeconds: number,
): Promise<QuickBookScreenshotResult> {
  if (Platform.OS !== 'android' || !NativeScreenshot) {
    return { status: 'unavailable' };
  }
  try {
    const result = await NativeScreenshot.getLatestScreenshot(
      maxAgeSeconds,
      QUICK_BOOK_IMAGE_MAX_DIMENSION,
      QUICK_BOOK_IMAGE_QUALITY_PERCENT,
    );
    return parseScreenshotResult(result);
  } catch {
    return { status: 'unavailable' };
  }
}

export async function consumeSharedImage(): Promise<QuickBookImage | null> {
  if (Platform.OS !== 'android' || !NativeShare) {
    return null;
  }
  try {
    const result = await NativeShare.consumeSharedImage(
      QUICK_BOOK_IMAGE_MAX_DIMENSION,
      QUICK_BOOK_IMAGE_QUALITY_PERCENT,
    );
    return parseImagePayload(result);
  } catch {
    return null;
  }
}

export function addSharedImageListener(listener: () => void): () => void {
  if (Platform.OS !== 'android') {
    return () => undefined;
  }
  const subscription = DeviceEventEmitter.addListener(
    QUICK_BOOK_SHARE_EVENT,
    listener,
  );
  return () => {
    subscription.remove();
  };
}
