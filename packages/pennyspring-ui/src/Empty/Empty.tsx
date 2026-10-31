import type { ComponentSize } from '../shares/types';
import { renderTextNode } from '../shares/node';
import React from 'react';
import { View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { EmptyProps, EmptyVariant } from './types';
import { EmptyIcon } from 'phosphor-react-native';

interface EmptyStyleOptions {
  compact: boolean;
  size: ComponentSize;
  variant: EmptyVariant;
}

interface EmptySizeConfig {
  plateSize: (token: AliasToken) => number;
  iconSize: number;
  headGap: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  descriptionMaxWidth: number;
}

/** 以下数值在 AliasToken 中没有对应档位，按设计稿落为语义常量。 */
const PILL_RADIUS = 999;
const PLATE_SMALL = 36;
const PLATE_LARGE = 52;
const PLATE_COMPACT = 32;
const ICON_COMPACT = 16;
const INLINE_PADDING_LARGE = 40;

const SIZE_STYLE_MAP: Record<ComponentSize, EmptySizeConfig> = {
  small: {
    plateSize: () => PLATE_SMALL,
    iconSize: 18,
    headGap: token => token.marginXS,
    paddingVertical: token => token.paddingLG,
    descriptionMaxWidth: 200,
  },
  normal: {
    plateSize: token => token.controlHeight,
    iconSize: 20,
    headGap: token => token.marginSM,
    paddingVertical: token => token.paddingXL,
    descriptionMaxWidth: 240,
  },
  large: {
    plateSize: () => PLATE_LARGE,
    iconSize: 24,
    headGap: token => token.marginSM,
    paddingVertical: () => INLINE_PADDING_LARGE,
    descriptionMaxWidth: 260,
  },
};

const useStyles = createUseSheetStyle(
  (token, { compact, size, variant }: EmptyStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const isBoxed = !compact && variant === 'boxed';
    const plateSize = compact ? PLATE_COMPACT : sizeConfig.plateSize(token);

    return {
      root: compact
        ? {
            paddingVertical: token.paddingXS / 2,
            width: '100%',
          }
        : {
            paddingVertical: isBoxed
              ? token.paddingLG
              : sizeConfig.paddingVertical(token),
            width: '100%',
            ...(isBoxed
              ? {
                  borderColor: token.colorBorderSecondary,
                  borderRadius: token.borderRadius,
                  borderStyle: 'dashed' as const,
                  borderWidth: token.lineWidth,
                  paddingHorizontal: token.padding,
                }
              : {}),
          },
      plate: {
        alignItems: 'center',
        backgroundColor: token.colorFillTertiary,
        borderRadius: PILL_RADIUS,
        height: plateSize,
        justifyContent: 'center',
        width: plateSize,
      },
      head: {
        marginTop: compact ? 0 : sizeConfig.headGap(token),
      },
      title: {
        color: token.colorText,
        textAlign: compact ? ('left' as const) : ('center' as const),
      },
      description: {
        color: token.colorTextTertiary,
        marginTop: token.marginXXS,
        maxWidth: sizeConfig.descriptionMaxWidth,
        textAlign: 'center' as const,
      },
      action: {
        marginTop: token.marginSM,
      },
    };
  },
);

function hasRenderableContent(content: React.ReactNode): boolean {
  return content !== null && content !== undefined && content !== false;
}

export function Empty({
  action,
  compact = false,
  description,
  descriptionText,
  icon,
  size = 'normal',
  style,
  styles,
  title,
  titleText,
  variant = 'inline',
}: EmptyProps) {
  const tokenStyles = useStyles({ compact, size, variant });
  const sizeConfig = SIZE_STYLE_MAP[size];
  const resolvedIcon =
    icon === undefined ? (
      <Icon
        icon={EmptyIcon}
        size={compact ? ICON_COMPACT : sizeConfig.iconSize}
        color="tertiary"
      />
    ) : (
      icon
    );
  const resolvedTitle = title === undefined ? titleText : title;
  const resolvedDescription =
    description === undefined ? descriptionText : description;
  const shouldRenderIcon = hasRenderableContent(resolvedIcon);
  const hasTitle = hasRenderableContent(resolvedTitle);
  const hasDescription = hasRenderableContent(resolvedDescription);
  const shouldRenderBody = hasTitle || hasDescription;
  const shouldRenderAction = !compact && hasRenderableContent(action);

  function renderPrimaryLine(
    content: React.ReactNode,
    textStyle: StyleProp<TextStyle>,
  ) {
    return renderTextNode(content, text => (
      <Text
        color="default"
        size="sm"
        style={[tokenStyles.title, textStyle]}
        weight="semibold"
      >
        {text}
      </Text>
    ));
  }

  function renderDescriptionLine(content: React.ReactNode) {
    return renderTextNode(content, text => (
      <Text
        color="tertiary"
        size="xs"
        style={[tokenStyles.description, styles?.descriptionText]}
      >
        {text}
      </Text>
    ));
  }

  // 默认图标套圆形底板；自定义节点视为已自带底板，不再套第二层。
  const iconNode = shouldRenderIcon ? (
    icon === undefined ? (
      <View style={[tokenStyles.plate, styles?.iconContainer]}>
        {resolvedIcon}
      </View>
    ) : (
      resolvedIcon
    )
  ) : null;

  if (compact) {
    const compactIsTitle = hasTitle;
    const compactLine = compactIsTitle ? resolvedTitle : resolvedDescription;
    const compactStyle = compactIsTitle
      ? styles?.titleText
      : styles?.descriptionText;

    return (
      <Row align="center" gap="large" style={[tokenStyles.root, style]}>
        {iconNode}
        {hasRenderableContent(compactLine) ? (
          <View style={tokenStyles.head}>
            {renderTextNode(compactLine, text => (
              <Text
                color="secondary"
                size="sm"
                style={compactStyle}
                weight="medium"
              >
                {text}
              </Text>
            ))}
          </View>
        ) : null}
      </Row>
    );
  }

  // 没有标题时，说明升为主行，避免出现「只有一行灰色小字」的半成品空态。
  const bodyNode = hasTitle ? (
    <>
      {renderPrimaryLine(resolvedTitle, styles?.titleText)}
      {hasDescription ? renderDescriptionLine(resolvedDescription) : null}
    </>
  ) : (
    renderPrimaryLine(resolvedDescription, styles?.descriptionText)
  );

  return (
    <Column align="center" style={[tokenStyles.root, style]}>
      {iconNode}
      {shouldRenderBody ? (
        <Column align="center" style={tokenStyles.head}>
          {bodyNode}
        </Column>
      ) : null}
      {shouldRenderAction ? (
        <Column style={tokenStyles.action}>{action}</Column>
      ) : null}
    </Column>
  );
}
