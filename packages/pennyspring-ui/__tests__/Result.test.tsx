import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Result } from '../src/Result';
function renderResult(props: Partial<React.ComponentProps<typeof Result>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Result {...props} /></>);
  });
  return testRenderer!;
}
describe('Result', () => {
  it('renders default info status with icon and title', () => {
    const testRenderer = renderResult({
      titleText: 'Operation Info'
    });
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).toContain('Operation Info');
  });
  it('renders subtitleText below the title', () => {
    const testRenderer = renderResult({
      titleText: 'Success',
      subtitleText: 'Your changes have been saved.'
    });
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).toContain('Success');
    expect(tree).toContain('Your changes have been saved.');
  });
  it('supports custom icon, title, subtitle, and extra nodes', () => {
    const customIcon = <RNText testID="custom-icon">★</RNText>;
    const customTitle = <RNText testID="custom-title">Custom Title</RNText>;
    const customSubtitle = <RNText testID="custom-subtitle">Custom Sub</RNText>;
    const customExtra = <RNText testID="custom-extra">Action</RNText>;
    const testRenderer = renderResult({
      icon: customIcon,
      title: customTitle,
      subtitle: customSubtitle,
      extra: customExtra,
      titleText: 'Fallback Title',
      subtitleText: 'Fallback Sub'
    });
    expect(testRenderer.root.findByProps({
      testID: 'custom-icon'
    })).toBeTruthy();
    expect(testRenderer.root.findByProps({
      testID: 'custom-title'
    })).toBeTruthy();
    expect(testRenderer.root.findByProps({
      testID: 'custom-subtitle'
    })).toBeTruthy();
    expect(testRenderer.root.findByProps({
      testID: 'custom-extra'
    })).toBeTruthy();
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).not.toContain('Fallback Title');
    expect(tree).not.toContain('Fallback Sub');
  });
});
