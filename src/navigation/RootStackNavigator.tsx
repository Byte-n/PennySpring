import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentPreviewScreen } from '@pennyspring/component-preview';

import { AddRecordScreen } from '../screens/addRecord/AddRecordScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TestScreen } from '../screens/test';
import { ROOT_ROUTES } from './routes';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function PlaceholderScreen() {
  return <View />;
}

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
        component={PlaceholderScreen}
        name={ROOT_ROUTES.BookManage}
        options={{ title: '账本管理' }}
      />
      <Stack.Screen
        component={PlaceholderScreen}
        name={ROOT_ROUTES.TagManage}
        options={{ title: '标签管理' }}
      />
      <Stack.Screen
        component={PlaceholderScreen}
        name={ROOT_ROUTES.TypeManage}
        options={{ title: '类型管理' }}
      />
      <Stack.Screen
        component={PlaceholderScreen}
        name={ROOT_ROUTES.TypeChildren}
        options={{ title: '子类型' }}
      />
      <Stack.Screen
        component={PlaceholderScreen}
        name={ROOT_ROUTES.AssetManage}
        options={{ title: '资产管理' }}
      />
      <Stack.Screen
        component={PlaceholderScreen}
        name={ROOT_ROUTES.AssetEdit}
        options={{ title: '编辑资产' }}
      />
    </Stack.Navigator>
  );
}
