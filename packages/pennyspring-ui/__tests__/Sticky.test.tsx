import React from 'react';
import { ScrollView, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Sticky, StickyLayout } from '../src/Sticky';

describe('Sticky', () => {
  it('keeps sticky content in the viewport overlay while reserving content space', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <StickyLayout testID="sticky-layout">
          <ScrollView testID="sticky-scroll-view">
            <View />
            <Sticky placement="top">
              <RNText>筛选</RNText>
            </Sticky>
            <View />
          </ScrollView>
        </StickyLayout>,
      );
    });

    expect(testRenderer!.root.findByType(ScrollView)).toBeDefined();
    expect(
      testRenderer!.root.findByProps({ testID: 'sticky-placeholder' }),
    ).toBeDefined();
    expect(
      testRenderer!.root.findByProps({ testID: 'sticky-overlay' }),
    ).toBeDefined();
    expect(
      testRenderer!.root
        .findAllByType(RNText)
        .some(text => text.props.children === '筛选'),
    ).toBe(true);
    expect(
      testRenderer!.root.findByProps({ testID: 'sticky-placeholder' }).props
        .children,
    ).toBeDefined();
  });

  it('notifies when a bottom item enters and leaves the pinned range', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <StickyLayout testID="sticky-layout">
          <ScrollView testID="sticky-scroll-view">
            <View />
            <Sticky onChange={onChange} placement="bottom">
              <RNText>保存</RNText>
            </Sticky>
          </ScrollView>
        </StickyLayout>,
      );
    });

    const root = testRenderer!.root;
    const viewport = root
      .findAllByType(View)
      .find(view => view.props.testID === 'sticky-layout');
    const placeholder = root.findByProps({ testID: 'sticky-placeholder' });

    act(() => {
      viewport!.props.onLayout({
        nativeEvent: { layout: { x: 0, y: 0, width: 320, height: 400 } },
      });
      placeholder.props.onLayout({
        nativeEvent: { layout: { x: 0, y: 500, width: 320, height: 44 } },
      });
      root.findByProps({ testID: 'sticky-overlay' }).props.onLayout({
        nativeEvent: { layout: { x: 0, y: 0, width: 320, height: 44 } },
      });
    });

    act(() => {
      root.findByType(ScrollView).props.onScroll({
        nativeEvent: { contentOffset: { y: 0 } },
      });
    });
    expect(onChange).toHaveBeenLastCalledWith(true);

    act(() => {
      root.findByType(ScrollView).props.onScroll({
        nativeEvent: { contentOffset: { y: 200 } },
      });
    });
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('preserves the business scroll view onScroll handler', () => {
    const onScroll = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <StickyLayout>
          <ScrollView onScroll={onScroll}>
            <Sticky>
              <RNText>内容</RNText>
            </Sticky>
          </ScrollView>
        </StickyLayout>,
      );
    });

    const event = { nativeEvent: { contentOffset: { y: 12 } } };
    act(() => {
      testRenderer!.root.findByType(ScrollView).props.onScroll(event);
    });

    expect(onScroll).toHaveBeenCalledWith(event);
  });

  it('renders children directly when no sticky viewport is available', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Sticky>
          <RNText>普通内容</RNText>
        </Sticky>,
      );
    });

    expect(testRenderer!.root.findByType(RNText).props.children).toBe(
      '普通内容',
    );
    expect(
      testRenderer!.root.findAllByProps({ testID: 'sticky-placeholder' }),
    ).toHaveLength(0);
  });

  it('keeps disabled sticky content visible in its natural position', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <StickyLayout>
          <ScrollView>
            <Sticky disabled placement="bottom">
              <RNText>仍然可见</RNText>
            </Sticky>
          </ScrollView>
        </StickyLayout>,
      );
    });

    const root = testRenderer!.root;
    const viewport = root
      .findAllByType(View)
      .find(view => view.props.testID === 'sticky-layout');
    const placeholder = root.findByProps({ testID: 'sticky-placeholder' });
    const overlay = root.findByProps({ testID: 'sticky-overlay' });

    act(() => {
      viewport!.props.onLayout({
        nativeEvent: { layout: { x: 0, y: 0, width: 320, height: 400 } },
      });
      placeholder.props.onLayout({
        nativeEvent: { layout: { x: 0, y: 180, width: 320, height: 44 } },
      });
      overlay.props.onLayout({
        nativeEvent: { layout: { x: 0, y: 0, width: 320, height: 44 } },
      });
    });

    expect(overlay.props.style.opacity).toBe(1);
    expect(overlay.props.style.position).toBe('absolute');
    expect(overlay.props.style.top).toBe(180);
  });
});
