import React from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Column,
  Icon,
  Loading,
  Popup,
  Row,
  Text,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import { CaretDownIcon, CaretRightIcon, ListIcon } from 'phosphor-react-native';

import { APP_NAME } from '../../constants/app.ts';
import { type CurrentBookRef, useBookStore } from '../../stores/bookStore';
import { getBookFooterStorage } from './drawerContentModel';
import { type QuickBookItem, useQuickBookList } from './useQuickBookList';

interface HomeHeaderLeftProps {
  onMenuPress: () => void;
}

interface HeaderStyleOptions {
  topInset: number;
  quickListMaxHeight: number;
}

const QUICK_SWITCH_LIST_MAX_HEIGHT_RATIO = 0.45;

const useStyles = createUseSheetStyle<HeaderStyleOptions>(
  (token, { topInset, quickListMaxHeight }) => ({
    root: {
      flex: 1,
      minWidth: 0,
    },
    menuButton: {
      alignItems: 'center',
      borderRadius: token.borderRadius,
      height: token.controlHeight,
      justifyContent: 'center',
      width: token.controlHeight,
    },
    buttonPressed: {
      backgroundColor: token.colorFillTertiary,
    },
    titleGroup: {
      alignItems: 'center',
      flexDirection: 'row',
      flexShrink: 1,
      minWidth: 0,
    },
    brandText: {
      lineHeight: token.lineHeightSM,
    },
    separator: {
      backgroundColor: token.colorBorder,
      borderRadius: token.borderRadiusXS,
      height: token.sizeSM,
      width: token.lineWidth,
    },
    bookButton: {
      alignItems: 'center',
      borderRadius: token.borderRadius,
      flexDirection: 'row',
      flexShrink: 1,
      gap: token.paddingXXS,
      height: token.controlHeight,
      minWidth: 0,
      paddingHorizontal: token.paddingXXS,
    },
    bookType: {
      flexShrink: 0,
      lineHeight: token.lineHeightSM,
    },
    bookSeparator: {
      flexShrink: 0,
      lineHeight: token.lineHeightSM,
    },
    bookName: {
      flexShrink: 1,
      lineHeight: token.lineHeightSM,
    },
    quickSheet: {
      paddingTop: Math.max(topInset, token.paddingSM),
    },
    quickPanel: {
      gap: token.marginSM,
    },
    quickList: {
      maxHeight: quickListMaxHeight,
    },
    quickListContent: {
      gap: token.marginXXS,
    },
    quickState: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: token.controlHeight,
      paddingVertical: token.paddingXS,
    },
    option: {
      alignItems: 'center',
      borderRadius: token.borderRadius,
      flexDirection: 'row',
      gap: token.marginSM,
      minHeight: token.controlHeight,
      paddingHorizontal: token.paddingXS,
    },
    optionPressed: {
      backgroundColor: token.colorFillTertiary,
    },
    optionSelected: {
      backgroundColor: token.colorPrimaryBg,
    },
    optionMain: {
      flex: 1,
      minWidth: 0,
    },
    optionType: {
      flexShrink: 0,
    },
    optionName: {
      flexShrink: 1,
    },
  }),
);

function getBookRefKey(ref: CurrentBookRef): string {
  return ref.kind === 'local'
    ? `local-${ref.id}`
    : `remote-${ref.serverUrl}-${ref.bookId}`;
}

function isSameBook(
  current: CurrentBookRef | null,
  target: CurrentBookRef,
): boolean {
  return current !== null && getBookRefKey(current) === getBookRefKey(target);
}

export function HomeHeaderLeft({ onMenuPress }: HomeHeaderLeftProps) {
  const insets = useSafeAreaInsets();
  const { height: viewportHeight } = useWindowDimensions();
  const styles = useStyles({
    topInset: insets.top,
    quickListMaxHeight: Math.round(
      viewportHeight * QUICK_SWITCH_LIST_MAX_HEIGHT_RATIO,
    ),
  });
  const { token } = useTheme();
  const toast = useToast();
  const currentBook = useBookStore(state => state.currentBook);
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const setCurrentBook = useBookStore(state => state.setCurrentBook);
  const { error, items, loading, refresh } = useQuickBookList();
  const [isQuickSwitchOpen, setIsQuickSwitchOpen] = React.useState(false);

  const bookName = currentBook?.name || '未选择账本';
  const bookType = currentBook ? getBookFooterStorage(currentBook) : null;
  const CaretIcon = currentBook ? CaretDownIcon : CaretRightIcon;

  const handleBookPress = React.useCallback((): void => {
    const nextOpen = !isQuickSwitchOpen;
    setIsQuickSwitchOpen(nextOpen);

    if (nextOpen) {
      refresh();
    }
  }, [isQuickSwitchOpen, refresh]);

  const handleBookSelect = React.useCallback(
    (item: QuickBookItem): void => {
      setIsQuickSwitchOpen(false);

      if (isSameBook(currentBookRef, item.ref)) {
        return;
      }

      setCurrentBook(item.ref, item.entry);
      toast.show({ messageText: `已切换到${item.entry.name}` });
    },
    [currentBookRef, setCurrentBook, toast],
  );

  const renderQuickSwitchBody = (): React.ReactNode => {
    if (loading) {
      return (
        <Row
          justify="center"
          style={styles.quickState}
          testID="home-book-switch-loading"
        >
          <Loading size="small" />
        </Row>
      );
    }

    if (error) {
      return (
        <Pressable
          onPress={() => refresh()}
          style={styles.quickState}
          testID="home-book-switch-retry"
        >
          <Text color="errorText" size="xs">
            账本列表加载失败，点击重试
          </Text>
        </Pressable>
      );
    }

    if (items.length === 0) {
      return (
        <Row
          justify="center"
          style={styles.quickState}
          testID="home-book-switch-empty"
        >
          <Text color="tertiary" size="xs">
            还没有账本
          </Text>
        </Row>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.quickListContent}
        showsVerticalScrollIndicator={false}
        style={styles.quickList}
      >
        {items.map(item => {
          const isSelected = isSameBook(currentBookRef, item.ref);
          const itemKey = getBookRefKey(item.ref);

          return (
            <Pressable
              key={itemKey}
              onPress={() => handleBookSelect(item)}
              style={({ pressed }) => [
                styles.option,
                isSelected ? styles.optionSelected : undefined,
                pressed ? styles.optionPressed : undefined,
              ]}
              testID={`home-book-switch-option-${itemKey}`}
            >
              <Row align="center" gap="small" style={styles.optionMain}>
                <Text
                  color="quaternary"
                  size="xs"
                  style={styles.optionType}
                  testID={`home-book-switch-type-${itemKey}`}
                >
                  {getBookFooterStorage(item.entry)}
                </Text>
                <Text
                  numberOfLines={1}
                  size="sm"
                  style={styles.optionName}
                  weight={isSelected ? 'strong' : 'regular'}
                >
                  {item.entry.name}
                </Text>
              </Row>
              {isSelected ? (
                <Icon
                  color="primary"
                  icon="check"
                  size="small"
                  testID={`home-book-switch-check-${itemKey}`}
                />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <Row align="center" gap="small" style={styles.root}>
      <Pressable
        onPress={onMenuPress}
        style={({ pressed }) => [
          styles.menuButton,
          pressed ? styles.buttonPressed : undefined,
        ]}
        testID="home-header-menu"
      >
        <ListIcon color={token.colorText} size={token.fontSizeXL} />
      </Pressable>

      <Row align="center" gap="small" style={styles.titleGroup}>
        <Text
          numberOfLines={1}
          size="md"
          style={styles.brandText}
          testID="home-header-brand"
          weight="strong"
        >
          {APP_NAME}
        </Text>
        <View style={styles.separator} />
        <Pressable
          onPress={handleBookPress}
          style={({ pressed }) => [
            styles.bookButton,
            pressed ? styles.buttonPressed : undefined,
          ]}
          testID="home-header-book"
        >
          {bookType ? (
            <>
              <Text
                color="quaternary"
                numberOfLines={1}
                size="xs"
                style={styles.bookType}
                testID="home-header-book-type"
              >
                {bookType}
              </Text>
              <Text color="quaternary" size="xs" style={styles.bookSeparator}>
                ·
              </Text>
            </>
          ) : null}
          <Text
            color="tertiary"
            numberOfLines={1}
            size="sm"
            style={styles.bookName}
            testID="home-header-book-name"
          >
            {bookName}
          </Text>
          <CaretIcon color={token.colorTextTertiary} size={token.sizeSM} />
        </Pressable>
      </Row>

      <Popup
        onOpenChange={setIsQuickSwitchOpen}
        open={isQuickSwitchOpen}
        position="top"
        styles={{ body: styles.quickSheet }}
      >
        <Column style={styles.quickPanel}>
          <Text color="tertiary" size="xs" weight="medium">
            切换账本
          </Text>
          {renderQuickSwitchBody()}
        </Column>
      </Popup>
    </Row>
  );
}
