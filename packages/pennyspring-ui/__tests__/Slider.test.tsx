import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Slider } from '../src/Slider';
function renderSlider(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Slider {...props} /></>);
  });
  return testRenderer!;
}
function setupTrackWidth(testRenderer: renderer.ReactTestRenderer, width = 200) {
  const track = testRenderer.root.findByProps({
    testID: 'slider-track'
  });
  act(() => {
    track.props.onLayout({
      nativeEvent: {
        layout: {
          width
        }
      }
    });
  });
  return track;
}
describe('Slider', () => {
  it('supports uncontrolled value change by track press', () => {
    const onChange = jest.fn();
    const testRenderer = renderSlider({
      defaultValue: 0,
      max: 100,
      min: 0,
      onChange
    });
    const track = setupTrackWidth(testRenderer);
    act(() => {
      track.props.onResponderRelease({
        nativeEvent: {
          locationX: 100
        }
      });
    });
    expect(onChange).toHaveBeenCalledWith(50);
  });
  it('does not change when disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledRenderer = renderSlider({
      disabled: true,
      onChange
    });
    const readonlyRenderer = renderSlider({
      readonly: true,
      onChange
    });
    const disabledTrack = setupTrackWidth(disabledRenderer);
    const readonlyTrack = setupTrackWidth(readonlyRenderer);
    act(() => {
      disabledTrack.props.onResponderGrant({
        nativeEvent: {
          locationX: 100
        }
      });
      readonlyTrack.props.onResponderMove({
        nativeEvent: {
          locationX: 100
        }
      });
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
