describe('derivative pipeline', () => {
  let derivative: (seed: any, isDark: boolean) => Record<string, any>;

  beforeAll(() => {
    derivative = require('../src/algorithms/derivative').derivative;
  });

  it('produces complete MapToken from default seed with default algorithm', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const result = derivative(defaultSeedToken, false);
    expect(result.colorPrimary).toBe('#1677ff');
    expect(result.colorPrimaryBg).toBeTruthy();
    expect(result.sizeXXL).toBe(48);
    expect(result.size).toBe(16);
    // 移动端 seed: fontSize 升到 16（iOS HIG / Material 正文下限）
    expect(result.fontSize).toBe(16);
    expect(result.motionDurationFast).toBe(100);
  });

  it('default uses darken for solid colors (bgContainer)', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const result = derivative(defaultSeedToken, false);
    expect(result.colorBgContainer).toBe('#ffffff');
  });

  it('produces complete MapToken with dark algorithm', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const result = derivative(defaultSeedToken, true);
    expect(result.colorBgBase).toMatch(/^#0{3,6}$/); // '#000' or '#000000'
    expect(result.colorTextBase).toMatch(/^#f{3,6}$/); // '#fff' or '#ffffff'
  });

  it('dark uses lighten for solid colors (bgContainer)', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const result = derivative(defaultSeedToken, true);
    // Dark mode bgContainer should be lightened from black
    expect(result.colorBgContainer).not.toBe('#000000');
  });

  it('dark uses dark palette generator', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const defaultResult = derivative(defaultSeedToken, false);
    const darkResult = derivative(defaultSeedToken, true);
    // Dark palette should differ from default for primary colors
    expect(defaultResult.colorPrimaryBg).not.toBe(darkResult.colorPrimaryBg);
  });

  it('守住移动端 controlHeight ≥ 44 触达区底线（密集场景请覆盖 SeedToken）', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const result = derivative(defaultSeedToken, false);
    expect(result.controlHeight).toBe(44);
  });

  it('includes preset color palettes in MapToken', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const result = derivative(defaultSeedToken, false);
    expect(result.blue1).toBeTruthy();
    expect(result.blue6).toBeTruthy();
    expect(result.gold10).toBeTruthy();
  });

  it('returns all ColorMapToken vy fields', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const result = derivative(defaultSeedToken, false);
    expect(result.colorError).toBe('#ff4d4f');
    expect(result.colorSuccess).toBe('#52c41a');
    expect(result.colorWarning).toBe('#faad14');
    expect(result.colorWhite).toBe('#fff');
    expect(result.colorBgMask).toBeTruthy();
  });

  it('includes font weight map tokens', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const result = derivative(defaultSeedToken, false);

    expect(result.fontWeightLight).toBe(300);
    expect(result.fontWeightRegular).toBe(400);
    expect(result.fontWeightMedium).toBe(500);
    expect(result.fontWeightSemiBold).toBe(600);
    expect(result.fontWeightBold).toBe(700);
  });
});
