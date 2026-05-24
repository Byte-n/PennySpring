describe('presets', () => {
  it('april uses spring-green palette', () => {
    const { presets } = require('../src/index');
    expect(presets.april.colorPrimary).toBe('#52C41A');
    expect(presets.april.colorSuccess).toBe('#73D13D');
    expect(presets.april.colorWarning).toBe('#FAAD14');
    expect(presets.april.colorError).toBe('#F5585C');
    expect(presets.april.colorInfo).toBe('#1677FF');
    expect(presets.april.colorLink).toBe('#389E0D');
  });

  it('kaori uses sakura-pink palette', () => {
    const { presets } = require('../src/index');
    expect(presets.kaori.colorPrimary).toBe('#EB7C8D');
    expect(presets.kaori.colorSuccess).toBe('#52C41A');
    expect(presets.kaori.colorWarning).toBe('#FAAD14');
    expect(presets.kaori.colorError).toBe('#D4365B');
    expect(presets.kaori.colorInfo).toBe('#B37FEB');
    expect(presets.kaori.colorLink).toBe('#C41D7F');
  });

  it('penny uses warm-gold palette', () => {
    const { presets } = require('../src/index');
    expect(presets.penny.colorPrimary).toBe('#D4A84B');
    expect(presets.penny.colorSuccess).toBe('#73D13D');
    expect(presets.penny.colorWarning).toBe('#FA8C16');
    expect(presets.penny.colorError).toBe('#CF1322');
    expect(presets.penny.colorInfo).toBe('#8C6E3A');
    expect(presets.penny.colorLink).toBe('#AD6800');
  });

  it('spring uses cyan-teal palette', () => {
    const { presets } = require('../src/index');
    expect(presets.spring.colorPrimary).toBe('#2EC4B6');
    expect(presets.spring.colorSuccess).toBe('#52C41A');
    expect(presets.spring.colorWarning).toBe('#FAAD14');
    expect(presets.spring.colorError).toBe('#F5585C');
    expect(presets.spring.colorInfo).toBe('#13C2C2');
    expect(presets.spring.colorLink).toBe('#08979C');
  });

  it('presets 仅覆盖 seed 颜色字段，不携带其他 SeedToken 字段', () => {
    const { presets } = require('../src/index');
    const seedColorKeys = [
      'colorPrimary',
      'colorSuccess',
      'colorWarning',
      'colorError',
      'colorInfo',
      'colorLink',
    ];
    (['april', 'kaori', 'penny', 'spring'] as const).forEach((name) => {
      const keys = Object.keys(presets[name]);
      keys.forEach((k) => expect(seedColorKeys).toContain(k));
    });
  });

  it('presets 可直接与 defaultSeedToken 合并并通过 derivative 派生', () => {
    const { presets, defaultSeedToken } = require('../src/index');
    const { derivative } = require('../src/algorithms/derivative');
    const { formatToken } = require('../src/algorithms/formatToken');

    (['april', 'kaori', 'penny', 'spring'] as const).forEach((name) => {
      const seed = { ...defaultSeedToken, ...presets[name] };
      const mapToken = derivative(seed, false);
      const alias = formatToken(mapToken);

      // colorPrimary 经派生（取 palette step 6）后保持 preset 原值
      expect(alias.colorPrimary.toLowerCase()).toBe(
        presets[name].colorPrimary.toLowerCase(),
      );
      // 关键派生字段存在
      expect(alias.colorPrimaryBg).toBeTruthy();
      expect(alias.colorPrimaryHover).toBeTruthy();
      expect(alias.boxShadow).toBeTruthy();
    });
  });

  it('presets 与暗色算法联动不崩溃', () => {
    const { presets, defaultSeedToken } = require('../src/index');
    const { derivative } = require('../src/algorithms/derivative');
    const { formatToken } = require('../src/algorithms/formatToken');

    const seed = { ...defaultSeedToken, ...presets.april };
    const alias = formatToken(derivative(seed, true));
    expect(alias.colorBgBase).toMatch(/^#0{3,6}$/);
    expect(alias.colorPrimary).toBeTruthy();
  });
});
