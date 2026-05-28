import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Ellipsis } from '../src/Ellipsis';

const SHORT_TEXT = 'Short text';
const LONG_TEXT =
  'This is a very long text that should be truncated when it exceeds the available space in the container and keeps going on and on';

interface TestNode {
  type: string;
  props: Record<string, unknown>;
  children?: (TestNode | string)[];
}

function findRNTextWithOnTextLayout(root: ReactTestRenderer['root']): TestNode | null {
  let found: TestNode | null = null;
  function walk(node: TestNode) {
    if (found) return;
    if (node.type === 'Text' && typeof node.props.onTextLayout === 'function') {
      found = node;
      return;
    }
    if (node.children) {
      for (const child of node.children) {
        if (typeof child !== 'string') walk(child);
      }
    }
  }
  walk(root as unknown as TestNode);
  return found;
}

function triggerTextLayout(
  renderer: ReactTestRenderer,
  lineCount: number,
) {
  const node = findRNTextWithOnTextLayout(renderer.root);
  if (!node) {
    throw new Error('No RNText with onTextLayout found');
  }

  const lines = Array.from({ length: lineCount }, (_, i) => ({
    x: 0,
    y: i * 20,
    width: 300,
    height: 20,
    ascender: 15,
    descender: 5,
    capHeight: 14,
    text: '',
  }));

  act(() => {
    (node.props.onTextLayout as Function)({ nativeEvent: { lines } });
  });
}

/** Drive the binary search to convergence by repeatedly triggering onTextLayout.
 *  For each step, if the candidate text is long enough to overflow, report
 *  `overflowLines` (> rows), otherwise report `rows`. */
function driveSearchToConvergence(
  renderer: ReactTestRenderer,
  rows: number,
  overflowThreshold: number,
) {
  for (let i = 0; i < 30; i++) {
    const node = findRNTextWithOnTextLayout(renderer.root);
    if (!node) break;

    const candidateText = node.props.children as string;
    const lineCount = candidateText.length > overflowThreshold ? rows + 1 : rows;

    const lines = Array.from({ length: lineCount }, (_, idx) => ({
      x: 0,
      y: idx * 20,
      width: 300,
      height: 20,
      ascender: 15,
      descender: 5,
      capHeight: 14,
      text: '',
    }));

    act(() => {
      (node.props.onTextLayout as Function)({ nativeEvent: { lines } });
    });
  }
}

function getSearchCandidate(renderer: ReactTestRenderer): string {
  const node = findRNTextWithOnTextLayout(renderer.root);
  if (!node) {
    throw new Error('No RNText with onTextLayout found');
  }

  return node.props.children as string;
}

describe('Ellipsis', () => {
  describe('text fits within rows', () => {
    test('renders full content when text fits', () => {
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis content={SHORT_TEXT} data-testid="ellipsis" />,
        );
      });

      triggerTextLayout(renderer!, 1);

      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      expect(text.props.children).toBe(SHORT_TEXT);
    });
  });

  describe('end direction (default)', () => {
    test('truncates text with ellipsis at end', () => {
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis content={LONG_TEXT} data-testid="ellipsis" />,
        );
      });

      triggerTextLayout(renderer!, 5);
      driveSearchToConvergence(renderer!, 1, 50);

      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      const content = text.props.children as string;
      expect(content).toContain('...');
      expect(content.length).toBeLessThan(LONG_TEXT.length + 3);
    });

    test('uses the last fitting candidate when the overflow boundary converges', () => {
      // Arrange
      const lastFittingLength = 50;
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis content={LONG_TEXT} data-testid="ellipsis" />,
        );
      });

      // Act
      triggerTextLayout(renderer!, 5);
      driveSearchToConvergence(renderer!, 1, lastFittingLength);

      // Assert
      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      const content = text.props.children as string;
      expect(content.replace('...', '').length).toBeLessThanOrEqual(
        lastFittingLength,
      );
    });

    test('measures collapsed text with ellipsis and expand action text', () => {
      // Arrange
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis
            content={LONG_TEXT}
            expandText="more"
            data-testid="ellipsis"
          />,
        );
      });

      // Act
      triggerTextLayout(renderer!, 5);

      // Assert
      const candidate = getSearchCandidate(renderer!);
      expect(candidate).toContain('...');
      expect(candidate.endsWith('more')).toBe(true);
    });
  });

  describe('start direction', () => {
    test('truncates text with ellipsis at start', () => {
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis content={LONG_TEXT} direction="start" data-testid="ellipsis" />,
        );
      });

      triggerTextLayout(renderer!, 5);
      driveSearchToConvergence(renderer!, 1, 50);

      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      const content = text.props.children as string;
      expect(content).toContain('...');
      expect(content.startsWith('...')).toBe(true);
    });
  });

  describe('middle direction', () => {
    test('truncates text with ellipsis in middle', () => {
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis content={LONG_TEXT} direction="middle" data-testid="ellipsis" />,
        );
      });

      triggerTextLayout(renderer!, 5);
      driveSearchToConvergence(renderer!, 1, 25);

      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      const content = text.props.children as string;
      expect(content).toContain('...');
      expect(content.startsWith('T')).toBe(true);
    });
  });

  describe('multi-row truncation', () => {
    test('truncates text for rows=2', () => {
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis content={LONG_TEXT} rows={2} data-testid="ellipsis" />,
        );
      });

      // Text overflows 2 rows: report 5 lines
      triggerTextLayout(renderer!, 5);
      // Threshold is higher for 2 rows (more text fits)
      driveSearchToConvergence(renderer!, 2, 100);

      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      const content = text.props.children as string;
      expect(content).toContain('...');
      expect(content.length).toBeLessThan(LONG_TEXT.length + 3);
    });
  });

  describe('expand and collapse', () => {
    test('shows expandText and expands content on click', () => {
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis
            content={LONG_TEXT}
            expandText="more"
            data-testid="ellipsis"
          />,
        );
      });

      triggerTextLayout(renderer!, 5);
      driveSearchToConvergence(renderer!, 1, 50);

      const expandButton = renderer!.root.findByProps({
        'data-testid': 'ellipsis-expand',
      });
      act(() => {
        expandButton.props.onPress();
      });

      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      expect(text.props.children).toBe(LONG_TEXT);
    });

    test('shows collapseText and collapses content on click', () => {
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis
            content={LONG_TEXT}
            expandText="more"
            collapseText="less"
            data-testid="ellipsis"
          />,
        );
      });

      triggerTextLayout(renderer!, 5);
      driveSearchToConvergence(renderer!, 1, 50);

      const expandButton = renderer!.root.findByProps({
        'data-testid': 'ellipsis-expand',
      });
      act(() => {
        expandButton.props.onPress();
      });

      const collapseButton = renderer!.root.findByProps({
        'data-testid': 'ellipsis-collapse',
      });
      act(() => {
        collapseButton.props.onPress();
      });

      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      const content = text.props.children as string;
      expect(content).toContain('...');
    });

    test('calls onOpenChange callback with open state', () => {
      const onOpenChange = jest.fn();
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis
            content={LONG_TEXT}
            expandText="more"
            collapseText="less"
            onOpenChange={onOpenChange}
            data-testid="ellipsis"
          />,
        );
      });

      triggerTextLayout(renderer!, 5);
      driveSearchToConvergence(renderer!, 1, 50);

      const expandButton = renderer!.root.findByProps({
        'data-testid': 'ellipsis-expand',
      });
      act(() => {
        expandButton.props.onPress();
      });
      expect(onOpenChange).toHaveBeenCalledWith(true);

      const collapseButton = renderer!.root.findByProps({
        'data-testid': 'ellipsis-collapse',
      });
      act(() => {
        collapseButton.props.onPress();
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    test('calls onOpenChange callback with open state', () => {
      // Arrange
      const onOpenChange = jest.fn();
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis
            content={LONG_TEXT}
            expandText="more"
            collapseText="less"
            onOpenChange={onOpenChange}
            data-testid="ellipsis"
          />,
        );
      });
      triggerTextLayout(renderer!, 5);
      driveSearchToConvergence(renderer!, 1, 50);

      // Act
      const expandButton = renderer!.root.findByProps({
        'data-testid': 'ellipsis-expand',
      });
      act(() => {
        expandButton.props.onPress();
      });

      const collapseButton = renderer!.root.findByProps({
        'data-testid': 'ellipsis-collapse',
      });
      act(() => {
        collapseButton.props.onPress();
      });

      // Assert
      expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
      expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
    });
  });

  describe('controlled expanded state', () => {
    test('respects controlled open prop', () => {
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis
            content={LONG_TEXT}
            open
            collapseText="less"
            data-testid="ellipsis"
          />,
        );
      });

      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      expect(text.props.children).toBe(LONG_TEXT);
    });

    test('respects controlled open prop', () => {
      // Arrange & Act
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis
            content={LONG_TEXT}
            open
            collapseText="less"
            data-testid="ellipsis"
          />,
        );
      });

      // Assert
      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      expect(text.props.children).toBe(LONG_TEXT);
    });
  });

  describe('size', () => {
    test('passes mapped text size to visible content', () => {
      // Arrange
      let renderer: ReactTestRenderer;
      act(() => {
        renderer = create(
          <Ellipsis
            content={SHORT_TEXT}
            size="small"
            data-testid="ellipsis"
          />,
        );
      });

      // Act
      triggerTextLayout(renderer!, 1);

      // Assert
      const text = renderer!.root.findByProps({ 'data-testid': 'ellipsis-text' });
      expect(text.props.size).toBe('sm');
    });
  });
});
