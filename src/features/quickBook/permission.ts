import { PermissionsAndroid, Platform } from 'react-native';

const READ_MEDIA_IMAGES_PERMISSION =
  PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
const READ_EXTERNAL_STORAGE_PERMISSION =
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
const ANDROID_13_API_LEVEL = 33;

type ScreenshotPermission = Parameters<typeof PermissionsAndroid.check>[0];

function getScreenshotPermission(): ScreenshotPermission | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  return Number(Platform.Version) >= ANDROID_13_API_LEVEL
    ? READ_MEDIA_IMAGES_PERMISSION
    : READ_EXTERNAL_STORAGE_PERMISSION;
}

export function isScreenshotDetectionSupported(): boolean {
  return Platform.OS === 'android';
}

export async function hasScreenshotPermission(): Promise<boolean> {
  const permission = getScreenshotPermission();
  if (permission === null) {
    return false;
  }
  try {
    return await PermissionsAndroid.check(permission);
  } catch {
    return false;
  }
}

export async function requestScreenshotPermission(): Promise<boolean> {
  const permission = getScreenshotPermission();
  if (permission === null) {
    return false;
  }
  try {
    const result = await PermissionsAndroid.request(permission);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}
