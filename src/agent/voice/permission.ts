import { PermissionsAndroid, Platform } from 'react-native';

export async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  if (await PermissionsAndroid.check(permission)) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, {
    title: '麦克风权限',
    message: '语音输入需要访问麦克风，用于把你说的话转成文字。',
    buttonPositive: '允许',
    buttonNegative: '取消',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
}
