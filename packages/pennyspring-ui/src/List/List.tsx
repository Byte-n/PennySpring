import type { ComponentSize } from '../shares/types';
import { renderTextNode as renderSlotTextNode } from '../shares/node';
import React, { createContext, useContext } from 'react';
import { Pressable } from 'react-native';
import { Column } from '../Column';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Row } from '../Row';
import { Text } from '../Text';
import type {
  AliasToken } from '@pennyspring/theme';
import type { ReactNode } from 'react';
import type { GestureResponderEvent,
  StyleProp,
  TextStyle } from 'react-native';
import type { ListDivider,
  ListItemProps,
  ListProps,
} from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_DIVIDER: ListDivider = 'inset';

interface ListContextValue {
  size: ComponentSize;
  divider: ListDivider;
}

const ListContext = createContext<ListContextValue>({
  divider: DEFAULT_DIVIDER,
  size: DEFAULT_SIZE,
});

const useListStyles = createUseSheetStyle(token => ({
  root: {
    backgroundColor: token.colorBgContainer,
  },
  header: {
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingMD / 2,
  },
  footer: {
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingMD / 2,
  },
  empty: {
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingMD / 2,
  },
  loading: {
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingMD / 2,
  },
}));

interface ListItemStyleOptions {
  divider: ListDivider;
  size: ComponentSize;
}

function getItemMinHeight(size: ComponentSize, token: AliasToken) {
  if (size === 'small') {
    return token.controlHeightSM;
  }

  if (size === 'large') {
    return token.controlHeightLG;
  }

  return token.controlHeight;
}

function getItemHorizontalPadding(
  size: ComponentSize,
  token: AliasToken,
) {
  if (size === 'small') {
    return token.paddingSM;
  }

  if (size === 'large') {
    return token.paddingLG;
  }

  return token.paddingMD;
}

function getSlotGap(size: ComponentSize, token: AliasToken) {
  return size === 'small' ? token.marginXS : token.marginSM;
}

const useListItemStyles = createUseSheetStyle(
  (token, { divider, size }: ListItemStyleOptions) => {
    const horizontalPadding = getItemHorizontalPadding(size, token);
    const verticalPadding = horizontalPadding / 2;
    const slotGap = getSlotGap(size, token);

    return {
      item: {
        minHeight: getItemMinHeight(size, token),
        paddingHorizontal: horizontalPadding,
        paddingVertical: verticalPadding,
        backgroundColor: token.colorBgContainer,
      },
      itemPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      itemSelected: {
        backgroundColor: token.controlItemBgActive,
      },
      itemDisabled: {
        opacity: token.opacityLoading,
        backgroundColor: token.colorBgContainerDisabled,
      },
      selectedMarker: {
        width: token.lineWidthBold,
        alignSelf: 'stretch',
        backgroundColor: token.colorPrimary,
        borderRadius: token.borderRadiusXS,
      },
      left: {},
      content: {
        flex: 1,
      },
      title: {
      },
      titleDisabled: {
      },
      description: {
        marginTop: token.marginXXS,
      },
      descriptionDisabled: {
      },
      right: {},
      divider: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        left: divider === 'full' ? 0 : horizontalPadding + slotGap,
        height: token.lineWidth,
        backgroundColor: token.colorSplit,
      },
    };
  },
);

export function isChildrenEmpty(children: ReactNode): boolean {
  return React.Children.toArray(children).length === 0;
}

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? DEFAULT_SIZE;
}

function resolveDivider(divider?: ListDivider): ListDivider {
  return divider ?? DEFAULT_DIVIDER;
}

function renderTextNode(
  node: ReactNode,
  style: StyleProp<TextStyle>,
  isDisabled: boolean,
  variant: 'title' | 'description',
) {
  if (node === undefined || node === null || node === false) {
    return null;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return (
      <Text
        color={isDisabled ? 'disabled' : variant === 'title' ? 'heading' : 'description'}
        size={variant === 'title' ? 'md' : 'sm'}
        style={style}
      >
        {node}
      </Text>
    );
  }

  return node;
}

export function ListItem({
  children,
  description,
  descriptionText,
  disabled,
  divider,
  left,
  onPress,
  right,
  selected,
  size,
  style,
  styles,
  title,
  titleText,
}: ListItemProps) {
  const listContext = useListContext();
  const resolvedSize = size ?? listContext.size;
  const resolvedDivider = divider ?? listContext.divider;
  const { token } = useTheme();
  const tokenStyles = useListItemStyles({
    divider: resolvedDivider,
    size: resolvedSize,
  });
  const slotGap = getSlotGap(resolvedSize, token);
  const isDisabled = Boolean(disabled);
  const isSelected = Boolean(selected);
  const isInteractive = Boolean(onPress) && !isDisabled;
  const handlePress = (event: GestureResponderEvent): void => {
    if (isDisabled) {
      return;
    }

    onPress?.(event);
  };
  const content = isChildrenEmpty(children) ? (
    <>
      {renderTextNode(title ?? titleText, [
          tokenStyles.title,
          styles?.titleText,
          isDisabled ? tokenStyles.titleDisabled : null,
        ], isDisabled, 'title')}
      {renderTextNode(description ?? descriptionText, [
          tokenStyles.description,
          styles?.descriptionText,
          isDisabled ? tokenStyles.descriptionDisabled : null,
        ], isDisabled, 'description')}
    </>
  ) : children;
  const itemContent = (
    <>
      <Row align="center" gap={slotGap}>
        {isSelected ? (
          <Column style={tokenStyles.selectedMarker} testID="selected-marker" />
        ) : null}
        {left ? <Column style={[tokenStyles.left, styles?.left]}>{renderSlotTextNode(left, (text) => <Text>{text}</Text>)}</Column> : null}
        <Column style={[tokenStyles.content, styles?.content]}>{content}</Column>
        {right ? <Column style={[tokenStyles.right, styles?.right]}>{renderSlotTextNode(right, (text) => <Text>{text}</Text>)}</Column> : null}
      </Row>
      {resolvedDivider === 'none' ? null : (
        <Column style={[tokenStyles.divider, styles?.divider]} />
      )}
    </>
  );
  const itemStyle = [
    tokenStyles.item,
    isSelected ? tokenStyles.itemSelected : null,
    isDisabled ? tokenStyles.itemDisabled : null,
    style,
  ];

  if (isInteractive) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          tokenStyles.item,
          pressed ? tokenStyles.itemPressed : null,
          isSelected ? tokenStyles.itemSelected : null,
          style,
        ]}
      >
        {itemContent}
      </Pressable>
    );
  }

  return (
    <Column style={itemStyle}>
      {itemContent}
    </Column>
  );
}

export function ListRoot({
  children,
  divider,
  empty,
  footer,
  header,
  items,
  loading,
  loadingContent,
  loadingText,
  renderItem,
  size,
  style,
  styles,
}: ListProps) {
  const tokenStyles = useListStyles();
  const itemNodes = items?.map((item, index) => (
    <React.Fragment key={index}>
      {renderItem?.(item, index) ?? <ListItem {...item} />}
    </React.Fragment>
  ));
  const content = itemNodes === undefined ? children : itemNodes;
  const shouldRenderEmpty = isChildrenEmpty(content) && Boolean(empty);
  const contextValue = {
    divider: resolveDivider(divider),
    size: resolveSize(size),
  };

  return (
    <ListContext.Provider value={contextValue}>
      <Column style={[tokenStyles.root, style]}>
        {header ? (
          <Column style={[tokenStyles.header, styles?.header]}>
            {renderSlotTextNode(header, (text) => (
              <Text color="secondary">{text}</Text>
            ))}
          </Column>
        ) : null}
        {isChildrenEmpty(content) ? null : content}
        {loading ? (
          <Column style={[tokenStyles.loading, styles?.loading]}>
            {renderSlotTextNode(loadingContent ?? loadingText, (text) => (
              <Text color="secondary">{text}</Text>
            ))}
          </Column>
        ) : null}
        {shouldRenderEmpty ? (
          <Column style={[tokenStyles.empty, styles?.empty]}>
            {renderSlotTextNode(empty, (text) => (
              <Text color="secondary">{text}</Text>
            ))}
          </Column>
        ) : null}
        {footer ? (
          <Column style={[tokenStyles.footer, styles?.footer]}>
            {renderSlotTextNode(footer, (text) => (
              <Text color="secondary">{text}</Text>
            ))}
          </Column>
        ) : null}
      </Column>
    </ListContext.Provider>
  );
}

export function useListContext(): ListContextValue {
  return useContext(ListContext);
}

export const List = ListRoot;
