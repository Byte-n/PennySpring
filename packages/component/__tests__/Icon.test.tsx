import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CheckCircleIcon } from 'phosphor-react-native';
import { ThemeProvider } from '@pennyspring/theme';
import { Icon } from '../src/Icon';

function renderIcon(props: Partial<React.ComponentProps<typeof Icon>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Icon icon="check-circle" testID="icon-under-test" {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

describe('Icon', () => {
  it('renders built-in icon name', () => {
    const testRenderer = renderIcon();
    const iconNode = testRenderer.root.findByProps({ testID: 'icon-under-test' });

    expect(iconNode).toBeDefined();
  });

  it('supports phosphor icon component directly', () => {
    const testRenderer = renderIcon({ icon: CheckCircleIcon });
    const iconNode = testRenderer.root.findByProps({ testID: 'icon-under-test' });

    expect(iconNode).toBeDefined();
  });
});
