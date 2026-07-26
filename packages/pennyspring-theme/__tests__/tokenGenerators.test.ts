describe('genFontSizes', () => {
  let genFontSizes: (base: number) => number[];

  beforeAll(() => {
    genFontSizes = require('../src/algorithms/genFontSizes').genFontSizes;
  });

  it('returns 10 font sizes', () => {
    const sizes = genFontSizes(14);
    expect(sizes).toHaveLength(10);
  });

  it('index 1 equals the base font size', () => {
    const sizes = genFontSizes(14);
    expect(sizes[1]).toBe(14);
  });

  it('sizes grow exponentially', () => {
    const sizes = genFontSizes(14);
    expect(sizes[2]).toBeGreaterThan(sizes[1]);
    expect(sizes[3]).toBeGreaterThan(sizes[2]);
    expect(sizes[9]).toBeGreaterThan(sizes[1]);
  });

  it('all sizes are even integers', () => {
    const sizes = genFontSizes(14);
    sizes.forEach(size => {
      expect(size % 2).toBe(0);
      expect(Number.isInteger(size)).toBe(true);
    });
  });

  it('works with different base sizes', () => {
    const sizes = genFontSizes(12);
    expect(sizes[1]).toBe(12);
    expect(sizes).toHaveLength(10);
  });
});

describe('genRadius', () => {
  let genRadius: (base: number) => { borderRadiusLG: number; borderRadiusSM: number; borderRadiusXS: number; borderRadiusOuter: number };

  beforeAll(() => {
    genRadius = require('../src/algorithms/genRadius').genRadius;
  });

  // 移动端圆角刻度：以 base 为锚按比例派生，整体大于 antd v5 的 PC 基准。
  // 层级：XS(chip/badge) < SM(控件/单元) < base(内容卡片) < LG(浮层)
  it('base 12 派生移动端刻度 XS=4 / SM=8 / LG=16 / Outer=12', () => {
    const radii = genRadius(12);
    expect(radii.borderRadiusXS).toBe(4);
    expect(radii.borderRadiusSM).toBe(8);
    expect(radii.borderRadiusLG).toBe(16);
    expect(radii.borderRadiusOuter).toBe(12);
  });

  it('保持层级 XS < SM < base < LG', () => {
    const radii = genRadius(12);
    expect(radii.borderRadiusXS).toBeLessThan(radii.borderRadiusSM);
    expect(radii.borderRadiusSM).toBeLessThan(12);
    expect(radii.borderRadiusLG).toBeGreaterThan(12);
  });

  it('LG 随 base 线性增长（base + 4）', () => {
    expect(genRadius(8).borderRadiusLG).toBe(12);
    expect(genRadius(16).borderRadiusLG).toBe(20);
  });

  it('XS/SM 设下限，极小 base 不塌缩', () => {
    const radii = genRadius(4);
    expect(radii.borderRadiusXS).toBeGreaterThanOrEqual(2);
    expect(radii.borderRadiusSM).toBeGreaterThanOrEqual(4);
  });
});

describe('genSizeMapToken', () => {
  let genSizeMapToken: (seed: { sizeUnit: number; sizeStep: number }) => Record<string, number>;

  beforeAll(() => {
    genSizeMapToken = require('../src/algorithms/genSizeMapToken').genSizeMapToken;
  });

  it('computes sizeXXL = 48 with default values (sizeUnit=4, sizeStep=4)', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    expect(sizes.sizeXXL).toBe(48);
  });

  it('size = 16 with default values', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    expect(sizes.size).toBe(16);
  });

  it('sizeXXS = 4 with default values', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    expect(sizes.sizeXXS).toBe(4);
  });

  it('all sizes are positive numbers', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    Object.values(sizes).forEach(val => {
      expect(val).toBeGreaterThan(0);
    });
  });

  it('sizes are in descending order by name', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    expect(sizes.sizeXXL).toBeGreaterThan(sizes.sizeXL);
    expect(sizes.sizeXL).toBeGreaterThan(sizes.sizeLG);
    expect(sizes.sizeXS).toBeGreaterThan(sizes.sizeXXS);
  });
});

describe('genControlHeight', () => {
  let genControlHeight: (controlHeight: number) => { controlHeightXS: number; controlHeightSM: number; controlHeightLG: number };

  beforeAll(() => {
    genControlHeight = require('../src/algorithms/genControlHeight').genControlHeight;
  });

  it('controlHeightSM = 0.85x base', () => {
    const heights = genControlHeight(32);
    expect(heights.controlHeightSM).toBe(27.2);
  });

  it('controlHeightXS = 0.5x base', () => {
    const heights = genControlHeight(32);
    expect(heights.controlHeightXS).toBe(16);
  });

  it('controlHeightLG = 1.15x base', () => {
    const heights = genControlHeight(32);
    expect(heights.controlHeightLG).toBe(36.8);
  });
});

describe('genCommonMapToken', () => {
  let genCommonMapToken: (seed: { motionUnit: number; motionBase: number; lineWidth: number; borderRadius: number }) => Record<string, number>;

  beforeAll(() => {
    genCommonMapToken = require('../src/algorithms/genCommonMapToken').genCommonMapToken;
  });

  it('motionDurationFast = 100ms', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(common.motionDurationFast).toBe(100);
  });

  it('motionDurationMid = 200ms', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(common.motionDurationMid).toBe(200);
  });

  it('motionDurationSlow = 300ms)', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(common.motionDurationSlow).toBe(300);
  });

  it('motion durations are numbers (not CSS strings)', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(typeof common.motionDurationFast).toBe('number');
  });

  it('lineWidthBold = lineWidth + 1', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(common.lineWidthBold).toBe(2);
  });
});

describe('genPresetColorPalettes', () => {
  let genPresetColorPalettes: (seed: any, algorithm: string) => Record<string, string>;

  beforeAll(() => {
    genPresetColorPalettes = require('../src/algorithms/genPresetColorPalettes').genPresetColorPalettes;
  });

  it('generates blue1..blue10', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const palettes = genPresetColorPalettes(defaultSeedToken, 'default');
    expect(palettes.blue1).toBeTruthy();
    expect(palettes.blue6).toBeTruthy();
    expect(palettes.blue10).toBeTruthy();
  });

  it('generates all 13 preset color families', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { PresetColors } = require('../src/presetColors');
    const palettes = genPresetColorPalettes(defaultSeedToken, 'default');
    PresetColors.forEach((key: string) => {
      expect(palettes[`${key}1`]).toBeTruthy();
      expect(palettes[`${key}10`]).toBeTruthy();
    });
  });

  it('all palette values are valid hex', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const palettes = genPresetColorPalettes(defaultSeedToken, 'default');
    Object.values(palettes).forEach(color => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

describe('genColorMapToken', () => {
  let genColorMapToken: any;

  beforeAll(() => {
    genColorMapToken = require('../src/algorithms/genColorMapToken').genColorMapToken;
  });

  it('produces colorPrimary from palette step 6', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });
    expect(result.colorPrimary).toBe('#1677ff');
  });

  it('produces colorPrimaryBg from palette step 1', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });
    expect(result.colorPrimaryBg).toBeTruthy();
  });

  it('colorErrorBgFilledHover is a mix of error step 2 and step 4 at 50%', () => {
    const { FastColor } = require('@ant-design/fast-color');
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });

    // genColorMapToken uses errorColors[1] (step 2) and errorColors[3] (step 4)
    const errorColors = generateColorPalettes(defaultSeedToken.colorError);
    const step2 = errorColors[1]; // BgHover
    const step4 = errorColors[3]; // BorderHover
    const expectedMix = new FastColor(step2).mix(new FastColor(step4), 50).toHexString();

    expect(result.colorErrorBgFilledHover).toBe(expectedMix);
    expect(result.colorErrorBgFilledHover).not.toBe(step2);
    expect(result.colorErrorBgFilledHover).not.toBe(step4);
  });

  it('colorLink from seed colorLink (falls back to colorInfo)', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });
    expect(result.colorLink).toBe('#1677ff'); // falls back to colorInfo
  });

  it('produces colorWhite and colorBgMask', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });
    expect(result.colorWhite).toBe('#fff');
    expect(result.colorBgMask).toBe('rgba(0, 0, 0, 0.45)');
  });

  it('uses custom colorLink when provided in seed', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const customSeed = { ...defaultSeedToken, colorLink: '#ff0000' };
    const result = genColorMapToken(customSeed, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });

    expect(result.colorLink).toBe('#ff0000');
    expect(result.colorLink).not.toBe(result.colorInfo);
  });
});

describe('genColorMapToken dark mode', () => {
  let genColorMapToken: any;

  beforeAll(() => {
    genColorMapToken = require('../src/algorithms/genColorMapToken').genColorMapToken;
  });

  it('produces different colorPrimary in dark vs default mode', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateColorPalettesDark } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');
    const { generateNeutralColorPalettesDark } = require('../src/algorithms/neutralPalettes');

    const defaultResult = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });

    const darkResult = genColorMapToken(defaultSeedToken, {
      generateColorPalettes: generateColorPalettesDark,
      generateNeutralColorPalettes: generateNeutralColorPalettesDark,
    });

    // Dark mode should produce different primary colors
    expect(defaultResult.colorPrimary).not.toBe(darkResult.colorPrimary);
    expect(defaultResult.colorPrimaryBg).not.toBe(darkResult.colorPrimaryBg);
  });

  it('produces different neutral colors in dark mode', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateColorPalettesDark } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');
    const { generateNeutralColorPalettesDark } = require('../src/algorithms/neutralPalettes');

    const defaultResult = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });

    const darkResult = genColorMapToken(defaultSeedToken, {
      generateColorPalettes: generateColorPalettesDark,
      generateNeutralColorPalettes: generateNeutralColorPalettesDark,
    });

    // Neutral colors should differ
    expect(defaultResult.colorBgContainer).not.toBe(darkResult.colorBgContainer);
    expect(defaultResult.colorText).not.toBe(darkResult.colorText);
  });

  it('preserves colorWhite and colorBgMask in dark mode', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettesDark } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettesDark } = require('../src/algorithms/neutralPalettes');

    const darkResult = genColorMapToken(defaultSeedToken, {
      generateColorPalettes: generateColorPalettesDark,
      generateNeutralColorPalettes: generateNeutralColorPalettesDark,
    });

    // These are hardcoded and should remain the same
    expect(darkResult.colorWhite).toBe('#fff');
    expect(darkResult.colorBgMask).toBe('rgba(0, 0, 0, 0.45)');
  });
});

describe('genFontMapToken', () => {
  let genFontMapToken: (base: number) => Record<string, number>;

  beforeAll(() => {
    genFontMapToken = require('../src/algorithms/genFontMapToken').genFontMapToken;
  });

  beforeAll(() => {
    genFontMapToken = require('../src/algorithms/genFontMapToken').genFontMapToken;
  });

  it('fontSize equals base font size', () => {
    const fonts = genFontMapToken(14);
    expect(fonts.fontSize).toBe(14);
  });

  it('fontSizeSM is smaller than or equal to base', () => {
    const fonts = genFontMapToken(14);
    expect(fonts.fontSizeSM).toBeLessThanOrEqual(14);
  });

  it('has 5 heading levels', () => {
    const fonts = genFontMapToken(14);
    expect(fonts.fontSizeHeading1).toBeGreaterThan(0);
    expect(fonts.fontSizeHeading2).toBeGreaterThan(0);
    expect(fonts.fontSizeHeading3).toBeGreaterThan(0);
    expect(fonts.fontSizeHeading4).toBeGreaterThan(0);
    expect(fonts.fontSizeHeading5).toBeGreaterThan(0);
  });

  it('headings are ordered H1 > H2 > H3 > H4 > H5', () => {
    const fonts = genFontMapToken(14);
    expect(fonts.fontSizeHeading1).toBeGreaterThan(fonts.fontSizeHeading2);
    expect(fonts.fontSizeHeading2).toBeGreaterThan(fonts.fontSizeHeading3);
    expect(fonts.fontSizeHeading3).toBeGreaterThan(fonts.fontSizeHeading4);
    expect(fonts.fontSizeHeading4).toBeGreaterThan(fonts.fontSizeHeading5);
  });

  it('line heights are pixel values derived from (fontSize + 10) formula', () => {
    const fonts = genFontMapToken(16);
    // fontSize=16 → lineHeight = 16 + 10 = 26
    expect(fonts.lineHeight).toBe(26);
    // fontSizeSM=14 → lineHeightSM = 14 + 10 = 24
    expect(fonts.lineHeightSM).toBe(24);
    // fontSizeLG=18 → lineHeightLG = 18 + 10 = 28
    expect(fonts.lineHeightLG).toBe(28);
    // fontSizeXL=22, same as fontSizeHeading4 → lineHeightXL = 22 + 10 = 32
    expect(fonts.lineHeightXL).toBe(32);
    // All line heights are integers (pixels)
    expect(Number.isInteger(fonts.lineHeight)).toBe(true);
    expect(Number.isInteger(fonts.lineHeightSM)).toBe(true);
    expect(Number.isInteger(fonts.lineHeightLG)).toBe(true);
    expect(Number.isInteger(fonts.lineHeightXL)).toBe(true);
  });

  it('heading line heights are pixel values', () => {
    const fonts = genFontMapToken(16);
    // fontSizeHeading1=42 → lineHeightHeading1 = 42 + 10 = 52
    expect(fonts.lineHeightHeading1).toBe(52);
    expect(Number.isInteger(fonts.lineHeightHeading1)).toBe(true);
    expect(Number.isInteger(fonts.lineHeightHeading5)).toBe(true);
  });
});
