import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DisplayInput } from '../src/DisplayInput';
import { TagPicker } from '../src/TagPicker';

const options = [
  { value: 'food', label: '餐饮' },
  { value: 'travel', label: '出行' },
  { value: 'archived', label: '旧账本', hidden: true },
];

function renderTagPicker(
  props: Partial<React.ComponentProps<typeof TagPicker>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TagPicker options={options} {...props} />,
    );
  });

  return testRenderer!;
}

function treeText(testRenderer: renderer.ReactTestRenderer): string {
  return JSON.stringify(testRenderer.toJSON());
}

function pressTrigger(testRenderer: renderer.ReactTestRenderer): void {
  act(() => {
    testRenderer.root.findByType(DisplayInput).props.onPress();
  });
}

function pressChip(
  testRenderer: renderer.ReactTestRenderer,
  value: string,
): void {
  act(() => {
    testRenderer.root
      .findAllByProps({ testID: `tag-picker-option-${value}` })[0]
      .props.onPress();
  });
}

describe('TagPicker', () => {
  it('renders selected options in the trigger', () => {
    const testRenderer = renderTagPicker({ value: ['food'] });

    expect(treeText(testRenderer)).toContain('餐饮');
    expect(
      testRenderer.root.findByProps({ testID: 'tag-value-container' }),
    ).toBeDefined();
  });

  it('opens in uncontrolled mode and reports open changes', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderTagPicker({ onOpenChange });

    pressTrigger(testRenderer);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(treeText(testRenderer)).toContain('出行');
  });

  it('adds an unselected option through its chip', () => {
    const onChange = jest.fn();
    const testRenderer = renderTagPicker({ defaultOpen: true, onChange });

    pressChip(testRenderer, 'food');

    expect(onChange).toHaveBeenCalledWith(['food']);
  });

  it('removes a selected option through its chip', () => {
    const onChange = jest.fn();
    const testRenderer = renderTagPicker({
      defaultOpen: true,
      onChange,
      value: ['food'],
    });

    pressChip(testRenderer, 'food');

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('removes a selected option through the trigger tag close button', () => {
    const onChange = jest.fn();
    const testRenderer = renderTagPicker({
      onChange,
      value: ['food', 'travel'],
    });

    act(() => {
      testRenderer.root.findAllByProps({ testID: 'tag-close' })[0].props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith(['travel']);
  });

  it('only renders hidden options after they are selected', () => {
    const hiddenRenderer = renderTagPicker({ defaultOpen: true });

    expect(treeText(hiddenRenderer)).not.toContain('旧账本');

    const selectedRenderer = renderTagPicker({
      defaultOpen: true,
      texts: { hiddenOptionsTitle: '已隐藏' },
      value: ['archived'],
    });

    expect(treeText(selectedRenderer)).toContain('已隐藏');
    expect(treeText(selectedRenderer)).toContain('旧账本');
  });

  it('shows the loading state instead of options while loading', () => {
    const testRenderer = renderTagPicker({
      defaultOpen: true,
      loading: true,
      texts: { loadingText: '标签加载中' },
    });

    expect(treeText(testRenderer)).toContain('标签加载中');
    expect(treeText(testRenderer)).not.toContain('餐饮');
  });

  it('shows the empty text when no options are provided', () => {
    const testRenderer = renderTagPicker({
      defaultOpen: true,
      options: [],
      texts: { emptyText: '暂无标签' },
    });

    expect(treeText(testRenderer)).toContain('暂无标签');
  });

  it('does not open when disabled', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderTagPicker({ disabled: true, onOpenChange });

    pressTrigger(testRenderer);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('keeps disabled options from changing the selection', () => {
    const onChange = jest.fn();
    const testRenderer = renderTagPicker({
      defaultOpen: true,
      onChange,
      options: [
        { value: 'food', label: '餐饮', disabled: true },
        { value: 'travel', label: '出行' },
      ],
    });

    pressChip(testRenderer, 'food');

    expect(onChange).not.toHaveBeenCalled();
  });
});
