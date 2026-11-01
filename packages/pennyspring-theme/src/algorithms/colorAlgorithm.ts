import { FastColor } from '@ant-design/fast-color';

export function getAlphaColor(baseColor: string, alpha: number): string {
  return new FastColor(baseColor).setA(alpha).toRgbString();
}

export function getSolidColor(baseColor: string, brightness: number): string {
  return new FastColor(baseColor).darken(brightness).toHexString();
}

export function getSolidColorDark(
  baseColor: string,
  brightness: number,
): string {
  return new FastColor(baseColor).lighten(brightness).toHexString();
}
