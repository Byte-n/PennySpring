import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { ConfigProvider } from '../src/ConfigProvider';
import { Page } from '../src/Page';

describe('Page', () => {
  it('renders optional header slots and content', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <Page
            backButtonIcon={<Text>back icon</Text>}
            right={<Text>right action</Text>}
            title="账单"
          >
            <Text>page content</Text>
          </Page>
        </ThemeProvider>
      );
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());

    expect(treeString).toContain('back icon');
    expect(treeString).toContain('账单');
    expect(treeString).toContain('right action');
    expect(treeString).toContain('page content');
  });

  it('calls onBack when the back button is pressed', () => {
    const onBack = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <Page backButtonIcon={<Text>back icon</Text>} onBack={onBack} title="账单" />
        </ThemeProvider>
      );
    });

    act(() => {
      testRenderer!.root.findByProps({ accessibilityLabel: '返回' }).props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders a default back button icon when a custom icon is absent', () => {
    const onBack = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <Page onBack={onBack} title="账单" />
        </ThemeProvider>
      );
    });

    act(() => {
      testRenderer!.root.findByProps({ accessibilityLabel: '返回' }).props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('uses ConfigProvider page onBack when local onBack is absent', () => {
    const onBack = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <ConfigProvider page={{ onBack }}>
            <Page backButtonIcon={<Text>back icon</Text>} title="账单" />
          </ConfigProvider>
        </ThemeProvider>
      );
    });

    act(() => {
      testRenderer!.root.findByProps({ accessibilityLabel: '返回' }).props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('uses local onBack over ConfigProvider page onBack', () => {
    const globalBack = jest.fn();
    const localBack = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <ConfigProvider page={{ onBack: globalBack }}>
            <Page
              backButtonIcon={<Text>back icon</Text>}
              onBack={localBack}
              title="账单"
            />
          </ConfigProvider>
        </ThemeProvider>
      );
    });

    act(() => {
      testRenderer!.root.findByProps({ accessibilityLabel: '返回' }).props.onPress();
    });

    expect(localBack).toHaveBeenCalledTimes(1);
    expect(globalBack).not.toHaveBeenCalled();
  });

  it('renders without any header content', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <Page>
            <Text>only content</Text>
          </Page>
        </ThemeProvider>
      );
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());

    expect(treeString).toContain('only content');
  });
});
