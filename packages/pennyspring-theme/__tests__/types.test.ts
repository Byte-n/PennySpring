describe('PresetColors', () => {
    });

describe('SeedToken and defaults', () => {
  it('defaultSeedToken has correct primary values', () => {
    const { defaultSeedToken } = require('../src/defaults');
    expect(defaultSeedToken.colorPrimary).toBe('#1677ff');
    // 移动端修正：fontSize 16 / controlHeight 44 / borderRadius 8
    expect(defaultSeedToken.fontSize).toBe(16);
    expect(defaultSeedToken.fontWeight).toBe(400);
    expect(defaultSeedToken.borderRadius).toBe(8);
    expect(defaultSeedToken.sizeUnit).toBe(4);
    expect(defaultSeedToken.sizeStep).toBe(4);
    expect(defaultSeedToken.controlHeight).toBe(44);
  });

    it('defaultSeedToken excludes web-only fields', () => {
    const { defaultSeedToken } = require('../src/defaults');
    expect('lineType' in defaultSeedToken).toBe(false);
    expect('linkDecoration' in defaultSeedToken).toBe(false);
    expect('wireframe' in defaultSeedToken).toBe(true); // wireframe exists but deprecated
  });

  it('defaultSeedToken has preset color keys', () => {
    const { defaultSeedToken } = require('../src/defaults');
    expect(defaultSeedToken.blue).toBe('#1677FF');
    expect(defaultSeedToken.red).toBe('#F5222D');
    expect(defaultSeedToken.gold).toBe('#FAAD14');
  });
});
