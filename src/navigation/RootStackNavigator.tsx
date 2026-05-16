import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentPreviewScreen } from '@pennyspring/component-preview';

import { AddRecordScreen } from '../screens/addRecord/AddRecordScreen';
import { AssetEditScreen } from '../screens/assetManage/AssetEditScreen';
import { AssetManageScreen } from '../screens/assetManage/AssetManageScreen';
import { BookManageScreen } from '../screens/bookManage/BookManageScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TestScreen } from '../screens/test';
import { TagManageScreen } from '../screens/tagManage/TagManageScreen';
import { TypeManageScreen } from '../screens/typeManage/TypeManageScreen';
import { TypeChildrenScreen } from '../screens/typeManage/TypeChildrenScreen';
import { ROOT_ROUTES } from './routes';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={HomeScreen}
        name={ROOT_ROUTES.Home}
        options={{ title: 'PennySpring' }}
      />
      <Stack.Screen
        component={AddRecordScreen}
        name={ROOT_ROUTES.AddRecord}
        options={{
          title: '新增记录',
        }}
      />
      <Stack.Screen
        component={TestScreen}
        name={ROOT_ROUTES.Test}
        options={{ title: 'Test Screen' }}
      />
      <Stack.Screen
        component={ComponentPreviewScreen}
        name={ROOT_ROUTES.ComponentPreview}
        options={{ headerShown: false }}
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
        component={TypeChildrenScreen}
        name={ROOT_ROUTES.TypeChildren}
        options={({ route }) => ({ title: route.params.parentName })}
      />
      <Stack.Screen
        component={AssetManageScreen}
        name={ROOT_ROUTES.AssetManage}
        options={{ title: '资产管理' }}
      />
      <Stack.Screen
        component={AssetEditScreen}
        name={ROOT_ROUTES.AssetEdit}
        options={({ route }) => ({ title: route.params?.assetId ? '编辑资产' : '新增资产' })}
      />
    </Stack.Navigator>
  );
}
