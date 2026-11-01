const {
  getNextVersionName,
  parseReleaseMarker,
  readVersionState,
  toVersionCode,
} = require('../scripts/android/version');

describe('Android 版本号工具', () => {
  it('versionCode 按 major*10000+minor*100+patch 推导', () => {
    expect(toVersionCode('1.0.2')).toBe(10002);
    expect(toVersionCode('2.13.7')).toBe(21307);
  });

  it('从根目录 version.json 读取版本状态', async () => {
    const state = await readVersionState();

    expect(state.versionCode).toBe(toVersionCode(state.versionName));
  });

  it('递增版本号时重置低位', () => {
    expect(getNextVersionName('1.2.2', 'patch')).toBe('1.2.3');
    expect(getNextVersionName('1.2.3', 'minor')).toBe('1.3.0');
    expect(getNextVersionName('1.2.3', 'major')).toBe('2.0.0');
  });

  it('递增后跳过包含 4 的版本号', () => {
    expect(getNextVersionName('1.2.3', 'patch')).toBe('1.2.5');
    expect(getNextVersionName('1.3.9', 'minor')).toBe('1.5.0');
    expect(getNextVersionName('3.9.9', 'major')).toBe('5.0.0');
  });

  it('只从提交信息首行识别 update 发布标记', () => {
    expect(parseReleaseMarker('update: v1.0.3')).toBe('1.0.3');
    expect(parseReleaseMarker('update: v1.0.3\n\n- 修复白屏')).toBe('1.0.3');
    expect(parseReleaseMarker('release: v1.0.3')).toBeNull();
    expect(parseReleaseMarker('chore: update: v1.0.3')).toBeNull();
  });

  it('版本号格式非法时抛错', () => {
    expect(() => toVersionCode('1.0')).toThrow();
    expect(() => getNextVersionName('1.0', 'patch')).toThrow();
    expect(() => toVersionCode('1.0.4')).toThrow('版本号不能包含数字 4');
  });
});
