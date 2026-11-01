import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Text } from '../src/Text';

function renderWithTheme(children: React.ReactElement) {
  let result: renderer.ReactTestRenderer;
  act(() => {
    result = renderer.create(<ThemeProvider>{children}</ThemeProvider>);
  });
  return result!;
}

describe('Text style module', () => {
  it('renders Text component correctly after style migration', () => {
    const testRenderer = renderWithTheme(
      <Text size="lg" weight="bold">
        Styled Text
      </Text>,
    );
    const textNode = testRenderer.root.findByType(Text);
    const rnText = textNode.findByType(
      'Text' as unknown as React.ComponentType,
    );
    expect(rnText.props.children).toBe('Styled Text');
    expect(rnText.props.style[0]).toHaveProperty('fontSize');
    expect(rnText.props.style[0]).toHaveProperty('fontWeight');
  });
});
