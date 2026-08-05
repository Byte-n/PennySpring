import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('react-native-gesture-handler', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    GestureHandlerRootView: ({ children }: { children?: React.ReactNode }) => (
      <ReactNative.View>{children}</ReactNative.View>
    ),
  };
});

jest.mock('react-native-reanimated', () => {
  const ReactModule = require('react');
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    createAnimatedComponent: (Component: React.ComponentType<Record<string, unknown>>) =>
      (props: Record<string, unknown>) => ReactModule.createElement(Component, props),
    Easing: {
      bezier: jest.fn(() => (value: number) => value),
    },
    interpolate: (value: number) => value,
    runOnJS: jest.fn(fn => fn),
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: jest.fn((value: number, _config: unknown, callback?: (finished: boolean) => void) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    }),
  };
});

import {
  Cascader,
  type CascaderOption,
} from '../src/Cascader';
import { Icon } from '../src/Icon';
import { Row } from '../src/Row';

interface RegionData {
  code: string;
}

function getTagCloseButtons(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root
    .findAllByProps({ testID: 'tag-close' })
    .filter(item => typeof item.props.onPress === 'function');
}

const options: Array<CascaderOption<RegionData>> = [
  {
    value: 'zhejiang',
    labelText: 'Zhejiang',
    data: { code: 'zj' },
    children: [
      {
        value: 'hangzhou',
        labelText: 'Hangzhou',
        data: { code: 'hz' },
      },
      {
        value: 'ningbo',
        labelText: 'Ningbo',
        data: { code: 'nb' },
      },
    ],
  },
  {
    value: 'guangdong',
    labelText: 'Guangdong',
    data: { code: 'gd' },
    children: [
      {
        value: 'guangzhou',
        labelText: 'Guangzhou',
        data: { code: 'gz' },
      },
    ],
  },
];

describe('Cascader', () => {
  it('renders Cascader.View with tabs and root options', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader.View options={options} tabPlaceholderText="Select" />,
      );
    });

    const tree = JSON.stringify(testRenderer!.toJSON());

    expect(tree).toContain('Select');
    expect(tree).toContain('Zhejiang');
    expect(tree).toContain('Guangdong');

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('selects a parent option and switches list to the next level', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader.View options={options} onChange={onChange} />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-0-0' })
        .props.onPress();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang']);
    expect(params.level).toBe(0);
    expect(params.optionIndex).toBe(0);
    expect(params.isLeaf).toBe(false);

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree).toContain('Hangzhou');
    expect(tree).toContain('Ningbo');

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('renders selected and unselected markers with Icon components', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader.View
          defaultValue={['zhejiang']}
          defaultActiveLevel={0}
          options={options}
        />,
      );
    });

    const markerIcons = testRenderer!.root.findAllByType(Icon);
    expect(markerIcons).toHaveLength(2);
    expect(markerIcons[0].props.testID).toBe('cascader-option-marker-selected');
    expect(markerIcons[1].props.testID).toBe('cascader-option-marker-unselected');

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree).not.toContain('[x]');
    expect(tree).not.toContain('[ ]');

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('selects a leaf option and returns full path with isLeaf=true', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader.View
          defaultValue={['zhejiang']}
          options={options}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-1-0' })
        .props.onPress();
    });

    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang', 'hangzhou']);
    expect(params.level).toBe(1);
    expect(params.isLeaf).toBe(true);
    expect(params.path.map((item: CascaderOption<RegionData>) => item.value)).toEqual([
      'zhejiang',
      'hangzhou',
    ]);

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('opens on trigger press and closes on leaf selection by default', () => {
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader options={options} onOpenChange={onOpenChange} labelText="Pick" />,
      );
    });

    act(() => {
      testRenderer!.root.findByProps({ testID: 'cascader-trigger' }).props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-0-0' })
        .props.onPress();
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-1-0' })
        .props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'select' });
    expect(() => testRenderer!.root.findByProps({ testID: 'floating-panel-root' })).toThrow();

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('keeps popup open when closeOnSelectLeaf is false', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader closeOnSelectLeaf={false} options={options} defaultOpen />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-0-0' })
        .props.onPress();
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-1-0' })
        .props.onPress();
    });

    expect(testRenderer!.root.findByProps({ testID: 'floating-panel-root' })).toBeTruthy();

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('calls onChange when removing a tag in uncontrolled mode', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader
          defaultValue={['zhejiang', 'hangzhou']}
          displayMode="tag"
          onChange={onChange}
          options={options}
        />,
      );
    });

    act(() => {
      getTagCloseButtons(testRenderer!)[1].props.onPress();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang']);
    expect(params.value).toBe('hangzhou');
    expect(params.level).toBe(1);

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('calls onChange when removing a tag in controlled mode', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader
          value={['zhejiang', 'hangzhou']}
          displayMode="tag"
          onChange={onChange}
          options={options}
        />,
      );
    });

    act(() => {
      getTagCloseButtons(testRenderer!)[1].props.onPress();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang']);
    expect(params.value).toBe('hangzhou');
    expect(params.level).toBe(1);
    expect(params.path.map((item: CascaderOption<RegionData>) => item.value)).toEqual([
      'zhejiang',
    ]);

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('uses Text semantic props for trigger and option labels', () => {
    let triggerRenderer: renderer.ReactTestRenderer;
    let viewRenderer: renderer.ReactTestRenderer;

    act(() => {
      triggerRenderer = renderer.create(
        <Cascader
          defaultValue={['zhejiang']}
          options={options}
          labelText="Pick"
        />,
      );
    });

    act(() => {
      viewRenderer = renderer.create(
        <Cascader.View
          defaultActiveLevel={1}
          defaultValue={['zhejiang', 'hangzhou']}
          options={options}
        />,
      );
    });

    const selectedLabel = triggerRenderer!.root.findByProps({ testID: 'cascader-trigger-value' });
    expect(selectedLabel.props.size).toBe('lg');
    expect(selectedLabel.props.color).toBe('default');

    const optionLabel = viewRenderer!.root.findByProps({ testID: 'cascader-option-label-1-1' });
    expect(optionLabel.props.size).toBe('lg');
    expect(optionLabel.props.color).toBe('default');

    const selectedOptionLabel = viewRenderer!.root.findByProps({
      testID: 'cascader-option-label-1-0',
    });
    expect(selectedOptionLabel.props.color).toBe('primaryText');
    expect(selectedOptionLabel.props.weight).toBe('strong');

    act(() => {
      triggerRenderer!.unmount();
      viewRenderer!.unmount();
    });
  });

  it('uses Row primitives for trigger and option layouts', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader defaultOpen defaultValue={['zhejiang']} options={options} />,
      );
    });

    const rows = testRenderer!.root.findAllByType(Row);
    const rowTestIds = rows.map(item => item.props.testID);

    expect(rowTestIds).toContain('cascader-trigger-row');
    expect(rowTestIds).toContain('cascader-option-row');

    act(() => {
      testRenderer!.unmount();
    });
  });
});
