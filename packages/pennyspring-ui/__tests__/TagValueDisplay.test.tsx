import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TagValueDisplay } from '../src/_internal/TagValueDisplay';

const items = [
  { label: 'Food', value: 'food' },
  { label: 'Transport', value: 'transport' },
  { label: 'Housing', value: 'housing' },
  { label: 'Health', value: 'health' },
];

function render(props: Partial<React.ComponentProps<typeof TagValueDisplay>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <TagValueDisplay items={items} {...props} />,
    );
  });
  return testRenderer!;
}

describe('TagValueDisplay', () => {
  it('renders all items as tags by default', () => {
    const tree = render();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Food');
    expect(json).toContain('Transport');
    expect(json).toContain('Housing');
    expect(json).toContain('Health');
  });

  it('respects maxCount and shows overflow tag', () => {
    const tree = render({ tagProps: { maxCount: 2 } });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Food');
    expect(json).toContain('Transport');
    expect(json).not.toContain('Housing');
    expect(json).toContain('+2');
  });

  it('calls onRemove when close icon is pressed', () => {
    const onRemove = jest.fn();
    const tree = render({ onRemove });
    const closeButtons = tree.root.findAll(
      node => node.props.testID === 'tag-close' && typeof node.props.onPress === 'function',
    );
    expect(closeButtons.length).toBe(4);
    act(() => { closeButtons[1].props.onPress(); });
    expect(onRemove).toHaveBeenCalledWith('transport');
  });

  it('hides close buttons when disabled', () => {
    const tree = render({ disabled: true });
    const closeButtons = tree.root.findAll(
      node => node.props.testID === 'tag-close' && typeof node.props.onPress === 'function',
    );
    expect(closeButtons.length).toBe(0);
  });

  it('hides close buttons when closable is false', () => {
    const tree = render({ tagProps: { closable: false } });
    const closeButtons = tree.root.findAll(
      node => node.props.testID === 'tag-close' && typeof node.props.onPress === 'function',
    );
    expect(closeButtons.length).toBe(0);
  });

  it('applies nowrap style when wrap is false', () => {
    const tree = render({ tagProps: { wrap: false } });
    const container = tree.root.findByProps({ testID: 'tag-value-container' });
    expect(container.props.style).toEqual(
      expect.objectContaining({ flexWrap: 'nowrap', overflow: 'hidden' }),
    );
  });
});
