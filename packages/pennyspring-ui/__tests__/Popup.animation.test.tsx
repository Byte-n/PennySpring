import React from 'react';
import { Text } from 'react-native';
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Popup } from '../src/Popup';

describe('Popup animation', () => {
  it('renders with fade animation', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <Popup open animation="fade">
          <Text>Content</Text>
        </Popup>,
      );
    });
    expect(tree?.toJSON()).toMatchSnapshot();
  });

  it('renders with opacity animation', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <Popup open animation="opacity">
          <Text>Content</Text>
        </Popup>,
      );
    });
    expect(tree?.toJSON()).toMatchSnapshot();
  });

  it('renders without animation when animation prop is not provided', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <Popup open>
          <Text>Content</Text>
        </Popup>,
      );
    });
    expect(tree?.toJSON()).toMatchSnapshot();
  });
});
