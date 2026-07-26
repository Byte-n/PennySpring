import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookSelectScreen } from '../screens/bookSelect';
import { BOOK_SELECT_ROUTES } from './routes';
import type { BookSelectStackParamList } from './types';

const Stack = createNativeStackNavigator<BookSelectStackParamList>();

export function BookSelectNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        component={BookSelectScreen}
        name={BOOK_SELECT_ROUTES.BookSelect}
      />
    </Stack.Navigator>
  );
}
