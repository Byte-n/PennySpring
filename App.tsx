import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';
import { HomeScreen } from './src/screens/HomeScreen';

type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const useStyles = createUseSheetStyle((token) => ({
  safeArea: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
  },
}));

function AppContent() {
  const styles = useStyles();

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={[styles.safeArea]}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            component={HomeScreen}
            name="Home"
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ThemeProvider config={{ algorithm: isDarkMode ? 'dark' : 'default' }}>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
