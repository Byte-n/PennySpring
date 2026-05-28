import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Text } from '../src/Text';
import { ProgressBar, ProgressCircle } from '../src/Progress/Progress';

function renderProgressBar(props: React.ComponentProps<typeof ProgressBar>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><ProgressBar {...props} /></>);
  });
  return testRenderer!;
}

function renderProgressCircle(props: React.ComponentProps<typeof ProgressCircle>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><ProgressCircle {...props} /></>);
  });
  return testRenderer!;
}

describe('Progress', () => {
  describe('ProgressBar', () => {
    it('hides info text when showInfo is false', () => {
      const testRenderer = renderProgressBar({ percent: 60, showInfo: false });
      expect(testRenderer.root.findAllByType(Text)).toHaveLength(0);
    });

    it('supports custom info formatter', () => {
      const testRenderer = renderProgressBar({
        format: value => `done ${value}`,
        percent: 88,
      });
      expect(JSON.stringify(testRenderer.toJSON())).toContain('done 88');
    });

    it('renders 0% for negative percent', () => {
      const testRenderer = renderProgressBar({ percent: -10 });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('0%');
    });

    it('renders 100% for percent above 100', () => {
      const testRenderer = renderProgressBar({ percent: 150 });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('100%');
    });

    it('renders 0% for undefined percent', () => {
      const testRenderer = renderProgressBar({});
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('0%');
    });

    it('renders correct percent text for valid values', () => {
      const testRenderer = renderProgressBar({ percent: 42 });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('42%');
    });

    it('renders success status percent text', () => {
      const testRenderer = renderProgressBar({ percent: 100, status: 'success' });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('100%');
    });

    it('renders exception status percent text', () => {
      const testRenderer = renderProgressBar({ percent: 38, status: 'exception' });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('38%');
    });
  });

  describe('ProgressCircle', () => {
    it('renders info content via format', () => {
      const testRenderer = renderProgressCircle({
        percent: 66,
        format: value => <View testID={`circle-${value}`} />,
      });
      expect(testRenderer.root.findByProps({ testID: 'circle-66' })).toBeTruthy();
    });

    it('hides info text when showInfo is false', () => {
      const testRenderer = renderProgressCircle({ percent: 50, showInfo: false });
      expect(testRenderer.root.findAllByType(Text)).toHaveLength(0);
    });

    it('renders 0% for negative percent', () => {
      const testRenderer = renderProgressCircle({ percent: -5 });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('0%');
    });

    it('renders 100% for percent above 100', () => {
      const testRenderer = renderProgressCircle({ percent: 200 });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('100%');
    });

    it('renders correct percent text at 50%', () => {
      const testRenderer = renderProgressCircle({ percent: 50 });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('50%');
    });

    it('renders success status percent text', () => {
      const testRenderer = renderProgressCircle({ percent: 100, status: 'success' });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('100%');
    });

    it('renders exception status percent text', () => {
      const testRenderer = renderProgressCircle({ percent: 25, status: 'exception' });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('25%');
    });

    it('renders 0% at zero percent', () => {
      const testRenderer = renderProgressCircle({ percent: 0 });
      const text = testRenderer.root.findByType(Text);
      expect(text.props.children).toBe('0%');
    });
  });
});
