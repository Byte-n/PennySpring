import { Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import { Pressable, View } from 'react-native';
import {
  CaretDownIcon,
  CaretRightIcon,
  ListIcon,
} from 'phosphor-react-native';

import { APP_NAME } from '../../constants/app.ts';
import { useBookStore } from '../../stores/bookStore';

interface HomeHeaderLeftProps {
  onMenuPress: () => void;
}

const useStyles = createUseSheetStyle(token => ({
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
  bookName: {
    flexShrink: 1,
    lineHeight: token.lineHeightSM,
  },
}));

export function HomeHeaderLeft({ onMenuPress }: HomeHeaderLeftProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const currentBook = useBookStore(state => state.currentBook);
  const bookName = currentBook?.name || '未选择账本';
  const CaretIcon = currentBook?.name ? CaretDownIcon : CaretRightIcon;

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
          onPress={onMenuPress}
          style={({ pressed }) => [
            styles.bookButton,
            pressed ? styles.buttonPressed : undefined,
          ]}
          testID="home-header-book"
        >
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
    </Row>
  );
}
