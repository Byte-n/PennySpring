import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentPreviewScreen } from '@pennyspring/ui/examples';

import { AddRecordScreen } from '../screens/addRecord/AddRecordScreen';
import { AssetManageScreen } from '../screens/assetManage/AssetManageScreen';
import { BookManageScreen } from '../screens/bookManage/BookManageScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TestScreen } from '../screens/test';
import { TagManageScreen } from '../screens/tagManage/TagManageScreen';
import { TypeManageScreen } from '../screens/typeManage/TypeManageScreen';
import { ROOT_ROUTES } from './routes';
import type { RootStackParamList } from './types';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        component={ComponentPreviewScreenWrap}
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
        component={AssetManageScreen}
        name={ROOT_ROUTES.AssetManage}
        options={{ title: '资产管理' }}
      />
    </Stack.Navigator>
  );
}

function ComponentPreviewScreenWrap() {
  return (
    <>
      <SafeAreaView />
      <ComponentPreviewScreen />
    </>
  );
}
