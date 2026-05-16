import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ExpenseTabScreen } from '../src/screens/addRecord/tabs/ExpenseTabScreen';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: (fn: Function) => () => {
    const token = new Proxy({}, { get: () => 0 });
    return fn(token, {});
  },
  useTheme: () => ({ token: new Proxy({}, { get: () => 0 }) }),
}));

jest.mock('../src/screens/addRecord/components/AmountDisplay', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');
  return { AmountDisplay: () => ReactLocal.createElement(View, { testID: 'amount-display' }) };
});

jest.mock('../src/screens/addRecord/components/FieldChips', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');
  return { FieldChips: (props: any) => ReactLocal.createElement(View, { testID: 'field-chips', ...props }) };
});

jest.mock('../src/screens/addRecord/components/CategoryGrid', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');
  return { CategoryGrid: (props: any) => ReactLocal.createElement(View, { testID: 'category-grid', ...props }) };
});

jest.mock('../src/screens/addRecord/components/RemarkInput', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');
  return { RemarkInput: () => ReactLocal.createElement(View, { testID: 'remark-input' }) };
});

jest.mock('../src/screens/addRecord/AddRecordContext', () => {
  const ReactLocal = require('react');
  return {
    AddRecordProvider: ({ children }: any) => ReactLocal.createElement(ReactLocal.Fragment, null, children),
    useAddRecordContext: () => ({
      amount: 0, setAmount: jest.fn(),
      remark: '', setRemark: jest.fn(),
      recordTime: Date.now(), setRecordTime: jest.fn(),
      tags: [], setTags: jest.fn(),
      images: [], setImages: jest.fn(),
    }),
  };
});

jest.mock('../packages/component', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');
  return {
    Column: ({ children, ...props }: any) => ReactLocal.createElement(View, props, children),
  };
});

describe('ExpenseTabScreen', () => {
  it('renders AmountDisplay component', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<ExpenseTabScreen />);
    });

    const tree = testRenderer!.root;
    const amountDisplay = tree.findByProps({ testID: 'amount-display' });
    expect(amountDisplay).toBeTruthy();
  });

  it('renders FieldChips with tabType="expense"', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<ExpenseTabScreen />);
    });

    const tree = testRenderer!.root;
    const fieldChips = tree.findByProps({ testID: 'field-chips' });
    expect(fieldChips).toBeTruthy();
    expect(fieldChips.props.tabType).toBe('expense');
  });

  it('renders CategoryGrid', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<ExpenseTabScreen />);
    });

    const tree = testRenderer!.root;
    const categoryGrid = tree.findByProps({ testID: 'category-grid' });
    expect(categoryGrid).toBeTruthy();
  });

  it('renders RemarkInput', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<ExpenseTabScreen />);
    });

    const tree = testRenderer!.root;
    const remarkInput = tree.findByProps({ testID: 'remark-input' });
    expect(remarkInput).toBeTruthy();
  });

  it('FieldChips receives reimbursable prop as boolean', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<ExpenseTabScreen />);
    });

    const tree = testRenderer!.root;
    const fieldChips = tree.findByProps({ testID: 'field-chips' });
    expect(typeof fieldChips.props.reimbursable).toBe('boolean');
  });
});
