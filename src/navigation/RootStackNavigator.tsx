import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createUseSheetStyle,
  ThemePreview,
  useTheme,
} from '@pennyspring/theme';

import { AddRecordScreen } from '../screens/addRecord/AddRecordScreen';
import { AssetManageScreen } from '../screens/assetManage/AssetManageScreen';
import { BookManageScreen } from '../screens/bookManage/BookManageScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { IconPreviewScreen } from '../screens/iconPreview';
import { TestScreen } from '../screens/test';
import { TagManageScreen } from '../screens/tagManage/TagManageScreen';
import { TypeManageScreen } from '../screens/typeManage/TypeManageScreen';
import { ROOT_ROUTES } from './routes';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const useStyles = createUseSheetStyle(token => ({
  header: {
    backgroundColor: token.colorBgContainer,
  },
  headerTitle: {
    fontSize: token.fontSizeLG,
  },
}));

export function RootStackNavigator() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: token.colorText,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        component={HomeScreen}
        name={ROOT_ROUTES.Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={AddRecordScreen}
        name={ROOT_ROUTES.AddRecord}
        options={({ route }) => ({
          title: route.params?.template
            ? route.params?.templatePayload
              ? '编辑模板'
              : '新增模板'
            : route.params?.recordId !== undefined
              ? '编辑记录'
              : '新增记录',
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
        component={IconPreviewScreen}
        name={ROOT_ROUTES.IconPreview}
        options={{ title: '图标预览' }}
      />
    </Stack.Navigator>
  );
}
