import { createUseSheetStyle } from '@pennyspring/theme';

export interface ImagePickerStyleOptions {
  disabled: boolean;
  selected: boolean;
}

export const useStyles = createUseSheetStyle<ImagePickerStyleOptions>((token, {
  disabled,
  selected,
}) => ({
  trigger: {
    minHeight: token.controlHeight,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    borderColor: selected ? token.colorPrimaryBorder : token.colorBorder,
    backgroundColor: selected ? token.colorPrimaryBg : token.colorBgContainer,
    opacity: disabled ? token.opacityLoading : undefined,
  },
  triggerPressed: {
    backgroundColor: selected ? token.colorPrimaryBgHover : token.colorBgTextHover,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXS,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  iconContainer: {
    width: token.controlHeightSM,
    height: token.controlHeightSM,
    borderRadius: token.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: selected ? token.colorPrimary : token.colorFillTertiary,
  },
  status: {
    color: selected ? token.colorPrimaryText : token.colorTextSecondary,
  },
}));
