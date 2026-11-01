import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from './types';

/**
 * Input 与 DisplayInput 共用的字段尺寸度量。
 *
 * 两个组件的尺寸语义必须同源，避免同屏出现高度、字号或下划线错位。
 * 控件高度、字号、内边距跟随 token；行高、标签位置、文本与下划线的留白
 * 属于控件排版细节，由尺寸表直接给出，保证 size 变化时同步自适应。
 */
export interface FieldSizeMetrics {
  /** 控件高度 */
  height: (token: AliasToken) => number;
  /** 左右内边距 */
  paddingHorizontal: (token: AliasToken) => number;
  /** 前缀/后缀与输入区的水平间距 */
  gap: (token: AliasToken) => number;
  /** 正文与输入文本字号 */
  valueFontSize: (token: AliasToken) => number;
  /** 正文与输入文本行高 */
  valueLineHeight: (token: AliasToken) => number;
  /** 悬浮标签字号 */
  labelFontSize: (token: AliasToken) => number;
  /** 悬浮标签行高 */
  labelLineHeight: (token: AliasToken) => number;
  /** 激活态标签距控件顶部的距离 */
  labelTop: number;
  /** 激活态标签相对输入区再向左收拢的距离 */
  labelOffsetX: (token: AliasToken) => number;
  /** 文本与底部下划线的留白 */
  valuePaddingBottom: number;
}

/** 正文行高相对字号的额外留白 */
const VALUE_LINE_HEIGHT_LEADING = 6;

/** 悬浮标签行高相对字号的额外留白 */
const LABEL_LINE_HEIGHT_LEADING = 3;

export const FIELD_SIZE_MAP: Record<ComponentSize, FieldSizeMetrics> = {
  small: {
    height: token => token.controlHeightSM,
    paddingHorizontal: token => token.paddingXS,
    gap: token => token.sizeXXS,
    valueFontSize: token => token.fontSizeSM,
    valueLineHeight: token => token.fontSizeSM + VALUE_LINE_HEIGHT_LEADING,
    labelFontSize: token => token.fontSizeXS - 1,
    labelLineHeight: token => token.fontSizeXS - 1 + LABEL_LINE_HEIGHT_LEADING,
    labelTop: 0,
    labelOffsetX: token => token.sizeXXS / 2,
    valuePaddingBottom: 4,
  },
  normal: {
    height: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    gap: token => token.sizeXS,
    valueFontSize: token => token.fontSize,
    valueLineHeight: token => token.fontSize + VALUE_LINE_HEIGHT_LEADING,
    labelFontSize: token => token.fontSizeXS,
    labelLineHeight: token => token.fontSizeXS + LABEL_LINE_HEIGHT_LEADING,
    labelTop: 2,
    labelOffsetX: token => token.sizeXXS,
    valuePaddingBottom: 4,
  },
  large: {
    height: token => token.controlHeightLG,
    paddingHorizontal: token => token.padding,
    gap: token => token.sizeSM,
    valueFontSize: token => token.fontSizeLG,
    valueLineHeight: token => token.fontSizeLG + VALUE_LINE_HEIGHT_LEADING,
    labelFontSize: token => token.fontSizeXS + 1,
    labelLineHeight: token => token.fontSizeXS + 1 + LABEL_LINE_HEIGHT_LEADING,
    labelTop: 3,
    labelOffsetX: token => token.sizeXXS,
    valuePaddingBottom: 5,
  },
};

export function resolveFieldSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}
