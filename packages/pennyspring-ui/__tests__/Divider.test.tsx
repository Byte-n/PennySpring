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

    expect(rootStyle.marginVertical).toBe(expectedMargin);
  });
});
