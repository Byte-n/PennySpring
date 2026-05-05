import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { RootStackNavigator } from '../src/navigation/RootStackNavigator';

const mockStackScreen = jest.fn();

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const ReactLocal = require('react');

    return {
      Navigator: ({ children }: any) =>
        ReactLocal.createElement('mock-native-stack', null, children),
      Screen: (props: any) => {
        mockStackScreen(props);
        return ReactLocal.createElement('mock-native-stack-screen');
      },
    };
  },
}));

jest.mock('../src/screens/home/HomeScreen', () => ({
  HomeScreen: () => null,
}));

jest.mock('../src/screens/test/TestScreen', () => ({
  TestScreen: () => null,
}));

describe('RootStackNavigator', () => {
  beforeEach(() => {
    mockStackScreen.mockClear();
  });

  it('registers Home and Test root routes', () => {
    act(() => {
      renderer.create(<RootStackNavigator />);
    });

    const registeredNames = mockStackScreen.mock.calls.map(
      ([props]) => props.name,
    );

    expect(registeredNames).toEqual(['Home', 'Test']);
  });
});
