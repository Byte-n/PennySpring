import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { RootStackNavigator } from '../src/navigation/RootStackNavigator';

const mockStackScreen = jest.fn();

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const ReactLocal = require('react');

    return {
      Navigator: ({ children }: { children: React.ReactNode }) =>
        ReactLocal.createElement('mock-native-stack', null, children),
      Screen: (props: Record<string, unknown>) => {
        mockStackScreen(props);
        return ReactLocal.createElement('mock-native-stack-screen');
      },
    };
  },
}));

jest.mock('../src/screens/home/HomeScreen', () => ({
  HomeScreen: () => null,
}));

describe('RootStackNavigator', () => {
  it('registers Home with hidden native header', () => {
    act(() => {
      renderer.create(<RootStackNavigator />);
    });

    const screenProps = mockStackScreen.mock.calls[0][0];

    expect(screenProps.name).toBe('Home');
    expect(screenProps.component).toBeDefined();
    expect(screenProps.options).toEqual({ headerShown: false });
  });
});
