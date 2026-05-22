export function genRadius(baseRadius: number): {
  borderRadiusLG: number;
  borderRadiusSM: number;
  borderRadiusXS: number;
  borderRadiusOuter: number;
} {
  let borderRadiusLG = baseRadius + 1;
  if (baseRadius >= 6 && baseRadius < 16) {
    borderRadiusLG = baseRadius + 2;
  } else if (baseRadius >= 16) {
    borderRadiusLG = 16;
  }

  let borderRadiusSM: number;
  if (baseRadius < 7) {
    borderRadiusSM = 4;
  } else if (baseRadius < 8) {
    borderRadiusSM = 5;
  } else if (baseRadius < 14) {
    borderRadiusSM = 6;
  } else if (baseRadius < 16) {
    borderRadiusSM = 7;
  } else {
    borderRadiusSM = 8;
  }

  const borderRadiusXS = baseRadius < 6 ? 1 : 2;

  let borderRadiusOuter: number;
  if (baseRadius > 4 && baseRadius < 8) {
    borderRadiusOuter = 4;
  } else if (baseRadius >= 8) {
    borderRadiusOuter = 6;
  } else {
    borderRadiusOuter = baseRadius;
  }

  return { borderRadiusLG, borderRadiusSM, borderRadiusXS, borderRadiusOuter };
}
