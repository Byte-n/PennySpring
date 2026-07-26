export function genControlHeight(controlHeight: number): {
  controlHeightXS: number;
  controlHeightSM: number;
  controlHeightLG: number;
} {
  return {
    controlHeightSM: controlHeight * 0.85,
    controlHeightXS: controlHeight * 0.5,
    controlHeightLG: controlHeight * 1.15,
  };
}
