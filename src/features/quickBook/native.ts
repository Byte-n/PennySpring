import { NativeModules, Platform } from 'react-native';

import {
  QUICK_BOOK_IMAGE_MAX_DIMENSION,
  QUICK_BOOK_IMAGE_QUALITY_PERCENT,
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
 * 截图查询只有 Android 原生实现；iOS 没有等价的系统截屏感知能力。
 * 系统分享由 Android 的 ShareDraftActivity 直接转成后台草稿，不再进入 JS。
 */
const NativeScreenshot = NativeModules.QuickBookScreenshot as
  NativeScreenshotModule | undefined;

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
