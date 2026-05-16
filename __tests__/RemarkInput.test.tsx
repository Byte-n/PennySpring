import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { RemarkInput } from '../src/screens/addRecord/components/RemarkInput';
import { AddRecordProvider } from '../src/screens/addRecord/AddRecordContext';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: (fn: Function) => () => {
    const token = new Proxy({}, { get: () => 0 });
    return fn(token, {});
  },
}));

jest.mock('../packages/component', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return {
    Input: ({ value, onChangeText, placeholder, ...props }: any) =>
      React.createElement(TextInput, { value, onChangeText, placeholder, ...props, testID: 'remark-input' }),
  };
});

describe('RemarkInput', () => {
  test('renders Input with value from context remark', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <AddRecordProvider>
          <RemarkInput />
        </AddRecordProvider>
      );
    });

    const input = root!.root.findByProps({ testID: 'remark-input' });
    expect(input.props.value).toBe('');
  });

  test('onChangeText calls setRemark', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <AddRecordProvider>
          <RemarkInput />
        </AddRecordProvider>
      );
    });

    const input = root!.root.findByProps({ testID: 'remark-input' });
    act(() => {
      input.props.onChangeText('测试备注');
    });

    expect(input.props.value).toBe('测试备注');
  });

  test('placeholder is "添加备注"', () => {
    let root: renderer.ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <AddRecordProvider>
          <RemarkInput />
        </AddRecordProvider>
      );
    });

    const input = root!.root.findByProps({ testID: 'remark-input' });
    expect(input.props.placeholder).toBe('添加备注');
  });
});
