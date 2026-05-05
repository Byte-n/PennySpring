import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { RootStackNavigator } from './RootStackNavigator';

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
}
