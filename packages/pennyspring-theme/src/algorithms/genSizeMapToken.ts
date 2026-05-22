const offsets: Record<string, number> = {
  XXL: 8,
  XL: 4,
  LG: 2,
  MD: 1,
  MS: 0,
  size: 0,
  SM: -1,
  XS: -2,
  XXS: -3,
};

export function genSizeMapToken(seed: {
  sizeUnit: number;
  sizeStep: number;
}): Record<string, number> {
  const { sizeUnit, sizeStep } = seed;
  return {
    sizeXXL: sizeUnit * (sizeStep + offsets.XXL),
    sizeXL: sizeUnit * (sizeStep + offsets.XL),
    sizeLG: sizeUnit * (sizeStep + offsets.LG),
    sizeMD: sizeUnit * (sizeStep + offsets.MD),
    sizeMS: sizeUnit * (sizeStep + offsets.MS),
    size: sizeUnit * (sizeStep + offsets.size),
    sizeSM: sizeUnit * (sizeStep + offsets.SM),
    sizeXS: sizeUnit * (sizeStep + offsets.XS),
    sizeXXS: sizeUnit * (sizeStep + offsets.XXS),
  };
}
