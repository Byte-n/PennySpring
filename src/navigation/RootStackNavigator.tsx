import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentPreviewScreen } from '@pennyspring/component-preview';

import { HomeScreen } from '../screens/home/HomeScreen';
import { TestScreen } from '../screens/test';
import { ROOT_ROUTES } from './routes';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={HomeScreen}
        name={ROOT_ROUTES.Home}
        options={{ headerShown: false }}
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
    </Stack.Navigator>
  );
}
