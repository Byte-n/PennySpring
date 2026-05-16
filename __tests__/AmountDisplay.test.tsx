import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AmountDisplay } from '../src/screens/addRecord/components/AmountDisplay';
import { AddRecordProvider } from '../src/screens/addRecord/AddRecordContext';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: (fn: Function) => () => {
    const token = new Proxy({}, { get: () => 0 });
    return fn(token, {});
  },
}));

jest.mock('../packages/component', () => {
  const ReactLocal = require('react');
  const { View, Text } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => ReactLocal.createElement(Text, props, children),
    Column: ({ children, ...props }: any) => ReactLocal.createElement(View, props, children),
    CalculatorInput: Object.assign(
      (props: any) => ReactLocal.createElement(View, props),
      {
        Popup: ({ open, onOk, ...props }: any) =>
          ReactLocal.createElement(View, { ...props, testID: 'calc-popup', open, onOk }),
      }
    ),
  };
});

describe('AmountDisplay', () => {
  it('renders "¥ 0.00" when amount is 0', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <AddRecordProvider>
          <AmountDisplay />
        </AddRecordProvider>
      );
    });
    const tree = testRenderer!.root;
    const texts = tree.findAllByProps({ testID: 'amount-text' });
    expect(texts[0].props.children).toBe('¥ 0.00');
  });

  it('renders "¥ 15.00" when amount is 1500', () => {
    let testRenderer: renderer.ReactTestRenderer;
    const TestWrapper = () => {
      const { useAddRecordContext } = require('../src/screens/addRecord/AddRecordContext');
      const { setAmount } = useAddRecordContext();
      React.useEffect(() => {
        setAmount(1500);
      }, []);
      return <AmountDisplay />;
    };

    act(() => {
      testRenderer = renderer.create(
        <AddRecordProvider>
          <TestWrapper />
        </AddRecordProvider>
      );
    });

    const tree = testRenderer!.root;
    const texts = tree.findAllByProps({ testID: 'amount-text' });
    expect(texts[0].props.children).toBe('¥ 15.00');
  });

  it('pressing the amount area triggers popup open', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <AddRecordProvider>
          <AmountDisplay />
        </AddRecordProvider>
      );
    });
    const tree = testRenderer!.root;
    const pressable = tree.findByProps({ testID: 'amount-pressable' });

    act(() => {
      pressable.props.onPress();
    });

    const popup = tree.findByProps({ testID: 'calc-popup' });
    expect(popup.props.open).toBe(true);
  });

  it('onOk from popup updates amount (result=25.5 → 2550)', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <AddRecordProvider>
          <AmountDisplay />
        </AddRecordProvider>
      );
    });
    const tree = testRenderer!.root;
    const pressable = tree.findByProps({ testID: 'amount-pressable' });

    act(() => {
      pressable.props.onPress();
    });

    act(() => {
      const popup = tree.findByProps({ testID: 'calc-popup' });
      popup.props.onOk({ expression: '25.5', result: 25.5 });
    });

    const texts = tree.findAllByProps({ testID: 'amount-text' });
    expect(texts[0].props.children).toBe('¥ 25.50');
  });
});
