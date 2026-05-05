import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { RootStackNavigator } from './RootStackNavigator';
import { rootNavigationRef } from './rootNavigationRef';

export function AppNavigator() {
  return (
    <NavigationContainer ref={rootNavigationRef}>
      <RootStackNavigator />
    </NavigationContainer>
  );
}
