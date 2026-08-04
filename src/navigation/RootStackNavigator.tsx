import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@pennyspring/theme';
import { Button } from '@pennyspring/ui';
import { Moon, Sun } from 'phosphor-react-native';

import { AddRecordScreen } from '../screens/addRecord/AddRecordScreen';
import { AssetManageScreen } from '../screens/assetManage/AssetManageScreen';
import { BookManageScreen } from '../screens/bookManage/BookManageScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { IconPreviewScreen } from '../screens/iconPreview';
import { QuickTemplateManageScreen } from '../screens/quickTemplate/QuickTemplateManageScreen';
import { TestScreen } from '../screens/test';
import { TagManageScreen } from '../screens/tagManage/TagManageScreen';
import { TypeManageScreen } from '../screens/typeManage/TypeManageScreen';
import { ROOT_ROUTES } from './routes';
import type { RootStackParamList } from './types';
import { ThemePreview } from '@pennyspring/theme';
import { useThemeMode } from '../contexts/ThemeModeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function ThemeSwitchButton() {
  const { themeMode, setThemeMode } = useThemeMode();
  const { token } = useTheme();
  const isDark = themeMode === 'dark';

  const handleToggle = React.useCallback(() => {
    setThemeMode(isDark ? 'default' : 'dark');
  }, [isDark, setThemeMode]);

  return (
    <Button
      icon={isDark ? Sun : Moon}
      iconProps={{ weight: 'bold' }}
      onPress={handleToggle}
      shape="circle"
      type="text"
      style={{ width: token.controlHeight, marginRight: token.marginXS }}
    />
  );
}

export function RootStackNavigator() {
  const { token } = useTheme();

  const headerRight = React.useCallback(() => <ThemeSwitchButton />, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: token.colorBgContainer,
        },
        headerTintColor: token.colorText,
        headerTitleStyle: {
          fontSize: token.fontSizeLG,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        component={HomeScreen}
        name={ROOT_ROUTES.Home}
        options={{ title: 'PennySpring', headerRight }}
      />
      <Stack.Screen
        component={AddRecordScreen}
        name={ROOT_ROUTES.AddRecord}
        options={({ route }) => ({
          title: route.params?.recordId !== undefined ? '编辑记录' : '新增记录',
        })}
      />
      <Stack.Screen
        component={ThemePreview}
        name={ROOT_ROUTES.ThemePreview}
        options={{ title: '主题预览' }}
      />
      <Stack.Screen
        component={TestScreen}
        name={ROOT_ROUTES.Test}
        options={{ title: 'Test Screen' }}
      />
      <Stack.Screen
        component={BookManageScreen}
        name={ROOT_ROUTES.BookManage}
        options={{ title: '账本管理' }}
      />
      <Stack.Screen
        component={TagManageScreen}
        name={ROOT_ROUTES.TagManage}
        options={{ title: '标签管理' }}
      />
      <Stack.Screen
        component={TypeManageScreen}
        name={ROOT_ROUTES.TypeManage}
        options={{ title: '类型管理' }}
      />
      <Stack.Screen
        component={AssetManageScreen}
        name={ROOT_ROUTES.AssetManage}
        options={{ title: '资产管理' }}
      />
      <Stack.Screen
        component={QuickTemplateManageScreen}
        name={ROOT_ROUTES.QuickTemplateManage}
        options={{ title: '快捷模板管理' }}
      />
      <Stack.Screen
        component={IconPreviewScreen}
        name={ROOT_ROUTES.IconPreview}
        options={{ title: '图标预览' }}
      />
    </Stack.Navigator>
  );
}

