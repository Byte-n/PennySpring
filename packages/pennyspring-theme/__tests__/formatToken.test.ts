describe('formatToken', () => {
  let formatToken: (mapToken: any) => Record<string, any>;

  beforeAll(() => {
    formatToken = require('../src/algorithms/formatToken').formatToken;
  });

  it('produces AliasToken semantic color aliases', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.colorFillContent).toBeTruthy();
    expect(alias.colorFillAlter).toBeTruthy();
  });

  it('colorTextPlaceholder maps to colorTextQuaternary', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.colorTextPlaceholder).toBe(alias.colorTextQuaternary);
  });

  it('colorTextDisabled maps to colorTextQuaternary', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.colorTextDisabled).toBe(alias.colorTextQuaternary);
  });

  it('colorIcon maps to colorTextTertiary', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.colorIcon).toBe(alias.colorTextTertiary);
  });

  it('colorIconHover maps to colorText', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.colorIconHover).toBe(alias.colorText);
  });

  it('spacing scale derived from size tokens', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.paddingXXS).toBe(alias.sizeXXS);
    expect(alias.paddingXS).toBe(alias.sizeXS);
    expect(alias.marginXXL).toBe(alias.sizeXXL);
  });

  it('uses half vertical content padding from horizontal content padding', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.paddingContentVertical).toBe(
      alias.paddingContentHorizontal / 2,
    );
    expect(alias.paddingContentVerticalSM).toBe(
      alias.paddingContentHorizontalSM / 2,
    );
    expect(alias.paddingContentVerticalLG).toBe(
      alias.paddingContentHorizontalLG / 2,
    );
  });

  it('generates boxShadow tokens', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.boxShadow).toBeTruthy();
    expect(alias.boxShadow.shadowColor).toBeTruthy();
    expect(alias.boxShadow.shadowOffset).toBeTruthy();
    expect(typeof alias.boxShadow.shadowOpacity).toBe('number');
    expect(typeof alias.boxShadow.shadowRadius).toBe('number');
    expect(typeof alias.boxShadow.elevation).toBe('number');
  });

  it('boxShadow* are softened for RN iOS (no spread)', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    // Primary shadow: offsetY=4, blur=12, opacity=0.06, elevation=4
    expect(alias.boxShadow.shadowOffset).toEqual({ width: 0, height: 4 });
    expect(alias.boxShadow.shadowRadius).toBe(12);
    expect(alias.boxShadow.shadowOpacity).toBeCloseTo(0.06, 3);
    expect(alias.boxShadow.elevation).toBe(4);

    // Secondary shadow: offsetY=2, blur=8, opacity=0.04, elevation=3
    expect(alias.boxShadowSecondary.shadowOffset).toEqual({
      width: 0,
      height: 2,
    });
    expect(alias.boxShadowSecondary.shadowRadius).toBe(8);
    expect(alias.boxShadowSecondary.shadowOpacity).toBeCloseTo(0.04, 3);
    expect(alias.boxShadowSecondary.elevation).toBe(3);

    // Tertiary shadow: offsetY=1, blur=4, opacity=0.02, elevation=2
    expect(alias.boxShadowTertiary.shadowOffset).toEqual({
      width: 0,
      height: 1,
    });
    expect(alias.boxShadowTertiary.shadowRadius).toBe(4);
    expect(alias.boxShadowTertiary.shadowOpacity).toBeCloseTo(0.02, 3);
    expect(alias.boxShadowTertiary.elevation).toBe(2);
  });

  it('boxShadow is the deepest shadow (largest blur)', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.boxShadow.shadowRadius).toBeGreaterThan(
      alias.boxShadowTertiary.shadowRadius,
    );
  });

  it('boxShadowTertiary is the shallowest shadow', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.boxShadowTertiary.shadowRadius).toBeLessThan(
      alias.boxShadow.shadowRadius,
    );
  });

  it('fontWeightStrong maps to fontWeightSemiBold from MapToken', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = {
      ...derivative(defaultSeedToken, false),
      fontWeightSemiBold: 700,
    };
    const alias = formatToken(mapToken);

    expect(alias.fontWeightSemiBold).toBe(700);
    expect(alias.fontWeightStrong).toBe(alias.fontWeightSemiBold);
  });

  it('colorSplit is generated from colorBorderSecondary and colorBgContainer', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.colorSplit).toBeTruthy();
  });

  it('controlOutline is generated', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.controlOutline).toBeTruthy();
  });
});
