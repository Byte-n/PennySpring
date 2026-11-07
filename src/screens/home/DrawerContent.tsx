import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import {
  Avatar,
  Column,
  Divider,
  Row,
  Skeleton,
  Switch,
  Text,
} from '@pennyspring/ui';
import type { IconComponent } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArchiveIcon,
  CaretRightIcon,
  ChatsCircleIcon,
  FlaskIcon,
  InfoIcon,
  MoonIcon,
  NotebookIcon,
  PaletteIcon,
  RobotIcon,
  ShapesIcon,
  SquaresFourIcon,
  TagIcon,
  WalletIcon,
  WrenchIcon,
  XIcon,
} from 'phosphor-react-native';

import { APP_NAME, APP_VERSION } from '../../constants/app';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import { ROOT_ROUTES } from '../../navigation/routes';
import type { RootStackParamList } from '../../navigation/types';
import { resolveMediaSource } from '../../media';
import { useBookStore } from '../../stores/bookStore';
import { useServerToken } from '../../stores/networkBookStore';
import { DrawerNavRow } from './DrawerNavRow';
import {
  formatUpdatedTime,
  getBookFooterStorage,
  getBookStorageLabel,
} from './drawerContentModel';

interface DrawerNavItem {
  key: string;
  label: string;
  route: keyof RootStackParamList;
  icon: IconComponent;
  requiresBook?: boolean;
}

const MANAGEMENT_ITEMS: DrawerNavItem[] = [
  {
    icon: WalletIcon,
    key: 'asset',
    label: '资产管理',
    requiresBook: true,
    route: ROOT_ROUTES.AssetManage,
  },
  {
    icon: ShapesIcon,
    key: 'type',
    label: '类型管理',
    requiresBook: true,
    route: ROOT_ROUTES.TypeManage,
  },
  {
    icon: TagIcon,
    key: 'tag',
    label: '标签管理',
    requiresBook: true,
    route: ROOT_ROUTES.TagManage,
  },
];

const DATA_ITEMS: DrawerNavItem[] = [
  {
    icon: InfoIcon,
    key: 'about',
    label: '关于与更新',
    requiresBook: false,
    route: ROOT_ROUTES.About,
  },
  {
    icon: ArchiveIcon,
    key: 'backup',
    label: '备份与迁移',
    requiresBook: false,
    route: ROOT_ROUTES.Backup,
  },
];

const AI_ITEMS: DrawerNavItem[] = [
  {
    icon: NotebookIcon,
    key: 'aiBook',
    label: 'AI 记账',
    requiresBook: true,
    route: ROOT_ROUTES.QuickBookSettings,
  },
  {
    icon: ChatsCircleIcon,
    key: 'session',
    label: '会话管理',
    requiresBook: true,
    route: ROOT_ROUTES.SessionManage,
  },
  {
    icon: RobotIcon,
    key: 'provider',
    label: 'AI 提供商',
    requiresBook: false,
    route: ROOT_ROUTES.AgentSettings,
  },
];

const DEVELOPER_ITEMS: DrawerNavItem[] = [
  {
    icon: SquaresFourIcon,
    key: 'icon',
    label: '图标预览',
    route: ROOT_ROUTES.IconPreview,
  },
  {
    icon: PaletteIcon,
    key: 'theme',
    label: '主题预览',
    route: ROOT_ROUTES.ThemePreview,
  },
  { icon: FlaskIcon, key: 'test', label: '测试页', route: ROOT_ROUTES.Test },
];

export interface DrawerContentProps {
  onClose: () => void;
  onNavigate: (route: keyof RootStackParamList) => void;
}

const useStyles = createUseSheetStyle<number>((token, bottomInset) => ({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: token.paddingMD,
    paddingTop: token.paddingXXS,
  },
  brandRow: {
    height: token.controlHeight,
  },
  brandName: {
    flex: 1,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: token.borderRadiusSM,
    height: token.controlHeight,
    justifyContent: 'center',
    marginRight: -token.paddingXS,
    width: token.controlHeight,
  },
  bookCard: {
    alignItems: 'flex-start',
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    gap: token.marginSM,
    marginTop: token.paddingXS,
    padding: token.paddingSM,
  },
  bookCardPressed: {
    backgroundColor: token.colorFillContent,
  },
  cover: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
  },
  bookMain: {
    flex: 1,
    minWidth: 0,
  },
  bookName: {
    flex: 1,
    lineHeight: token.lineHeightSM,
  },
  bookDescription: {
    marginTop: token.paddingXXS / 2,
  },
  bookStorage: {
    marginTop: token.paddingXXS / 2,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    paddingBottom: token.paddingXXS,
    paddingHorizontal: token.paddingMD,
    paddingTop: token.paddingXXS,
  },
  groupLabel: {
    marginTop: token.paddingXXS,
    paddingHorizontal: token.paddingXXS,
  },
  spacer: {
    flex: 1,
  },
  developerSection: {
    paddingTop: token.paddingXXS,
  },
  developerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.paddingXS,
    height: token.controlHeight,
    paddingHorizontal: token.paddingXXS,
  },
  developerTitle: {
    flex: 1,
  },
  developerCaretOpen: {
    transform: [{ rotate: '90deg' }],
  },
  footer: {
    paddingBottom: Math.max(bottomInset, token.paddingXS),
  },
  footerContent: {
    paddingHorizontal: token.paddingMD,
    paddingTop: token.paddingXXS,
  },
  skeletonCard: {
    alignItems: 'flex-start',
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    gap: token.marginSM,
    marginTop: token.paddingXS,
    padding: token.paddingSM,
  },
  skeletonMain: {
    flex: 1,
  },
}));

export function DrawerContent({ onClose, onNavigate }: DrawerContentProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(insets.bottom);
  const { token } = useTheme();
  const { setThemeMode, themeMode } = useThemeMode();
  const currentBook = useBookStore(state => state.currentBook);
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const remoteServerUrl =
    currentBookRef?.kind === 'remote' ? currentBookRef.serverUrl : undefined;
  const remoteToken = useServerToken(remoteServerUrl);
  const backgroundSource = currentBook?.background
    ? resolveMediaSource(currentBook.background, remoteServerUrl, remoteToken)
    : undefined;
  const [isDeveloperOpen, setIsDeveloperOpen] = React.useState(false);
  const isDark = themeMode === 'dark';

  const handleNavigate = React.useCallback(
    (route: keyof RootStackParamList): void => {
      onClose();
      onNavigate(route);
    },
    [onClose, onNavigate],
  );

  const handleBookPress = React.useCallback((): void => {
    handleNavigate(ROOT_ROUTES.BookManage);
  }, [handleNavigate]);

  const handleThemeChange = React.useCallback(
    (value: boolean): void => {
      setThemeMode(value ? 'dark' : 'default');
    },
    [setThemeMode],
  );

  const handleDeveloperToggle = React.useCallback((): void => {
    setIsDeveloperOpen(previous => !previous);
  }, []);

  const footerStorage = currentBook
    ? `${getBookFooterStorage(currentBook)} · v${APP_VERSION}`
    : `v${APP_VERSION}`;
  const footerUpdated = currentBook
    ? `更新 ${formatUpdatedTime(currentBook.updatedTime)}`
    : '正在读取账本…';

  return (
    <Column style={styles.root}>
      <View style={styles.header}>
        <Row align="center" style={styles.brandRow}>
          <Text size="lg" style={styles.brandName} weight="strong">
            {APP_NAME}
          </Text>
          <Pressable
            accessibilityLabel="关闭抽屉"
            accessibilityRole="button"
            hitSlop={token.paddingXS}
            onPress={onClose}
            style={styles.closeButton}
            testID="drawer-close"
          >
            <XIcon color={token.colorTextTertiary} size={token.fontSizeLG} />
          </Pressable>
        </Row>

        {currentBook ? (
          <Pressable
            accessibilityHint="进入账本列表"
            accessibilityRole="button"
            onPress={handleBookPress}
            style={({ pressed }) => [
              styles.bookCard,
              pressed ? styles.bookCardPressed : undefined,
            ]}
            testID="drawer-book-card"
          >
            <Avatar
              shape="square"
              size="normal"
              src={backgroundSource}
              style={styles.cover}
              text={currentBook.name}
            />
            <Column style={styles.bookMain}>
              <Row align="center" gap={token.paddingXXS}>
                <Text
                  numberOfLines={1}
                  size="md"
                  style={styles.bookName}
                  weight="semibold"
                >
                  {currentBook.name}
                </Text>
                <CaretRightIcon
                  color={token.colorTextQuaternary}
                  size={token.fontSize}
                />
              </Row>
              {currentBook.description ? (
                <Text
                  color="secondary"
                  numberOfLines={1}
                  size="xs"
                  style={styles.bookDescription}
                >
                  {currentBook.description}
                </Text>
              ) : null}
              <Text
                color="tertiary"
                numberOfLines={1}
                size="xs"
                style={styles.bookStorage}
              >
                {getBookStorageLabel(currentBook, currentBookRef)}
              </Text>
            </Column>
          </Pressable>
        ) : (
          <View style={styles.skeletonCard} testID="drawer-book-skeleton">
            <Skeleton
              animated={false}
              borderRadius={token.borderRadius}
              height={token.controlHeight}
              shape="rect"
              width={token.controlHeight}
            />
            <Column style={styles.skeletonMain} gap={token.paddingXXS}>
              <Skeleton
                animated={false}
                borderRadius={token.borderRadiusSM}
                height={token.paddingXS}
                shape="line"
                width="58%"
              />
              <Skeleton
                animated={false}
                borderRadius={token.borderRadiusSM}
                height={token.paddingXS}
                shape="line"
                width="36%"
              />
            </Column>
          </View>
        )}
      </View>

      <ScrollView
        scrollEnabled
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        style={styles.body}
      >
        <Text
          color="tertiary"
          size="xs"
          style={styles.groupLabel}
          weight="medium"
        >
          管理
        </Text>
        <Column>
          {MANAGEMENT_ITEMS.map((item, index) => (
            <DrawerNavRow
              accessibilityLabel={item.label}
              disabled={item.requiresBook && !currentBook}
              icon={item.icon}
              key={item.key}
              label={item.label}
              onPress={() => handleNavigate(item.route)}
              showSeparator={index > 0}
              testID={`drawer-nav-${item.key}`}
            />
          ))}
        </Column>

        <Text
          color="tertiary"
          size="xs"
          style={styles.groupLabel}
          weight="medium"
        >
          AI
        </Text>
        <Column>
          {AI_ITEMS.map((item, index) => (
            <DrawerNavRow
              accessibilityLabel={item.label}
              disabled={item.requiresBook && !currentBook}
              icon={item.icon}
              key={item.key}
              label={item.label}
              onPress={() => handleNavigate(item.route)}
              showSeparator={index > 0}
              testID={`drawer-nav-${item.key}`}
            />
          ))}
        </Column>

        <Text
          color="tertiary"
          size="xs"
          style={styles.groupLabel}
          weight="medium"
        >
          数据
        </Text>
        <Column>
          {DATA_ITEMS.map(item => (
            <DrawerNavRow
              accessibilityLabel={item.label}
              icon={item.icon}
              key={item.key}
              label={item.label}
              onPress={() => handleNavigate(item.route)}
              testID={`drawer-nav-${item.key}`}
            />
          ))}
        </Column>

        <Text
          color="tertiary"
          size="xs"
          style={styles.groupLabel}
          weight="medium"
        >
          外观
        </Text>
        <DrawerNavRow
          icon={MoonIcon}
          label="深色模式"
          right={
            <Switch
              accessibilityLabel="深色模式"
              accessibilityRole="switch"
              accessibilityState={{ checked: isDark }}
              hitSlop={token.paddingSM}
              onChange={handleThemeChange}
              testID="drawer-theme-switch"
              value={isDark}
            />
          }
        />

        <View style={styles.spacer} />

        <View style={styles.developerSection}>
          <Divider spacing="none" />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isDeveloperOpen }}
            onPress={handleDeveloperToggle}
            style={styles.developerHeader}
            testID="drawer-dev-toggle"
          >
            <WrenchIcon color={token.colorTextTertiary} size={token.fontSize} />
            <Text
              color="tertiary"
              size="sm"
              style={styles.developerTitle}
              weight="medium"
            >
              开发者工具
            </Text>
            <CaretRightIcon
              color={token.colorTextQuaternary}
              size={token.fontSizeSM}
              style={isDeveloperOpen ? styles.developerCaretOpen : undefined}
            />
          </Pressable>
          {isDeveloperOpen ? (
            <Column>
              {DEVELOPER_ITEMS.map(item => (
                <DrawerNavRow
                  icon={item.icon}
                  key={item.key}
                  label={item.label}
                  onPress={() => handleNavigate(item.route)}
                  testID={`drawer-dev-${item.key}`}
                  variant="compact"
                />
              ))}
            </Column>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Divider spacing="none" />
        <Row align="center" justify="between" style={styles.footerContent}>
          <Text color="quaternary" numberOfLines={1} size="sm">
            {footerStorage}
          </Text>
          <Text color="quaternary" numberOfLines={1} size="sm">
            {footerUpdated}
          </Text>
        </Row>
      </View>
    </Column>
  );
}
