import React from 'react';
import { StyleSheet, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Divider } from '../src/Divider';
function renderDivider(props: Partial<React.ComponentProps<typeof Divider>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Divider {...props}>Budget</Divider></>);
  });
  return testRenderer!;
}
describe('Divider', () => {
  it('renders horizontal divider by default with content', () => {
    const testRenderer = renderDivider();
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).toContain('Budget');
    expect(testRenderer.root.findAllByType(View)).toHaveLength(4);
  });
  it('renders vertical divider without content node', () => {
    const testRenderer = renderDivider({
      direction: 'vertical'
    });
    expect(testRenderer.root.findAllByType(View)).toHaveLength(1);
  });
  it.each([
    ['left', 0, '10%', undefined],
    ['right', 2, '10%', undefined],
  ] as const)(
    'constrains %s side line width when contentPosition is %s',
    (contentPosition, targetIndex, expectedTargetMaxWidth, expectedOtherMaxWidth) => {
      const testRenderer = renderDivider({
        contentPosition,
      });
      const viewNodes = testRenderer.root.findAllByType(View);

      // Arrange
      const firstLine = viewNodes[1];
      const secondLine = viewNodes[3];
      const targetLine = targetIndex === 0 ? firstLine : secondLine;
      const otherLine = targetIndex === 0 ? secondLine : firstLine;

      // Act
      const targetLineStyle = StyleSheet.flatten(targetLine.props.style);
      const otherLineStyle = StyleSheet.flatten(otherLine.props.style);

      // Assert
      expect(targetLineStyle.maxWidth).toBe(expectedTargetMaxWidth);
      expect(otherLineStyle.maxWidth).toBe(expectedOtherMaxWidth);
    },
  );
  it('does not inject standalone maxWidth inline style objects into line style arrays', () => {
    const testRenderer = renderDivider({
      contentPosition: 'left',
    });
    const viewNodes = testRenderer.root.findAllByType(View);
    const firstLineStyle = viewNodes[1].props.style;
    const secondLineStyle = viewNodes[3].props.style;
    const lineStyleEntries = [firstLineStyle, secondLineStyle].flat().filter(Boolean);

    expect(
      lineStyleEntries.some(
        styleEntry =>
          typeof styleEntry === 'object' &&
          !Array.isArray(styleEntry) &&
          Object.keys(styleEntry).length === 1 &&
          Object.prototype.hasOwnProperty.call(styleEntry, 'maxWidth'),
      ),
    ).toBe(false);
  });
  it.each([
    ['small', 11],
    ['normal', 13],
    ['large', 17],
  ] as const)('maps %s size to section margin token', (size, expectedMargin) => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider
          config={{
            token: {
              marginSM: 11,
              margin: 13,
              marginMD: 17,
            },
          }}
        >
          <Divider size={size}>Budget</Divider>
        </ThemeProvider>,
      );
    });
    const dividerRoot = testRenderer!.root.findAllByType(View)[0];
    const rootStyle = StyleSheet.flatten(dividerRoot.props.style);

    expect(rootStyle.marginVertical).toBe(expectedMargin / 2);
  });
});
