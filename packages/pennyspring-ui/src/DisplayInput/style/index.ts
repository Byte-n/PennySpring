import { createUseSheetStyle } from '@pennyspring/theme';
import { FIELD_SIZE_MAP } from '../../shares/fieldMetrics';
import type { ComponentSize } from '../../shares/types';
import type { DisplayInputDisplay } from '../types';

interface DisplayInputStyleOptions {
  disabled: boolean;
  display: DisplayInputDisplay;
  hasLabel: boolean;
  isError: boolean;
  reserveLabelSpace: boolean;
  size: ComponentSize;
}

export const useStyles = createUseSheetStyle(
  (
    token,
    {
      disabled,
      display,
      hasLabel,
      isError,
      reserveLabelSpace,
      size,
    }: DisplayInputStyleOptions,
  ) => {
    const metrics = FIELD_SIZE_MAP[size];
    const height = metrics.height(token);
    const valueFontSize = metrics.valueFontSize(token);
    const valueLineHeight = metrics.valueLineHeight(token);
    const valuePaddingBottom = metrics.valuePaddingBottom;
    const labelReserve = metrics.labelTop + metrics.labelLineHeight(token);
    const underlineColor = isError ? token.colorError : token.colorBorder;
    const labelColor = disabled
      ? token.colorTextDisabled
      : isError
        ? token.colorError
        : token.colorTextPlaceholder;

    return {
      root: {
        alignSelf: display === 'inline' ? 'flex-start' : 'stretch',
        flexBasis: display === 'inline' ? 'auto' : '100%',
        flexGrow: display === 'inline' ? 0 : 1,
        flexShrink: display === 'inline' ? 1 : 0,
        maxWidth: '100%',
        overflow: 'hidden',
        gap: token.marginXXS,
      },
      // 与 Input 一致：下划线字段不提供填充背景
      field: {
        minHeight: height,
        paddingHorizontal: metrics.paddingHorizontal(token),
        flexDirection: 'row',
        alignItems: 'center',
        gap: metrics.gap(token),
        position: 'relative',
      },
      fieldPressed: {
        backgroundColor: token.colorFillQuaternary,
      },
      // 禁用态由组件自身表达，调用方不得再叠加透明度
      fieldDisabled: {
        opacity: token.opacityLoading,
      },
      // 与 Input 一致：下划线始终 1px，状态只通过颜色表达
      underline: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: token.lineWidth,
        backgroundColor: disabled ? token.colorBorderDisabled : underlineColor,
      },
      prefix: {
        flexShrink: 0,
      },
      suffix: {
        flexShrink: 0,
      },
      valueWrapper: {
        flex: display === 'inline' ? undefined : 1,
        flexShrink: 1,
        minWidth: 0,
        minHeight: height,
        // 有标签时值贴底，无标签时值在控件内垂直居中
        justifyContent: hasLabel ? 'flex-end' : 'center',
        // 内容可换行时预留悬浮标签占据的顶部区域，避免内容向上生长压住标签
        paddingTop: reserveLabelSpace ? labelReserve : 0,
        position: 'relative',
      },
      floatingLabelContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: token.zIndexBase,
      },
      floatingLabel: {
        color: labelColor,
        fontFamily: token.fontFamily,
      },
      // 标签浮起后承担“字段名”职责，用 tertiary 保证小字号可读性
      floatingLabelActive: {
        color: disabled
          ? token.colorTextDisabled
          : isError
            ? token.colorError
            : token.colorTextTertiary,
      },
      // 隐藏占位文本：只为行内模式预留标签宽度，不参与视觉
      labelWidthPlaceholder: {
        height: 0,
        overflow: 'visible',
        opacity: 0,
        fontSize: valueFontSize,
        lineHeight: valueLineHeight,
      },
      value: {
        fontFamily: token.fontFamily,
        fontSize: valueFontSize,
        lineHeight: valueLineHeight,
        paddingBottom: hasLabel ? valuePaddingBottom : 0,
      },
      valueContainer: {
        paddingBottom: hasLabel ? valuePaddingBottom : 0,
      },
      valueContainerHidden: {
        overflow: 'hidden',
      },
      valueContainerVisible: {
        overflow: 'visible',
      },
    };
  },
);
