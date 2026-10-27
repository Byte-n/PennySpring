import React from 'react';
import { Pressable, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Tag } from '../src/Tag';
import { Row } from '../src/Row';
import { Text } from '../src/Text';

function renderTag(props: Partial<React.ComponentProps<typeof Tag>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Tag {...props} /></>);
  });
  return testRenderer!;
}

function getPressableRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.find(node => {
    return typeof node.props.onPress === 'function' && typeof node.props.style === 'function';
  });
}

describe('Tag', () => {
  describe('root layout', () => {
    it('uses Pressable root and invokes onPress when enabled', () => {
      const onPress = jest.fn();
      const testRenderer = renderTag({
        onPress,
        children: 'Open'
      });
      const root = getPressableRoot(testRenderer);
      act(() => {
        root.props.onPress({} as never);
      });
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('blocks disabled press from invoking onPress', () => {
      const onPress = jest.fn();
      const testRenderer = renderTag({
        disabled: true,
        onPress,
        children: 'Disabled'
      });
      const root = getPressableRoot(testRenderer);
      act(() => {
        root.props.onPress({} as never);
      });
      expect(onPress).not.toHaveBeenCalled();
    });

    it('uses Row root when onPress is absent', () => {
      const testRenderer = renderTag({
        children: 'Static'
      });
      expect(testRenderer.root.findAllByType(Pressable)).toHaveLength(0);
      expect(testRenderer.root.findAllByType(Row).length).toBeGreaterThan(0);
    });

    it('forwards testID to the Row root when onPress is absent', () => {
      const testRenderer = renderTag({
        testID: 'static-tag',
        children: 'Static'
      });
      const rows = testRenderer.root.findAllByType(Row);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0].props.testID).toBe('static-tag');
    });
  });

  describe('Text props', () => {
    it('renders string content with Text size and weight props', () => {
      const testRenderer = renderTag({
        size: 'large',
        children: 'Label'
      });
      const textNodes = testRenderer.root.findAllByType(Text);
      expect(textNodes.length).toBeGreaterThan(0);
      const text = textNodes[0];
      expect(text.props.size).toBe('md');
      expect(text.props.weight).toBe('regular');
    });

    it('renders small size string content with sm Text size', () => {
      const testRenderer = renderTag({
        size: 'small',
        children: 'Small'
      });
      const textNodes = testRenderer.root.findAllByType(Text);
      expect(textNodes[0].props.size).toBe('sm');
    });

    it('does not wrap non-string children in Text', () => {
      const CustomNode = () => <View testID="custom" />;
      const testRenderer = renderTag({
        children: <CustomNode />
      });
      expect(testRenderer.root.findAllByType(Text)).toHaveLength(0);
      expect(testRenderer.root.findAllByType(CustomNode).length).toBeGreaterThan(0);
    });

    it('renders prefix before the content text', () => {
      const testRenderer = renderTag({
        children: 'Label',
        prefix: <View testID="tag-prefix" />
      });
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).toContain('tag-prefix');
      expect(tree.indexOf('tag-prefix')).toBeLessThan(tree.indexOf('Label'));
    });
  });

  describe('root style slot', () => {
    it('accepts styles.root and merges into the Pressable root', () => {
      const rootOverride = { opacity: 0.5 };
      const testRenderer = renderTag({
        onPress: jest.fn(),
        styles: { root: rootOverride },
        children: 'Tag'
      });
      const pressable = getPressableRoot(testRenderer);
      const styleArray = pressable.props.style({ pressed: false });
      expect(styleArray).toEqual(
        expect.arrayContaining([expect.objectContaining(rootOverride)])
      );
    });

    it('accepts styles.root and merges into the Row root', () => {
      const rootOverride = { opacity: 0.5 };
      const testRenderer = renderTag({
        styles: { root: rootOverride },
        children: 'Tag'
      });
      const rows = testRenderer.root.findAllByType(Row);
      expect(rows.length).toBeGreaterThan(0);
      const rowStyle = rows[0].props.style;
      expect(rowStyle).toEqual(
        expect.arrayContaining([expect.objectContaining(rootOverride)])
      );
    });
  });
});
