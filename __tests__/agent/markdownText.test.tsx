import React from 'react';
import { Linking } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { MarkdownText } from '../../src/component/MarkdownText';

type HostNode = {
  type: string;
  props: Record<string, unknown>;
  children?: unknown[];
};

function renderMarkdown(content: string) {
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<MarkdownText content={content} />);
  });
  return renderer!;
}

function toHostNodes(renderer: TestRenderer.ReactTestRenderer): HostNode[] {
  const root = renderer.toJSON();
  if (root === null) {
    return [];
  }
  return (Array.isArray(root) ? root : [root]) as HostNode[];
}

function collectText(nodes: readonly unknown[]): string {
  return nodes
    .map(node => {
      if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
      }
      if (!node || typeof node !== 'object') {
        return '';
      }
      return collectText(((node as HostNode).children) ?? []);
    })
    .join('');
}

function visibleTextOf(content: string): string {
  return collectText(toHostNodes(renderMarkdown(content)));
}

function hostNodesOfType(content: string, type: string): HostNode[] {
  const found: HostNode[] = [];
  const visit = (nodes: readonly unknown[]): void => {
    nodes.forEach(node => {
      if (!node || typeof node !== 'object') {
        return;
      }
      const host = node as HostNode;
      if (host.type === type) {
        found.push(host);
      }
      visit(host.children ?? []);
    });
  };
  visit(toHostNodes(renderMarkdown(content)));
  return found;
}

function componentWithText(renderer: TestRenderer.ReactTestRenderer, text: string) {
  return renderer.root.findAll(
    node =>
      typeof node.type !== 'string' &&
      'props' in node &&
      collectText(node.children as unknown[]) === text,
  );
}

describe('MarkdownText', () => {
  it('shows plain sentences without markdown markers', () => {
    expect(visibleTextOf('上个月餐饮共 120 元。')).toBe('上个月餐饮共 120 元。');
  });

  it('hides emphasis markers and styles the wrapped words instead', () => {
    const renderer = renderMarkdown('**餐饮** 占比最高');
    const [strongNode] = componentWithText(renderer, '餐饮');

    expect(visibleTextOf('**餐饮** 占比最高')).toBe('餐饮 占比最高');
    expect(strongNode.props.weight).toBe('semibold');
  });

  it('hides inline code markers and marks the span as code', () => {
    const renderer = renderMarkdown('金额 `120.00` 元');
    const [codeNode] = componentWithText(renderer, '120.00');

    expect(visibleTextOf('金额 `120.00` 元')).toBe('金额 120.00 元');
    expect(codeNode.props.style).toEqual(
      expect.objectContaining({ fontFamily: expect.any(String) }),
    );
  });

  it('renders fenced code verbatim in a monospace block', () => {
    const codeBlock = hostNodesOfType('```sql\nSELECT * FROM records\n```', 'Text')[0];

    expect(collectText([codeBlock])).toBe('SELECT * FROM records');
    expect(codeBlock.props.style).toContainEqual(
      expect.objectContaining({ fontFamily: expect.any(String) }),
    );
  });

  it('keeps bullet markers visible as text prefixes', () => {
    expect(visibleTextOf('- 餐饮\n- 交通\n')).toBe('• 餐饮• 交通');
  });

  it('follows the ordered marker start number', () => {
    expect(visibleTextOf('3. 餐饮\n4. 交通')).toBe('3. 餐饮4. 交通');
  });

  it('hides blockquote markers and renders quoted text', () => {
    expect(visibleTextOf('> 先选月份')).toBe('先选月份');
  });

  it('renders heading content without the leading hashes', () => {
    const renderer = renderMarkdown('## 本月支出');
    const headingNode = renderer.root.findByProps({ testID: 'markdown-heading', size: 'h2' });

    expect(componentWithText(renderer, '本月支出').length).toBeGreaterThan(0);
    expect(headingNode.props.weight).toBe('semibold');
  });

  it('renders table cells row by row without separator pipes', () => {
    expect(visibleTextOf('| 类型 | **金额** |\n| --- | --- |\n| 餐饮 | 120 |')).toBe('类型金额餐饮120');
  });

  it('renders a rule instead of a paragraph of dashes', () => {
    const content = '前一段\n\n---\n\n后一段';

    expect(
      hostNodesOfType(content, 'View').filter(node => node.props.testID === 'markdown-rule'),
    ).toHaveLength(1);
    expect(visibleTextOf(content)).toBe('前一段后一段');
  });

  it('opens an http link when the link text is pressed', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const renderer = renderMarkdown('查看 [明细页](https://example.com/bill)');

    const linkNode = renderer.root.findByProps({ testID: 'markdown-link' });
    act(() => {
      linkNode.props.onPress();
    });

    expect(openURL).toHaveBeenCalledWith('https://example.com/bill');
    expect(collectText(linkNode.children as unknown[])).toBe('明细页');
    openURL.mockRestore();
  });

  it('does not open links that are not web addresses', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const renderer = renderMarkdown('[点开](https://example.com/a) 与 [点开](javascript:alert(1))');

    const linkNodes = renderer.root.findAllByProps({ testID: 'markdown-link' });
    act(() => {
      linkNodes[linkNodes.length - 1].props.onPress();
    });

    expect(openURL).not.toHaveBeenCalled();
    openURL.mockRestore();
  });

  it('renders nothing for an empty reply', () => {
    expect(renderMarkdown('').toJSON()).toBeNull();
  });
});
