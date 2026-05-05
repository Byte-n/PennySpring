import React from 'react';
import { Animated } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { TextPreview } from '../src/Text';

describe('TextPreview', () => {
  it('keeps scroll padding on the content container', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <TextPreview />
        </ThemeProvider>
      );
    });

    const scrollView = testRenderer!.root.findByType(Animated.ScrollView);

    expect(scrollView.props.style?.padding).toBeUndefined();
    expect(scrollView.props.contentContainerStyle).toHaveProperty('padding');
  });
});
