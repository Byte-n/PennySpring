import { Platform } from 'react-native';

import { toNativeImageSource } from '../src/shares/imageSource';

const ORIGINAL_PLATFORM_OS = Platform.OS;
const AUTH_HEADERS = { Authorization: 'Bearer test-token' };

function mockPlatformOS(os: typeof Platform.OS): void {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: os,
  });
}

describe('toNativeImageSource', () => {
  afterEach(() => {
    mockPlatformOS(ORIGINAL_PLATFORM_OS);
  });

  it('wraps a single authenticated source in an array on Android', () => {
    mockPlatformOS('android');
    const source = {
      uri: 'http://192.168.1.10:8080/api/media/a.jpg',
      headers: AUTH_HEADERS,
    };

    expect(toNativeImageSource(source)).toEqual([source]);
  });

  it('keeps a single authenticated source unchanged on iOS', () => {
    mockPlatformOS('ios');
    const source = {
      uri: 'http://192.168.1.10:8080/api/media/a.jpg',
      headers: AUTH_HEADERS,
    };

    expect(toNativeImageSource(source)).toBe(source);
  });

  it('keeps a source without headers unchanged on Android', () => {
    mockPlatformOS('android');
    const source = { uri: 'file:///a.jpg' };

    expect(toNativeImageSource(source)).toBe(source);
  });

  it('keeps an existing source array unchanged on Android', () => {
    mockPlatformOS('android');
    const sources = [
      {
        uri: 'http://192.168.1.10:8080/api/media/a.jpg',
        headers: AUTH_HEADERS,
      },
    ];

    expect(toNativeImageSource(sources)).toBe(sources);
  });
});
