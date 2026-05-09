import React from 'react';
import { Pressable, View } from 'react-native';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { getHeaderTitle } from '@react-navigation/elements';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { App, Text } from '@pennyspring/component';
import {
  createUseSheetStyle,
  ThemeProvider,
  presets,
  useTheme,
} from '@pennyspring/theme';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { ComponentPreviewDetailScreen } from './ComponentPreviewDetailScreen';
import { ComponentPreviewListScreen } from './ComponentPreviewListScreen';
import {
  ComponentPreviewThemeControls,
  type ComponentPreviewThemePreset,
} from './ComponentPreviewThemeControls';
import { COMPONENT_PREVIEW_ROUTES } from '../navigation/routes';
import { getComponentPreviewById } from '../previews/registry';
import type { TextStyle } from 'react-native';
import type { ThemeAlgorithm, ThemeConfig } from '@pennyspring/theme';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import type { ComponentPreviewStackParamList } from '../navigation/types';

const Stack = createNativeStackNavigator<ComponentPreviewStackParamList>();
const HEADER_SIDE_WIDTH_MULTIPLIER = 2;

const THEME_PRESETS: ComponentPreviewThemePreset[] = [
  {
    name: 'april',
    label: 'April',
  },
  {
    name: 'kaori',
    label: 'Kaori',
  },
  {
    name: 'penny',
    label: 'Penny',
  },
  {
    name: 'spring',
    label: 'Spring',
  },
];

function getNextPreset(currentPreset: ComponentPreviewThemePreset) {
  const currentIndex = THEME_PRESETS.findIndex(
    preset => preset.name === currentPreset.name,
  );
  const nextIndex =
    currentIndex === THEME_PRESETS.length - 1 ? 0 : currentIndex + 1;

  return THEME_PRESETS[nextIndex];
}

const useHeaderStyles = createUseSheetStyle(token => ({
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: token.controlHeightSM,
    minWidth: token.controlHeightSM,
  },
  header: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorSplit,
    borderBottomWidth: token.lineWidth,
    flexDirection: 'row',
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.paddingMD,
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
  },
  side: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: token.controlHeightSM,
    width: token.controlHeightLG * HEADER_SIDE_WIDTH_MULTIPLIER,
  },
  title: {
    color: token.colorTextHeading,
    flex: 1,
    fontFamily: token.fontFamily,
    fontSize: token.fontSizeLG,
    fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
    lineHeight: token.lineHeightLG,
    textAlign: 'center',
  },
}));

interface ComponentPreviewHeaderProps extends NativeStackHeaderProps {
  right: React.ReactNode;
}

function ComponentPreviewHeader({
  back,
  navigation,
  options,
  right,
  route,
}: ComponentPreviewHeaderProps) {
  const styles = useHeaderStyles();
  const { token } = useTheme();
  const title = getHeaderTitle(options, route.name);

  return (
    <View style={styles.header}>
      <View style={[styles.side, styles.left]}>
        {back ? (
          <Pressable
            accessibilityLabel="返回"
            accessibilityRole="button"
            onPress={navigation.goBack}
            style={styles.backButton}
          >
            <ArrowLeftIcon
              color={token.colorIconHover}
              size={token.fontSizeHeading3}
              weight="bold"
            />
          </Pressable>
        ) : null}
      </View>
      <Text size="lg" weight="strong" style={styles.title}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

interface ComponentPreviewNavigatorProps {
  algorithm: ThemeAlgorithm;
  preset: ComponentPreviewThemePreset;
  onNextPreset: () => void;
  onToggleAlgorithm: () => void;
}

function ComponentPreviewNavigator({
  algorithm,
  onNextPreset,
  onToggleAlgorithm,
  preset,
}: ComponentPreviewNavigatorProps) {
  const { token } = useTheme();
  const navigationTheme = React.useMemo(
    () => ({
      dark: algorithm === 'dark',
      colors: {
        primary: token.colorPrimary,
        background: token.colorBgLayout,
        card: token.colorBgContainer,
        text: token.colorText,
        border: token.colorSplit,
        notification: token.colorError,
      },
      fonts: {
        regular: {
          fontFamily: token.fontFamily,
          fontWeight: '400' as const,
        },
        medium: {
          fontFamily: token.fontFamily,
          fontWeight: String(token.fontWeightStrong) as '600',
        },
        bold: {
          fontFamily: token.fontFamily,
          fontWeight: String(token.fontWeightStrong) as '600',
        },
        heavy: {
          fontFamily: token.fontFamily,
          fontWeight: String(token.fontWeightStrong) as '600',
        },
      },
    }),
    [algorithm, token],
  );
  const renderThemeControls = React.useCallback(
    () => (
      <ComponentPreviewThemeControls
        algorithm={algorithm}
        onNextPreset={onNextPreset}
        onToggleAlgorithm={onToggleAlgorithm}
        preset={preset}
      />
    ),
    [algorithm, onNextPreset, onToggleAlgorithm, preset],
  );

  return (
    <NavigationIndependentTree>
      <NavigationContainer theme={navigationTheme}>
        <App>
          <Stack.Navigator
            screenOptions={{
              header: props => (
                <ComponentPreviewHeader
                  {...props}
                  right={renderThemeControls()}
                />
              ),
            }}
          >
            <Stack.Screen
              component={ComponentPreviewListScreen}
              name={COMPONENT_PREVIEW_ROUTES.ComponentList}
              options={{ title: '组件预览' }}
            />
            <Stack.Screen
              component={ComponentPreviewDetailScreen}
              name={COMPONENT_PREVIEW_ROUTES.ComponentDetail}
              options={({ route }) => ({
                title:
                  getComponentPreviewById(route.params.previewId)?.title ??
                  '组件预览',
              })}
            />
          </Stack.Navigator>
        </App>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

export function ComponentPreviewScreen() {
  const [algorithm, setAlgorithm] = React.useState<ThemeAlgorithm>('default');
  const [preset, setPreset] = React.useState(THEME_PRESETS[0]);
  const themeConfig = React.useMemo<ThemeConfig>(
    () => ({
      algorithm,
      token: presets[preset.name],
    }),
    [algorithm, preset.name],
  );
  const toggleAlgorithm = React.useCallback(() => {
    setAlgorithm(currentAlgorithm =>
      currentAlgorithm === 'dark' ? 'default' : 'dark',
    );
  }, []);
  const selectNextPreset = React.useCallback(() => {
    setPreset(currentPreset => getNextPreset(currentPreset));
  }, []);

  return (
    <ThemeProvider config={themeConfig}>
      <ComponentPreviewNavigator
        algorithm={algorithm}
        onNextPreset={selectNextPreset}
        onToggleAlgorithm={toggleAlgorithm}
        preset={preset}
      />
    </ThemeProvider>
  );
}
