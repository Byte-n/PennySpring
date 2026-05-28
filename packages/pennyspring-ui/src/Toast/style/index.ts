import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import type { ComponentSize } from '../../shares/types';
import type { ToastPlacement } from '../types';

export const SIZE_TOKEN_MAP: Record<
  ComponentSize,
  {
    verticalPadding: (token: AliasToken) => number;
    horizontalPadding: (token: AliasToken) => number;
    textSize: 'sm' | 'md' | 'lg';
  }
> = {
  small: {
    verticalPadding: token => token.paddingSM / 2,
    horizontalPadding: token => token.paddingSM,
    textSize: 'sm',
  },
  normal: {
    verticalPadding: token => token.padding / 2,
    horizontalPadding: token => token.padding,
    textSize: 'md',
  },
  large: {
    verticalPadding: token => token.paddingMD / 2,
    horizontalPadding: token => token.paddingMD,
    textSize: 'lg',
  },
};

function getPlacementStyle(placement: ToastPlacement): ViewStyle {
  if (placement === 'top') {
    return { top: 0 };
  }

  if (placement === 'bottom') {
    return { bottom: 0 };
  }

  return { top: '50%' };
}

export const useStyles = createUseSheetStyle(
  (token, { size, placement }: { size: ComponentSize; placement: ToastPlacement }) => {
    const sizeConfig = SIZE_TOKEN_MAP[size];

    return {
      content: {
        position: 'absolute',
        zIndex: token.zIndexPopupBase + 100,
        maxWidth: '100%',
        ...getPlacementStyle(placement),
        ...(placement === 'top'
          ? { marginTop: token.paddingXL }
          : placement === 'bottom'
          ? { marginBottom: token.paddingXL }
          : null),
        alignSelf: 'center',
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgSpotlight,
        paddingVertical: sizeConfig.verticalPadding(token),
        paddingHorizontal: sizeConfig.horizontalPadding(token),
      },
      messageText: {
        color: token.colorTextLightSolid,
        textAlign: 'center',
      },
    };
  },
);
