import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SwipeAction } from '../src/SwipeAction';
import type { SwipeActionAction, SwipeActionRef } from '../src/SwipeAction';
function renderSwipeAction(props: Partial<React.ComponentProps<typeof SwipeAction>> = {}) {
  const leftActions: SwipeActionAction[] = [{
    key: 'left-archive',
    text: 'Archive'
  }];
  const rightActions: SwipeActionAction[] = [{
    key: 'right-delete',
    text: 'Delete'
  }];
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><SwipeAction leftActions={leftActions} rightActions={rightActions} {...props}>
          <View testID="swipe-action-child" />
        </SwipeAction></>);
  });
  return testRenderer!;
}
function setupActionWidth(testRenderer: renderer.ReactTestRenderer, options: {
  leftWidth?: number;
  rightWidth?: number;
} = {}): void {
  const leftActions = testRenderer.root.findByProps({
    testID: 'swipe-action-left-actions'
  });
  const rightActions = testRenderer.root.findByProps({
    testID: 'swipe-action-right-actions'
  });
  act(() => {
    leftActions.props.onLayout({
      nativeEvent: {
        layout: {
          width: options.leftWidth ?? 80
        }
      }
    });
    rightActions.props.onLayout({
      nativeEvent: {
        layout: {
          width: options.rightWidth ?? 80
        }
      }
    });
  });
}
function swipeRow(testRenderer: renderer.ReactTestRenderer, options: {
  startX: number;
  endX: number;
  pageY?: number;
}): void {
  const root = testRenderer.root.findByProps({
    testID: 'swipe-action-root'
  });
  const pageY = options.pageY ?? 0;
  act(() => {
    root.props.onResponderGrant({
      nativeEvent: {
        pageX: options.startX,
        pageY
      }
    });
    root.props.onResponderMove({
      nativeEvent: {
        pageX: options.endX,
        pageY
      }
    });
    root.props.onResponderRelease({
      nativeEvent: {
        pageX: options.endX,
        pageY
      }
    });
  });
}
function getTrackTranslateX(testRenderer: renderer.ReactTestRenderer): number {
  const track = testRenderer.root.findByProps({
    testID: 'swipe-action-track'
  });
  const styleList = track.props.style as Array<Record<string, unknown>>;
  const transformStyle = styleList.find(style => style.transform !== undefined);
  if (transformStyle === undefined) {
    return 0;
  }
  const transformList = transformStyle.transform as Array<Record<string, number>>;
  const translateStyle = transformList.find(style => style.translateX !== undefined);
  return translateStyle?.translateX ?? 0;
}
describe('SwipeAction', () => {
  it('keeps track at zero offset by default', () => {
    const testRenderer = renderSwipeAction();
    setupActionWidth(testRenderer);
    expect(getTrackTranslateX(testRenderer)).toBe(0);
  });
  it('reveals right actions when swiping left in uncontrolled mode', () => {
    const onActionsReveal = jest.fn();
    const onChange = jest.fn();
    const testRenderer = renderSwipeAction({
      defaultValue: null,
      onActionsReveal,
      onChange
    });
    setupActionWidth(testRenderer, {
      rightWidth: 80
    });
    swipeRow(testRenderer, {
      startX: 100,
      endX: 20
    });
    expect(onActionsReveal).toHaveBeenCalledWith('right');
    expect(onChange).toHaveBeenCalledWith('right');
    expect(getTrackTranslateX(testRenderer)).toBe(-80);
  });
  it('keeps controlled value from props while still reporting changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderSwipeAction({
      onChange,
      value: 'left'
    });
    setupActionWidth(testRenderer, {
      leftWidth: 60,
      rightWidth: 80
    });
    swipeRow(testRenderer, {
      startX: 120,
      endX: -20
    });
    expect(onChange).toHaveBeenCalledWith('right');
    expect(getTrackTranslateX(testRenderer)).toBe(60);
  });
  it('fires action callbacks and closes by default after action press', () => {
    const actionPress = jest.fn();
    const onAction = jest.fn();
    const onChange = jest.fn();
    const testRenderer = renderSwipeAction({
      onAction,
      onChange,
      rightActions: [{
        key: 'delete',
        onPress: actionPress,
        text: 'Delete'
      }]
    });
    setupActionWidth(testRenderer, {
      rightWidth: 80
    });
    swipeRow(testRenderer, {
      startX: 100,
      endX: 20
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0'
    });
    act(() => {
      action.props.onPress();
    });
    expect(actionPress).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({
      key: 'delete'
    }), 0, 'right');
    expect(onChange).toHaveBeenNthCalledWith(2, null);
    expect(getTrackTranslateX(testRenderer)).toBe(0);
  });
  it('keeps open state after action press when closeOnAction is false', () => {
    const onChange = jest.fn();
    const testRenderer = renderSwipeAction({
      closeOnAction: false,
      onChange
    });
    setupActionWidth(testRenderer, {
      rightWidth: 80
    });
    swipeRow(testRenderer, {
      startX: 100,
      endX: 20
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0'
    });
    act(() => {
      action.props.onPress();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(getTrackTranslateX(testRenderer)).toBe(-80);
  });
  it('fires onCancel before onChange when tapping content while opened', () => {
    const calls: string[] = [];
    const testRenderer = renderSwipeAction({
      defaultValue: 'right',
      onCancel: () => {
        calls.push('cancel');
      },
      onChange: nextValue => {
        calls.push(`change:${String(nextValue)}`);
      }
    });
    setupActionWidth(testRenderer, {
      rightWidth: 80
    });
    const content = testRenderer.root.findByProps({
      testID: 'swipe-action-content'
    });
    act(() => {
      content.props.onResponderRelease();
    });
    expect(calls).toEqual(['cancel', 'change:null']);
    expect(getTrackTranslateX(testRenderer)).toBe(0);
  });
  it('supports imperative show and close by ref', () => {
    const ref = React.createRef<SwipeActionRef>();
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><SwipeAction leftActions={[{
          key: 'left',
          text: 'Left'
        }]} ref={ref} rightActions={[{
          key: 'right',
          text: 'Right'
        }]}>
            <View testID="swipe-action-child" />
          </SwipeAction></>);
    });
    setupActionWidth(testRenderer!, {
      leftWidth: 70,
      rightWidth: 90
    });
    act(() => {
      ref.current?.show('left');
    });
    expect(getTrackTranslateX(testRenderer!)).toBe(70);
    act(() => {
      ref.current?.show();
    });
    expect(getTrackTranslateX(testRenderer!)).toBe(-90);
    act(() => {
      ref.current?.close();
    });
    expect(getTrackTranslateX(testRenderer!)).toBe(0);
  });
});
