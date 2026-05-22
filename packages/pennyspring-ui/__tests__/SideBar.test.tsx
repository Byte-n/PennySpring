import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SideBar } from '../src/SideBar';
import type { SideBarProps } from '../src/SideBar';

function renderSideBar(props: Partial<SideBarProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <>
        <SideBar
          items={[
            {
              value: 'overview',
              label: 'Overview',
            },
            {
              value: 'records',
              label: 'Records',
            },
            {
              value: 'trend',
              label: 'Trend',
            },
          ]}
          {...props}
        />
      </>,
    );
  });

  return testRenderer!;
}

function pressByValue(testRenderer: renderer.ReactTestRenderer, value: string | number) {
  const target = testRenderer.root.findByProps({
    testID: `sidebar-item-${String(value)}`,
  });

  act(() => {
    target.props.onPress();
  });

  return target;
}

describe('SideBar', () => {
  it('renders sidebar labels from items', () => {
    const testRenderer = renderSideBar();
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('Overview');
    expect(content).toContain('Records');
    expect(content).toContain('Trend');
  });

  it('updates uncontrolled value and calls onChange', () => {
    const onChange = jest.fn();
    const testRenderer = renderSideBar({
      defaultValue: 'overview',
      onChange,
    });

    pressByValue(testRenderer, 'records');

    expect(onChange).toHaveBeenCalledWith('records');
  });

  it('keeps selection controlled by value prop', () => {
    const onChange = jest.fn();
    const renderContent = jest.fn((item: { value: string | number }) => (
      <RNText>{`panel-${String(item.value)}`}</RNText>
    ));
    const testRenderer = renderSideBar({
      value: 'overview',
      onChange,
      renderContent,
    });

    pressByValue(testRenderer, 'records');
    const content = JSON.stringify(testRenderer.toJSON());

    expect(onChange).toHaveBeenCalledWith('records');
    expect(renderContent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 'overview',
      }),
      0,
    );
    expect(content).toContain('panel-overview');
  });

  it('blocks interaction when disabled at root or item level', () => {
    const onChange = jest.fn();
    const disabledSideBar = renderSideBar({
      disabled: true,
      onChange,
    });
    const itemDisabledSideBar = renderSideBar({
      onChange,
      items: [
        {
          value: 'overview',
          label: 'Overview',
        },
        {
          value: 'records',
          label: 'Records',
          disabled: true,
        },
      ],
    });

    pressByValue(disabledSideBar, 'records');
    const disabledItem = pressByValue(itemDisabledSideBar, 'records');

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledItem.props.disabled).toBe(true);
  });

  it('renders panel with active item content', () => {
    const renderContent = jest.fn((item: { value: string | number }) => (
      <RNText>{`panel-${String(item.value)}`}</RNText>
    ));
    const testRenderer = renderSideBar({
      defaultValue: 'overview',
      renderContent,
    });
    const content = JSON.stringify(testRenderer.toJSON());

    expect(renderContent).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'overview',
      }),
      0,
    );
    expect(content).toContain('panel-overview');
  });

  it('supports wrap layout and keeps item content from shrinking', () => {
    const testRenderer = renderSideBar({
      block: true,
      layout: 'wrap',
    });
    const sideBarList = testRenderer.root.findByProps({
      testID: 'sidebar-list',
    });
    const firstItem = testRenderer.root.findByProps({
      testID: 'sidebar-item-overview',
    });

    const listStyles = Array.isArray(sideBarList.props.style)
      ? sideBarList.props.style
      : [sideBarList.props.style];
    const firstItemStyleResult = firstItem.props.style({
      pressed: false,
    });
    const firstItemStyles = Array.isArray(firstItemStyleResult)
      ? firstItemStyleResult
      : [firstItemStyleResult];

    expect(
      listStyles.some(
        (style: { flexWrap?: string } | undefined) => style?.flexWrap === 'wrap',
      ),
    ).toBe(true);
    expect(
      firstItemStyles.some(
        (style: { flexShrink?: number } | undefined) => style?.flexShrink === 0,
      ),
    ).toBe(true);
  });

  it('supports horizontal scroll layout and keeps item content from shrinking', () => {
    const testRenderer = renderSideBar({
      layout: 'scroll',
      block: true,
    });
    const scrollList = testRenderer.root.findByProps({
      testID: 'sidebar-list-scroll',
    });
    const firstItem = testRenderer.root.findByProps({
      testID: 'sidebar-item-overview',
    });

    expect(scrollList.props.horizontal).toBe(true);

    const contentContainerStyles = Array.isArray(scrollList.props.contentContainerStyle)
      ? scrollList.props.contentContainerStyle
      : [scrollList.props.contentContainerStyle];
    const firstItemStyleResult = firstItem.props.style({
      pressed: false,
    });
    const firstItemStyles = Array.isArray(firstItemStyleResult)
      ? firstItemStyleResult
      : [firstItemStyleResult];

    expect(
      contentContainerStyles.some(
        (style: { flexWrap?: string } | undefined) => style?.flexWrap === 'nowrap',
      ),
    ).toBe(true);
    expect(
      firstItemStyles.some(
        (style: { flexShrink?: number } | undefined) => style?.flexShrink === 0,
      ),
    ).toBe(true);
  });
});
