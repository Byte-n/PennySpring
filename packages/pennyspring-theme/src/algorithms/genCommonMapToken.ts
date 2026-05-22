import { genRadius } from './genRadius';

export function genCommonMapToken(seed: {
  motionUnit: number;
  motionBase: number;
  lineWidth: number;
  borderRadius: number;
}): Record<string, number> {
  const radii = genRadius(seed.borderRadius);
  return {
    motionDurationFast: 100,
    motionDurationMid: 200,
    motionDurationSlow: 300,
    lineWidthBold: seed.lineWidth + 1,
    ...radii,
  };
}
