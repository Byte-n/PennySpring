import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { presets } from '@pennyspring/theme';
import {
  ThemeModeProvider,
  useThemeMode,
} from '../src/contexts/ThemeModeContext';

function createProbe() {
  let current: ReturnType<typeof useThemeMode> | undefined;

  function Probe() {
    current = useThemeMode();
    return null;
  }

  act(() => {
    renderer.create(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
  });

  return () => current;
}

describe('ThemeModeContext', () => {
  it('toggles the theme mode', () => {
    const getContext = createProbe();
    expect(getContext()?.themeMode).toBe('default');

    act(() => {
      getContext()?.setThemeMode('dark');
    });

    expect(getContext()?.themeMode).toBe('dark');
  });

  it('maps the selected preset to its seed token', () => {
    const getContext = createProbe();
    expect(getContext()?.themePreset).toBe('default');
    expect(getContext()?.themeToken).toBeUndefined();

    act(() => {
      getContext()?.setThemePreset('kaori');
    });

    expect(getContext()?.themePreset).toBe('kaori');
    expect(getContext()?.themeToken).toBe(presets.kaori);
  });
});
