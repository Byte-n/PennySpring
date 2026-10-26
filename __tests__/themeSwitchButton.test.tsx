import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemeSwitchButton } from '../src/screens/home/ThemeSwitchButton';

const mockSetThemeMode = jest.fn();
const mockSetThemePreset = jest.fn();
let mockThemeMode: 'default' | 'dark' = 'default';

jest.mock('../src/contexts/ThemeModeContext', () => {
  const actual = jest.requireActual('../src/contexts/ThemeModeContext');

  return {
    ...actual,
    useThemeMode: () => ({
      themeMode: mockThemeMode,
      setThemeMode: mockSetThemeMode,
      themePreset: 'default',
      setThemePreset: mockSetThemePreset,
      themeToken: undefined,
    }),
  };
});

function renderButton() {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<ThemeSwitchButton />);
  });
  return testRenderer!;
}

describe('ThemeSwitchButton', () => {
  beforeEach(() => {
    mockThemeMode = 'default';
    mockSetThemeMode.mockClear();
    mockSetThemePreset.mockClear();
  });

  it('toggles the theme mode on press without opening the preset panel', () => {
    const testRenderer = renderButton();

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'theme-switch-button' })
        .props.onPress();
    });

    expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
    expect(
      testRenderer.root.findAllByProps({ testID: 'theme-preset-option-april' }),
    ).toHaveLength(0);
  });

  it('opens the preset panel on long press', () => {
    const testRenderer = renderButton();

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'theme-switch-button' })
        .props.onLongPress();
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'theme-preset-option-april' })
        .length,
    ).toBeGreaterThan(0);
  });

  it('selects a preset and closes the panel', () => {
    const testRenderer = renderButton();

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'theme-switch-button' })
        .props.onLongPress();
    });
    act(() => {
      testRenderer.root
        .findAllByProps({ testID: 'theme-preset-option-april' })[0]
        .props.onPress();
    });

    expect(mockSetThemePreset).toHaveBeenCalledWith('april');
    expect(
      testRenderer.root.findAllByProps({ testID: 'theme-preset-option-april' }),
    ).toHaveLength(0);
  });
});
