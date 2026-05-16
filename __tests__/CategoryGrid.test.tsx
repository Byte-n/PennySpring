import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CategoryGrid, CategoryItem } from '../src/screens/addRecord/components/CategoryGrid';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: (fn: Function) => () => {
    const token = new Proxy({}, { get: () => 0 });
    return fn(token, {});
  },
  useTheme: () => ({
    token: new Proxy({}, { get: () => 0 }),
  }),
}));

jest.mock('../packages/component', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  return {
    Grid: ({ children, ...props }: any) => React.createElement(View, { ...props, testID: 'grid' }, children),
    Column: ({ children, ...props }: any) => React.createElement(View, props, children),
    Row: ({ children, ...props }: any) => React.createElement(View, { ...props, testID: 'subcategory-row' }, children),
    Tag: ({ children, onPress, ...props }: any) =>
      React.createElement(
        Pressable,
        { onPress, ...props, 'data-label': children },
        React.createElement(Text, null, children)
      ),
    Text: ({ children, ...props }: any) => React.createElement(Text, props, children),
  };
});

const MOCK_CATEGORIES: CategoryItem[] = [
  {
    id: 1,
    name: '餐饮',
    icon: 'food',
    children: [
      { id: 11, name: '早餐', icon: 'breakfast' },
      { id: 12, name: '午餐', icon: 'lunch' },
    ],
  },
  { id: 2, name: '交通', icon: 'transport', children: [] },
  { id: 3, name: '购物', icon: 'shopping' },
];

describe('CategoryGrid', () => {
  it('renders all primary categories by name', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <CategoryGrid categories={MOCK_CATEGORIES} selectedId={null} onSelect={jest.fn()} />
      );
    });

    const text = JSON.stringify(root!.toJSON());
    expect(text).toContain('餐饮');
    expect(text).toContain('交通');
    expect(text).toContain('购物');
  });

  it('pressing a category calls onSelect with its id', () => {
    const onSelect = jest.fn();
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <CategoryGrid categories={MOCK_CATEGORIES} selectedId={null} onSelect={onSelect} />
      );
    });

    const item = root!.root.findByProps({ 'data-id': 1 });
    act(() => {
      item.props.onPress();
    });

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('when selectedId matches a primary category, its subcategories are shown as Tags', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <CategoryGrid categories={MOCK_CATEGORIES} selectedId={1} onSelect={jest.fn()} />
      );
    });

    const text = JSON.stringify(root!.toJSON());
    expect(text).toContain('早餐');
    expect(text).toContain('午餐');
    expect(root!.root.findByProps({ testID: 'subcategory-row' })).toBeTruthy();
  });

  it('pressing a subcategory Tag calls onSelect with the subcategory id', () => {
    const onSelect = jest.fn();
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <CategoryGrid categories={MOCK_CATEGORIES} selectedId={1} onSelect={onSelect} />
      );
    });

    const tag = root!.root.findByProps({ 'data-label': '早餐' });
    act(() => {
      tag.props.onPress();
    });

    expect(onSelect).toHaveBeenCalledWith(11);
  });

  it('when selectedId matches a subcategory, the parent subcategories are still shown', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <CategoryGrid categories={MOCK_CATEGORIES} selectedId={11} onSelect={jest.fn()} />
      );
    });

    const text = JSON.stringify(root!.toJSON());
    expect(text).toContain('早餐');
    expect(text).toContain('午餐');
    expect(root!.root.findByProps({ testID: 'subcategory-row' })).toBeTruthy();
  });

  it('when no category is selected, no subcategories are shown', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <CategoryGrid categories={MOCK_CATEGORIES} selectedId={null} onSelect={jest.fn()} />
      );
    });

    const text = JSON.stringify(root!.toJSON());
    expect(text).not.toContain('早餐');
    expect(text).not.toContain('午餐');
    expect(root!.root.findAllByProps({ testID: 'subcategory-row' })).toHaveLength(0);
  });
});
