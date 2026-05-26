import type { PresetColorType, PresetColorKey } from './presetColors';

/** 三次贝塞尔曲线，四个控制点 [x1, y1, x2, y2]，适配 RN Animated.Easing.bezier() */
export type CubicBezier = [number, number, number, number];

/** 阴影 token，映射到 React Native ViewStyle shadow 属性 */
export interface ShadowToken {
  /** 阴影颜色 */
  shadowColor: string;
  /** 阴影偏移量 */
  shadowOffset: { width: number; height: number };
  /** 阴影透明度 (0-1) */
  shadowOpacity: number;
  /** 阴影模糊半径（iOS shadowRadius / Android blur） */
  shadowRadius: number;
  /** Android elevation 值 */
  elevation: number;
}

/** 种子 token — 设计系统的输入变量，由设计师/开发者定义 */
export interface SeedToken extends PresetColorType {
  /** 主色（品牌色），影响整个调色盘的生成 */
  colorPrimary: string;
  /** 成功色 */
  colorSuccess: string;
  /** 警告色 */
  colorWarning: string;
  /** 错误色 */
  colorError: string;
  /** 信息色 */
  colorInfo: string;
  /** 文本基色，为空时浅色用 '#000'、暗色用 '#fff' */
  colorTextBase: string;
  /** 背景基色，为空时浅色用 '#fff'、暗色用 '#000' */
  colorBgBase: string;
  /** 链接色，为空时回退到 colorInfo */
  colorLink: string;
  /** 基准字体家族（RN 场景请使用 `Platform.select({ ios, android })` 产出单一字体名，不接受 CSS 字体栈） */
  fontFamily: string;
  /** 代码字体家族（同上，使用 `Platform.select` 产出单一字体名） */
  fontFamilyCode: string;
  /** 基准字号 (px) */
  fontSize: number;
  /** 基准字重 */
  fontWeight: number;
  /** 线宽基准 (px) */
  lineWidth: number;
  /** 基准圆角半径 (px) */
  borderRadius: number;
  /** 尺寸计算单元，所有尺寸 token 的基础乘数 */
  sizeUnit: number;
  /** 尺寸计算步长偏移 */
  sizeStep: number;
  /** 弹出箭头尺寸 (px) */
  sizePopupArrow: number;
  /** 控件基准高度 (px) */
  controlHeight: number;
  /** z-index 基准值 */
  zIndexBase: number;
  /** 弹出层 z-index 基准值 */
  zIndexPopupBase: number;
  /** 图片不透明度 (0-1) */
  opacityImage: number;
  /** 动效计算单元 */
  motionUnit: number;
  /** 动效基准值 */
  motionBase: number;
  /** 圆形缓出曲线 */
  motionEaseOutCirc: CubicBezier;
  /** 圆形缓入缓出曲线 */
  motionEaseInOutCirc: CubicBezier;
  /** 标准缓入缓出曲线 */
  motionEaseInOut: CubicBezier;
  /** 回退缓出曲线 */
  motionEaseOutBack: CubicBezier;
  /** 回退缓入曲线 */
  motionEaseInBack: CubicBezier;
  /** 五次方缓入曲线 */
  motionEaseInQuint: CubicBezier;
  /** 五次方缓出曲线 */
  motionEaseOutQuint: CubicBezier;
  /** 标准缓出曲线 */
  motionEaseOut: CubicBezier;
  /** 线框模式（antd v5 已废弃，保留兼容） */
  wireframe: boolean;
  /** 是否启用动效，false 时所有动效时长归零 */
  motion: boolean;
}

// --- ColorMapToken sub-interfaces ---

/** 中性色映射 token — 文本、填充、背景、边框梯度 */
export interface ColorNeutralMapToken {
  /** 文本基色 */
  colorTextBase: string;
  /** 背景基色 */
  colorBgBase: string;
  /** 阴影色 */
  colorShadow: string;
  /** 一级文本色（88% 透明度） */
  colorText: string;
  /** 二级文本色（65% 透明度） */
  colorTextSecondary: string;
  /** 三级文本色（45% 透明度） */
  colorTextTertiary: string;
  /** 四级文本色（25% 透明度） */
  colorTextQuaternary: string;
  /** 一级填充色 */
  colorFill: string;
  /** 二级填充色 */
  colorFillSecondary: string;
  /** 三级填充色 */
  colorFillTertiary: string;
  /** 四级填充色 */
  colorFillQuaternary: string;
  /** 布局背景色 */
  colorBgLayout: string;
  /** 容器背景色 */
  colorBgContainer: string;
  /** 浮层背景色 */
  colorBgElevated: string;
  /** 聚光灯/最深背景色 */
  colorBgSpotlight: string;
  /** 毛玻璃效果背景色 */
  colorBgBlur: string;
  /** 实色背景 */
  colorBgSolid: string;
  /** 实色背景悬停态 */
  colorBgSolidHover: string;
  /** 实色背景激活态 */
  colorBgSolidActive: string;
  /** 一级边框色 */
  colorBorder: string;
  /** 二级边框色 */
  colorBorderSecondary: string;
  /** 禁用态边框色 */
  colorBorderDisabled: string;
}

/** 主色梯度 token — 由 colorPrimary 派生 10 阶语义色 */
export interface ColorPrimaryMapToken {
  /** 主色背景 */
  colorPrimaryBg: string;
  /** 主色背景悬停态 */
  colorPrimaryBgHover: string;
  /** 主色边框 */
  colorPrimaryBorder: string;
  /** 主色边框悬停态 */
  colorPrimaryBorderHover: string;
  /** 主色悬停态 */
  colorPrimaryHover: string;
  /** 主色 */
  colorPrimary: string;
  /** 主色激活态 */
  colorPrimaryActive: string;
  /** 主色文本悬停态 */
  colorPrimaryTextHover: string;
  /** 主色文本 */
  colorPrimaryText: string;
  /** 主色文本激活态 */
  colorPrimaryTextActive: string;
}

/** 成功色梯度 token */
export interface ColorSuccessMapToken {
  /** 成功色背景 */
  colorSuccessBg: string;
  /** 成功色背景悬停态 */
  colorSuccessBgHover: string;
  /** 成功色边框 */
  colorSuccessBorder: string;
  /** 成功色边框悬停态 */
  colorSuccessBorderHover: string;
  /** 成功色悬停态 */
  colorSuccessHover: string;
  /** 成功色 */
  colorSuccess: string;
  /** 成功色激活态 */
  colorSuccessActive: string;
  /** 成功色文本悬停态 */
  colorSuccessTextHover: string;
  /** 成功色文本 */
  colorSuccessText: string;
  /** 成功色文本激活态 */
  colorSuccessTextActive: string;
}

/** 警告色梯度 token */
export interface ColorWarningMapToken {
  /** 警告色背景 */
  colorWarningBg: string;
  /** 警告色背景悬停态 */
  colorWarningBgHover: string;
  /** 警告色边框 */
  colorWarningBorder: string;
  /** 警告色边框悬停态 */
  colorWarningBorderHover: string;
  /** 警告色悬停态 */
  colorWarningHover: string;
  /** 警告色 */
  colorWarning: string;
  /** 警告色激活态 */
  colorWarningActive: string;
  /** 警告色文本悬停态 */
  colorWarningTextHover: string;
  /** 警告色文本 */
  colorWarningText: string;
  /** 警告色文本激活态 */
  colorWarningTextActive: string;
}

/** 错误色梯度 token */
export interface ColorErrorMapToken {
  /** 错误色背景 */
  colorErrorBg: string;
  /** 错误色背景悬停态 */
  colorErrorBgHover: string;
  /** 错误色填充悬停态（填充按钮等场景） */
  colorErrorBgFilledHover: string;
  /** 错误色背景激活态 */
  colorErrorBgActive: string;
  /** 错误色边框 */
  colorErrorBorder: string;
  /** 错误色边框悬停态 */
  colorErrorBorderHover: string;
  /** 错误色悬停态 */
  colorErrorHover: string;
  /** 错误色 */
  colorError: string;
  /** 错误色激活态 */
  colorErrorActive: string;
  /** 错误色文本悬停态 */
  colorErrorTextHover: string;
  /** 错误色文本 */
  colorErrorText: string;
  /** 错误色文本激活态 */
  colorErrorTextActive: string;
}

/** 信息色梯度 token */
export interface ColorInfoMapToken {
  /** 信息色背景 */
  colorInfoBg: string;
  /** 信息色背景悬停态 */
  colorInfoBgHover: string;
  /** 信息色边框 */
  colorInfoBorder: string;
  /** 信息色边框悬停态 */
  colorInfoBorderHover: string;
  /** 信息色悬停态 */
  colorInfoHover: string;
  /** 信息色 */
  colorInfo: string;
  /** 信息色激活态 */
  colorInfoActive: string;
  /** 信息色文本悬停态 */
  colorInfoTextHover: string;
  /** 信息色文本 */
  colorInfoText: string;
  /** 信息色文本激活态 */
  colorInfoTextActive: string;
}

/** 链接色梯度 token */
export interface ColorLinkMapToken {
  /** 链接色 */
  colorLink: string;
  /** 链接色悬停态 */
  colorLinkHover: string;
  /** 链接色激活态 */
  colorLinkActive: string;
}

/** 完整颜色映射 token — 合并所有子色板 */
export interface ColorMapToken
  extends ColorNeutralMapToken,
    ColorPrimaryMapToken,
    ColorSuccessMapToken,
    ColorWarningMapToken,
    ColorErrorMapToken,
    ColorInfoMapToken,
    ColorLinkMapToken {
  /** 纯白色 */
  colorWhite: string;
  /** 遮罩/蒙层背景色 */
  colorBgMask: string;
}

// --- Size and Height ---

/** 尺寸映射 token — 由 sizeUnit × (sizeStep + offset) 派生 */
export interface SizeMapToken {
  /** 超超超大尺寸 */
  sizeXXL: number;
  /** 超超大尺寸 */
  sizeXL: number;
  /** 大尺寸 */
  sizeLG: number;
  /** 中等偏大尺寸 */
  sizeMD: number;
  /** 中等偏小尺寸 */
  sizeMS: number;
  /** 基准尺寸 */
  size: number;
  /** 小尺寸 */
  sizeSM: number;
  /** 超小尺寸 */
  sizeXS: number;
  /** 超超小尺寸 */
  sizeXXS: number;
}

/** 控件高度映射 token */
export interface HeightMapToken {
  /** 超小控件高度（controlHeight × 0.5） */
  controlHeightXS: number;
  /** 小控件高度（controlHeight × 0.75） */
  controlHeightSM: number;
  /** 大控件高度（controlHeight × 1.25） */
  controlHeightLG: number;
}

// --- Font ---

/** 字体映射 token — 字号、行高、字高 */
export interface FontMapToken {
  /** 小号字号 */
  fontSizeSM: number;
  /** 基准字号 */
  fontSize: number;
  /** 大号字号 */
  fontSizeLG: number;
  /** 超大号字号 */
  fontSizeXL: number;
  /** H1 标题字号 */
  fontSizeHeading1: number;
  /** H2 标题字号 */
  fontSizeHeading2: number;
  /** H3 标题字号 */
  fontSizeHeading3: number;
  /** H4 标题字号 */
  fontSizeHeading4: number;
  /** H5 标题字号 */
  fontSizeHeading5: number;
  /** 基准行高（像素） */
  lineHeight: number;
  /** 大号行高（像素） */
  lineHeightLG: number;
  /** 小号行高（像素） */
  lineHeightSM: number;
  /** 超大号行高（像素） */
  lineHeightXL: number;
  /** H1 行高（像素） */
  lineHeightHeading1: number;
  /** H2 行高（像素） */
  lineHeightHeading2: number;
  /** H3 行高（像素） */
  lineHeightHeading3: number;
  /** H4 行高（像素） */
  lineHeightHeading4: number;
  /** H5 行高（像素） */
  lineHeightHeading5: number;
  /** Light 字重 */
  fontWeightLight: number;
  /** Regular 字重 */
  fontWeightRegular: number;
  /** Medium 字重 */
  fontWeightMedium: number;
  /** SemiBold 字重 */
  fontWeightSemiBold: number;
  /** Bold 字重 */
  fontWeightBold: number;
}

// --- Style and Common ---

/** 样式映射 token — 线宽、圆角变体 */
export interface StyleMapToken {
  /** 加粗线宽（lineWidth + 1） */
  lineWidthBold: number;
  /** 超小圆角 */
  borderRadiusXS: number;
  /** 小圆角 */
  borderRadiusSM: number;
  /** 大圆角 */
  borderRadiusLG: number;
  /** 外部容器圆角 */
  borderRadiusOuter: number;
}

/** 通用映射 token — 动效时长、样式变体 */
export interface CommonMapToken extends StyleMapToken {
  /** 快速动效时长 (ms)，如 hover 反馈 */
  motionDurationFast: number;
  /** 中速动效时长 (ms)，如模态框进出 */
  motionDurationMid: number;
  /** 慢速动效时长 (ms)，如大幅动画 */
  motionDurationSlow: number;
}

// --- Preset Color Gradients ---

type PresetColorStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * 预设色梯度 token — 13 种标准色 × 10 个色阶
 *
 * 如 `blue1`..`blue10`、`red1`..`red10`、`gold1`..`gold10`
 * 共 130 个字段，颜色由 @ant-design/colors 的 generate() 派生
 */
export type PresetColorGradientToken = {
  [K in PresetColorKey as `${K}${PresetColorStep}`]: string;
};

// --- Full MapToken ---

/** 完整派生 token — 种子 token 经过全套算法链路的输出 */
export interface MapToken
  extends SeedToken,
    ColorMapToken,
    SizeMapToken,
    HeightMapToken,
    StyleMapToken,
    FontMapToken,
    CommonMapToken,
    PresetColorGradientToken {}

// --- AliasToken ---

/**
 * 语义别名 token — 组件直接消费的最终 token 层
 *
 * 基于 MapToken 增加语义化颜色别名、间距尺、阴影、断点、
 * 控件交互状态、轮廓色等 RN 运行时直接可用的值。
 */
export interface AliasToken extends MapToken {
  /** 内容区填充色（= colorFillSecondary） */
  colorFillContent: string;
  /** 内容区填充色悬停态（= colorFillTertiary） */
  colorFillContentHover: string;
  /** 交替填充色（= colorFillQuaternary） */
  colorFillAlter: string;
  /** 容器背景禁用态 */
  colorBgContainerDisabled: string;
  /** 文本背景悬停态 */
  colorBgTextHover: string;
  /** 文本背景激活态（= colorFill） */
  colorBgTextActive: string;
  /** 边框背景色（= colorBgContainer） */
  colorBorderBg: string;
  /** 分割线色（基于 colorBorderSecondary 和 colorBgContainer 混合） */
  colorSplit: string;
  /** 占位文本色（= colorTextQuaternary） */
  colorTextPlaceholder: string;
  /** 禁用文本色（= colorTextQuaternary） */
  colorTextDisabled: string;
  /** 标题文本色（= colorText） */
  colorTextHeading: string;
  /** 标签文本色（= colorText） */
  colorTextLabel: string;
  /** 描述文本色（= colorTextTertiary） */
  colorTextDescription: string;
  /** 浅色实色文本 */
  colorTextLightSolid: string;
  /** 高亮/强调色 */
  colorHighlight: string;
  /** 图标色（= colorTextTertiary） */
  colorIcon: string;
  /** 图标悬停色（= colorText） */
  colorIconHover: string;
  /** 控件聚焦态轮廓色（基于 colorPrimaryBg 和 colorBgContainer 混合） */
  controlOutline: string;
  /** 控件聚焦态轮廓宽度（lineWidth × 3） */
  controlOutlineWidth: number;
  /** 控件项背景悬停态 */
  controlItemBgHover: string;
  /** 控件项背景激活态（= colorPrimaryBg） */
  controlItemBgActive: string;
  /** 控件项背景激活悬停态 */
  controlItemBgActiveHover: string;
  /** 控件项背景激活禁用态（= colorFill） */
  controlItemBgActiveDisabled: string;
  /** 控件交互热区尺寸 */
  controlInteractiveSize: number;
  /** 控件水平内边距 */
  controlPaddingHorizontal: number;
  /** 控件小号水平内边距 */
  controlPaddingHorizontalSM: number;
  /** 错误态外轮廓色（基于 colorErrorBg 和 colorBgContainer 混合） */
  colorErrorOutline: string;
  /** 警告态外轮廓色（基于 colorWarningBg 和 colorBgContainer 混合） */
  colorWarningOutline: string;
  /** 图标字号 */
  fontSizeIcon: number;
  /** Light 字重 */
  fontWeightLight: number;
  /** Regular 字重 */
  fontWeightRegular: number;
  /** Medium 字重 */
  fontWeightMedium: number;
  /** SemiBold 字重 */
  fontWeightSemiBold: number;
  /** Bold 字重 */
  fontWeightBold: number;
  /** 加粗字重（兼容别名，等同于 fontWeightSemiBold） */
  fontWeightStrong: number;
  /** 聚焦态线宽（lineWidth × 3） */
  lineWidthFocus: number;
  /** 超超小内边距 */
  paddingXXS: number;
  /** 超小内边距 */
  paddingXS: number;
  /** 小内边距 */
  paddingSM: number;
  /** 基准内边距 */
  padding: number;
  /** 中等内边距 */
  paddingMD: number;
  /** 大内边距 */
  paddingLG: number;
  /** 超大内边距 */
  paddingXL: number;
  /** 大号内容水平内边距 */
  paddingContentHorizontalLG: number;
  /** 基准内容水平内边距 */
  paddingContentHorizontal: number;
  /** 小号内容水平内边距 */
  paddingContentHorizontalSM: number;
  /** 大号内容垂直内边距 */
  paddingContentVerticalLG: number;
  /** 基准内容垂直内边距 */
  paddingContentVertical: number;
  /** 小号内容垂直内边距 */
  paddingContentVerticalSM: number;
  /** 超超小外边距 */
  marginXXS: number;
  /** 超小外边距 */
  marginXS: number;
  /** 小外边距 */
  marginSM: number;
  /** 基准外边距 */
  margin: number;
  /** 中等外边距 */
  marginMD: number;
  /** 大外边距 */
  marginLG: number;
  /** 超大外边距 */
  marginXL: number;
  /** 超超大外边距 */
  marginXXL: number;
  /** 一级阴影（最深，blur=16, opacity=0.08） */
  boxShadow: ShadowToken;
  /** 二级阴影（中等，blur=6, opacity=0.06） */
  boxShadowSecondary: ShadowToken;
  /** 三级阴影（最浅，blur=2, opacity=0.03） */
  boxShadowTertiary: ShadowToken;
  /** 加载态不透明度 */
  opacityLoading: number;
  /** 控件临时轮廓色 */
  controlTmpOutline: string;
}

type AliasColorTokenKeyWithoutPrefix<
  TKey extends string,
> = TKey extends `color${infer ColorName}` ? Uncapitalize<ColorName> : never;

export type AliasColorTokenKey =
  | AliasColorTokenKeyWithoutPrefix<Extract<keyof AliasToken, `color${string}`>>
  | PresetColorKey
  | keyof PresetColorGradientToken;
