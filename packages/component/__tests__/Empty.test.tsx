import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Empty } from '../src/Empty';
function renderEmpty(props: Partial<React.ComponentProps<typeof Empty>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Empty {...props} /></>);
  });
  return testRenderer!;
}
function findNodesWithStyle(testRenderer: renderer.ReactTestRenderer, markerStyle: Record<string, unknown>) {
  return testRenderer.root.findAll(node => {
    const style = node.props.style;
    return style === markerStyle || Array.isArray(style) && style.includes(markerStyle);
  });
}
describe('Empty', () => {
  it('supports overriding icon and message by external nodes', () => {
    const customIconStyle = {
      opacity: 0.61
    };
    const customMessageStyle = {
      opacity: 0.62
    };
    const testRenderer = renderEmpty({
      icon: <RNText style={customIconStyle}>Icon</RNText>,
      message: <RNText style={customMessageStyle}>Custom Message</RNText>,
      messageText: 'Fallback Message'
    });
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).toContain('Custom Message');
    expect(tree).not.toContain('Fallback Message');
    expect(findNodesWithStyle(testRenderer, customIconStyle).length).toBeGreaterThan(0);
    expect(findNodesWithStyle(testRenderer, customMessageStyle).length).toBeGreaterThan(0);
  });
  it('applies styles overrides for icon container and message', () => {
    const iconContainerStyle = {
      opacity: 0.71
    };
    const messageStyle = {
      opacity: 0.72
    };
    const testRenderer = renderEmpty({
      messageText: 'No records found',
      styles: {
        iconContainer: iconContainerStyle,
        message: messageStyle
      }
    });
    expect(findNodesWithStyle(testRenderer, iconContainerStyle).length).toBeGreaterThan(0);
    expect(findNodesWithStyle(testRenderer, messageStyle).length).toBeGreaterThan(0);
  });
});
