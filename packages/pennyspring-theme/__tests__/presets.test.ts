import { themePresets } from '../src/index';
import type { ThemePreset } from '../src/presets';

const overridingPresets = themePresets.filter(
  (preset: ThemePreset) => preset.value !== 'default',
);

function getPreset(value: string): ThemePreset {
  const preset = themePresets.find((item: ThemePreset) => item.value === value);
  if (!preset) {
    throw new Error(`missing preset: ${value}`);
  }
  return preset;
}

describe('themePresets', () => {
  it('按展示顺序导出全部预设的稳定 key 与显示名', () => {
    expect(themePresets.map((preset: ThemePreset) => preset.value)).toEqual([
      'default',
      'april',
      'kaori',
      'penny',
      'spring',
      'yonder',
      'mauve',
      'cocoa',
      'slate',
      'mono',
    ]);
    expect(themePresets.map((preset: ThemePreset) => preset.label)).toEqual([
      '默认',
      '春绿',
      '樱粉',
      '暖金',
      '青碧',
      '远山',
      '藕荷',
      '可可',
      '石墨',
      '墨白',
    ]);
  });

  it('默认预设不覆盖任何 seed', () => {
    expect(getPreset('default').data).toEqual({});
  });

  it.each([
    ['april', '春绿', '#3C8A66', '#52C41A', '#FAAD14', '#F5585C', '#1677FF'],
    ['kaori', '樱粉', '#D95F76', '#52C41A', '#FAAD14', '#D4365B', '#1677FF'],
    ['penny', '暖金', '#A9761F', '#52C41A', '#FA8C16', '#CF1322', '#1677FF'],
    ['spring', '青碧', '#148B80', '#52C41A', '#FAAD14', '#F5585C', '#1677FF'],
    ['yonder', '远山', '#5A7DA8', '#52C41A', '#FAAD14', '#FF4D4F', '#1677FF'],
    ['mauve', '藕荷', '#8F6E9F', '#52C41A', '#FAAD14', '#D4365B', '#1677FF'],
    ['cocoa', '可可', '#9C7148', '#52C41A', '#FA8C16', '#CF1322', '#1677FF'],
    ['slate', '石墨', '#6E7E91', '#52C41A', '#FAAD14', '#FF4D4F', '#1677FF'],
    ['mono', '墨白', '#7A7A7A', '#52C41A', '#FAAD14', '#FF4D4F', '#1677FF'],
  ])(
    '%s（%s）使用约定的主色与语义色',
    (value, label, primary, success, warning, error, info) => {
      const preset = getPreset(value);
      expect(preset.label).toBe(label);
      expect(preset.data.colorPrimary).toBe(primary);
      expect(preset.data.colorSuccess).toBe(success);
      expect(preset.data.colorWarning).toBe(warning);
      expect(preset.data.colorError).toBe(error);
      expect(preset.data.colorInfo).toBe(info);
      expect(preset.data.colorLink).toBe(primary);
    },
  );

  it('每套预设只覆盖六个 seed 颜色字段', () => {
    const seedColorKeys = [
      'colorPrimary',
      'colorSuccess',
      'colorWarning',
      'colorError',
      'colorInfo',
      'colorLink',
    ];
    overridingPresets.forEach((preset: ThemePreset) => {
      expect(Object.keys(preset.data).sort()).toEqual(seedColorKeys.sort());
    });
  });

  it('每套预设都能与 defaultSeedToken 合并且 primary 保持不变', () => {
    const { defaultSeedToken } = require('../src/index');
    const { derivative } = require('../src/algorithms/derivative');
    const { formatToken } = require('../src/algorithms/formatToken');

    overridingPresets.forEach((preset: ThemePreset) => {
      const seed = { ...defaultSeedToken, ...preset.data };
      const alias = formatToken(derivative(seed, false));

      // colorPrimary 经派生（取 palette step 6）后保持 preset 原值
      expect(alias.colorPrimary.toLowerCase()).toBe(
        (preset.data.colorPrimary as string).toLowerCase(),
      );
      expect(alias.colorPrimaryBg).toBeTruthy();
      expect(alias.colorPrimaryHover).toBeTruthy();
      expect(alias.boxShadow).toBeTruthy();
    });
  });

  it('每套预设与暗色算法联动不崩溃', () => {
    const { defaultSeedToken } = require('../src/index');
    const { derivative } = require('../src/algorithms/derivative');
    const { formatToken } = require('../src/algorithms/formatToken');

    overridingPresets.forEach((preset: ThemePreset) => {
      const seed = { ...defaultSeedToken, ...preset.data };
      const alias = formatToken(derivative(seed, true));
      expect(alias.colorBgBase).toMatch(/^#0{3,6}$/);
      expect(alias.colorPrimary).toBeTruthy();
    });
  });
});
