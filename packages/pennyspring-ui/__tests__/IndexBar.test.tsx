import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { IndexBar } from '../src/IndexBar';
import { List, ListItem } from '../src/List';
import type { IndexBarProps } from '../src/IndexBar';

function renderIndexBar(props: Partial<IndexBarProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  const {
    children = (
      <>
        <IndexBar.Panel index="A" title="标题A">
          <List>
            <ListItem>苹果</ListItem>
            <ListItem>杏子</ListItem>
          </List>
        </IndexBar.Panel>
        <IndexBar.Panel index="B" title="标题B">
          <List>
            <ListItem>香蕉</ListItem>
            <ListItem>菠萝</ListItem>
          </List>
        </IndexBar.Panel>
        <IndexBar.Panel index="C" title={<RNText>标题C</RNText>}>
          <List>
            <ListItem>车厘子</ListItem>
          </List>
        </IndexBar.Panel>
      </>
    ),
    ...restProps
  } = props;

  act(() => {
    testRenderer = renderer.create(
      <>
        <IndexBar {...restProps}>{children}</IndexBar>
      </>,
    );
  });

  return testRenderer!;
}

function pressIndexItem(
  testRenderer: renderer.ReactTestRenderer,
  value: string | number,
) {
  const target = testRenderer.root.findByProps({
    testID: `index-bar-item-${String(value)}`,
  });

  act(() => {
    target.props.onPress();
  });

  return target;
}

describe('IndexBar', () => {
  it('renders panels and sidebar indexes through IndexBar.Panel', () => {
    const testRenderer = renderIndexBar();
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('标题A');
    expect(content).toContain('标题B');
    expect(content).toContain('标题C');
    expect(content).toContain('苹果');
    expect(content).toContain('香蕉');
    expect(content).toContain('A');
    expect(content).toContain('B');
    expect(content).toContain('C');
  });

  it('updates uncontrolled value and calls onChange/onPress when index item is pressed', () => {
    const onChange = jest.fn();
    const onPress = jest.fn();
    const testRenderer = renderIndexBar({
      defaultValue: 'A',
      onChange,
      onPress,
    });

    pressIndexItem(testRenderer, 'B');

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress.mock.calls[0][1]).toBe('B');
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('keeps selected index controlled by value prop', () => {
    const onChange = jest.fn();
    const testRenderer = renderIndexBar({
      value: 'A',
      onChange,
    });

    pressIndexItem(testRenderer, 'B');

    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('blocks interaction when disabled at root or panel level', () => {
    const onChange = jest.fn();

    const disabledRoot = renderIndexBar({
      disabled: true,
      onChange,
    });

    const disabledPanel = renderIndexBar({
      onChange,
      children: (
        <>
          <IndexBar.Panel index="A" title="标题A">
            <List>
              <ListItem>苹果</ListItem>
            </List>
          </IndexBar.Panel>
          <IndexBar.Panel index="B" title="标题B" disabled>
            <List>
              <ListItem>香蕉</ListItem>
            </List>
          </IndexBar.Panel>
        </>
      ),
    });

    pressIndexItem(disabledRoot, 'B');
    const disabledItem = pressIndexItem(disabledPanel, 'B');

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledItem.props.disabled).toBe(true);
  });
});
