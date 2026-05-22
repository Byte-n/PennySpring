import type { ComponentSize } from '../shares/types';
import React, { createContext, useContext } from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
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
    paddingVertical: token.paddingSM,
  },
  footer: {
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingSM,
  },
  empty: {
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingLG,
  },
  loading: {
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingSM,
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

function getItemPadding(size: ComponentSize, token: AliasToken) {
  if (size === 'small') {
    return token.paddingXS;
  }

  if (size === 'large') {
    return token.paddingMD;
  }

  return token.paddingSM;
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

const useListItemStyles = createUseSheetStyle(
  (token, { divider, size }: ListItemStyleOptions) => {
    const horizontalPadding = getItemHorizontalPadding(size, token);
    const verticalPadding = getItemPadding(size, token);
    const slotGap = size === 'small' ? token.marginXS : token.marginSM;

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
      row: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      selectedMarker: {
        width: token.lineWidthBold,
        alignSelf: 'stretch',
        marginRight: slotGap,
        backgroundColor: token.colorPrimary,
        borderRadius: token.borderRadiusXS,
      },
      left: {
        marginRight: slotGap,
      },
      content: {
        flex: 1,
      },
      title: {
        color: token.colorTextHeading,
      },
      titleDisabled: {
        color: token.colorTextDisabled,
      },
      description: {
        marginTop: token.marginXXS,
        color: token.colorTextDescription,
      },
      descriptionDisabled: {
        color: token.colorTextDisabled,
      },
      right: {
        marginLeft: slotGap,
      },
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
  const tokenStyles = useListItemStyles({
    divider: resolvedDivider,
    size: resolvedSize,
  });
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
      {title ?? renderTextNode(titleText, [
          tokenStyles.title,
          styles?.titleText,
          isDisabled ? tokenStyles.titleDisabled : null,
        ], isDisabled, 'title')}
      {description ?? renderTextNode(descriptionText, [
          tokenStyles.description,
          styles?.descriptionText,
          isDisabled ? tokenStyles.descriptionDisabled : null,
        ], isDisabled, 'description')}
    </>
  ) : children;
  const itemContent = (
    <>
      <View style={tokenStyles.row}>
        {isSelected ? (
          <View style={tokenStyles.selectedMarker} testID="selected-marker" />
        ) : null}
        {left ? <View style={[tokenStyles.left, styles?.left]}>{left}</View> : null}
        <View style={[tokenStyles.content, styles?.content]}>{content}</View>
        {right ? <View style={[tokenStyles.right, styles?.right]}>{right}</View> : null}
      </View>
      {resolvedDivider === 'none' ? null : (
        <View style={[tokenStyles.divider, styles?.divider]} />
      )}
    </>
  );
  const itemStyle = [
    tokenStyles.item,
    style,
    isSelected ? tokenStyles.itemSelected : null,
    isDisabled ? tokenStyles.itemDisabled : null,
  ];

  if (isInteractive) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          tokenStyles.item,
          style,
          pressed ? tokenStyles.itemPressed : null,
          isSelected ? tokenStyles.itemSelected : null,
        ]}
      >
        {itemContent}
      </Pressable>
    );
  }

  return (
    <View style={itemStyle}>
      {itemContent}
    </View>
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
      <View style={[tokenStyles.root, style]}>
        {header ? (
          <View style={[tokenStyles.header, styles?.header]}>{header}</View>
        ) : null}
        {isChildrenEmpty(content) ? null : content}
        {loading ? (
          <View style={[tokenStyles.loading, styles?.loading]}>
            {loadingContent ?? (loadingText === undefined ? null : (
              <Text color="secondary">{loadingText}</Text>
            ))}
          </View>
        ) : null}
        {shouldRenderEmpty ? (
          <View style={[tokenStyles.empty, styles?.empty]}>{empty}</View>
        ) : null}
        {footer ? (
          <View style={[tokenStyles.footer, styles?.footer]}>{footer}</View>
        ) : null}
      </View>
    </ListContext.Provider>
  );
}

export function useListContext(): ListContextValue {
  return useContext(ListContext);
}

export const List = ListRoot;
