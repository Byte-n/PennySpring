import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FieldChips } from '../src/screens/addRecord/components/FieldChips';
import { AddRecordProvider } from '../src/screens/addRecord/AddRecordContext';
import { Alert } from 'react-native';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: (fn: Function) => () => {
    const token = new Proxy({}, { get: () => 0 });
    return fn(token, {});
  },
}));

jest.mock('../packages/component', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  return {
    Row: ({ children, ...props }: any) => React.createElement(View, props, children),
    Tag: ({ children, onPress, variant, ...props }: any) =>
      React.createElement(
        Pressable,
        { onPress, ...props, 'data-variant': variant, 'data-label': children },
        React.createElement(Text, null, children)
      ),
  };
});

jest.spyOn(Alert, 'alert');

describe('FieldChips', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders expense tab chips correctly', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <AddRecordProvider>
          <FieldChips tabType="expense" />
        </AddRecordProvider>
      );
    });

    const instance = root!.toJSON();
    const text = JSON.stringify(instance);
    expect(text).toContain('资产');
    expect(text).toContain('可报销');
    expect(text).toContain('标签');
    expect(text).toContain('图片');
  });

  it('renders income tab chips correctly', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <AddRecordProvider>
          <FieldChips tabType="income" />
        </AddRecordProvider>
      );
    });

    const instance = root!.toJSON();
    const text = JSON.stringify(instance);
    expect(text).toContain('资产');
    expect(text).toContain('标签');
    expect(text).toContain('图片');
    expect(text).not.toContain('可报销');
  });

  it('renders transfer tab chips correctly', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <AddRecordProvider>
          <FieldChips tabType="transfer" />
        </AddRecordProvider>
      );
    });

    const instance = root!.toJSON();
    const text = JSON.stringify(instance);
    expect(text).toContain('转出资产');
    expect(text).toContain('转入资产');
    expect(text).toContain('手续费');
    expect(text).toContain('标签');
    expect(text).toContain('图片');
    expect(text).not.toContain('可报销');
  });

  it('calls onReimbursableToggle when 可报销 chip is pressed', () => {
    const onReimbursableToggle = jest.fn();
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <AddRecordProvider>
          <FieldChips tabType="expense" onReimbursableToggle={onReimbursableToggle} />
        </AddRecordProvider>
      );
    });

    const chip = root!.root.findByProps({ 'data-label': '可报销' });

    act(() => {
      chip.props.onPress();
    });

    expect(onReimbursableToggle).toHaveBeenCalledTimes(1);
  });

  it('shows Alert when 图片 chip is pressed', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <AddRecordProvider>
          <FieldChips tabType="expense" />
        </AddRecordProvider>
      );
    });

    const chip = root!.root.findByProps({ 'data-label': '图片' });

    act(() => {
      chip.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith('提示', '等待开发');
  });

  it('changes 可报销 chip variant based on reimbursable prop', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <AddRecordProvider>
          <FieldChips tabType="expense" reimbursable={false} />
        </AddRecordProvider>
      );
    });

    let chip = root!.root.findByProps({ 'data-label': '可报销' });
    expect(chip.props['data-variant']).toBe('outlined');

    act(() => {
      root!.update(
        <AddRecordProvider>
          <FieldChips tabType="expense" reimbursable={true} />
        </AddRecordProvider>
      );
    });

    chip = root!.root.findByProps({ 'data-label': '可报销' });
    expect(chip.props['data-variant']).toBe('solid');
  });
});
