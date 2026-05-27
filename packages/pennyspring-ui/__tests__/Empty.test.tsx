import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Column } from '../src/Column';
import { Empty } from '../src/Empty';
import { Icon } from '../src/Icon';
import { Text } from '../src/Text';

const GAP_TOKENS = {
  small: 11,
  normal: 13,
  large: 17,
} as const;

function renderEmpty(props: Partial<React.ComponentProps<typeof Empty>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider
        config={{
          token: {
            marginXXS: GAP_TOKENS.small,
            marginXS: GAP_TOKENS.normal,
            marginSM: GAP_TOKENS.large,
          },
        }}
      >
        <Empty {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function toTreeText(testRenderer: renderer.ReactTestRenderer): string {
  return JSON.stringify(testRenderer.toJSON());
}

describe('Empty', () => {
  it('renders the default empty message and icon when no slots are provided', () => {
    // Arrange & Act
    const testRenderer = renderEmpty();

    // Assert
    expect(toTreeText(testRenderer)).toContain('暂无内容');
    expect(testRenderer.root.findAllByType(Icon)).toHaveLength(1);
  });

  it('renders messageText as the primitive message content', () => {
    // Arrange & Act
    const testRenderer = renderEmpty({ messageText: 'No data' });

    // Assert
    expect(toTreeText(testRenderer)).toContain('No data');
    expect(toTreeText(testRenderer)).not.toContain('暂无内容');
  });

  it('renders custom message and icon nodes instead of fallback content', () => {
    // Arrange
    const customIcon = <RNText testID="custom-icon">Custom icon</RNText>;
    const customMessage = <RNText testID="custom-message">Custom message</RNText>;

    // Act
    const testRenderer = renderEmpty({
      icon: customIcon,
      message: customMessage,
      messageText: 'Fallback message',
    });

    // Assert
    expect(testRenderer.root.findByProps({ testID: 'custom-icon' })).toBeTruthy();
    expect(testRenderer.root.findByProps({ testID: 'custom-message' })).toBeTruthy();
    expect(toTreeText(testRenderer)).not.toContain('Fallback message');
    expect(testRenderer.root.findAllByType(Icon)).toHaveLength(0);
  });

  it('does not render default icon or message when slots are null', () => {
    // Arrange & Act
    const testRenderer = renderEmpty({
      icon: null,
      message: null,
      messageText: 'Fallback message',
    });

    // Assert
    const tree = toTreeText(testRenderer);
    expect(tree).not.toContain('暂无内容');
    expect(tree).not.toContain('Fallback message');
    expect(testRenderer.root.findAllByType(Icon)).toHaveLength(0);
    expect(testRenderer.root.findAllByType(Text)).toHaveLength(0);
  });

  it('uses Column for vertical layout with the expected size gap tokens', () => {
    // Arrange & Act
    const smallRenderer = renderEmpty({ size: 'small' });
    const normalRenderer = renderEmpty({ size: 'normal' });
    const largeRenderer = renderEmpty({ size: 'large' });

    // Assert
    expect(smallRenderer.root.findByType(Column).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ gap: GAP_TOKENS.small })]),
    );
    expect(normalRenderer.root.findByType(Column).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ gap: GAP_TOKENS.normal })]),
    );
    expect(largeRenderer.root.findByType(Column).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ gap: GAP_TOKENS.large })]),
    );
  });

  it('maps size to default icon and message sizes', () => {
    // Arrange & Act
    const smallRenderer = renderEmpty({ size: 'small' });
    const normalRenderer = renderEmpty({ size: 'normal' });
    const largeRenderer = renderEmpty({ size: 'large' });

    // Assert
    expect(smallRenderer.root.findByType(Icon).props.size).toBe('small');
    expect(smallRenderer.root.findByType(Text).props.size).toBe('sm');
    expect(normalRenderer.root.findByType(Icon).props.size).toBe('normal');
    expect(normalRenderer.root.findByType(Text).props.size).toBe('md');
    expect(largeRenderer.root.findByType(Icon).props.size).toBe('large');
    expect(largeRenderer.root.findByType(Text).props.size).toBe('lg');
  });
});
