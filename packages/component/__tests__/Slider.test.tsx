import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Slider } from '../src/Slider';

const token = formatToken(derivative(defaultSeedToken, false));

function renderSlider(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Slider {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function setupTrackWidth(testRenderer: renderer.ReactTestRenderer, width = 200) {
  const track = testRenderer.root.findByProps({ testID: 'slider-track' });

  act(() => {
    track.props.onLayout({
      nativeEvent: {
        layout: {
          width,
        },
      },
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
      onChange,
    });
    const track = setupTrackWidth(testRenderer);

    act(() => {
      track.props.onResponderRelease({
        nativeEvent: {
          locationX: 100,
        },
      });
    });

    expect(onChange).toHaveBeenCalledWith(50);
  });

  it('keeps controlled value from props', () => {
    const onChange = jest.fn();
    const testRenderer = renderSlider({
      value: 20,
      onChange,
    });
    const track = setupTrackWidth(testRenderer);

    act(() => {
      track.props.onResponderMove({
        nativeEvent: {
          locationX: 100,
        },
      });
    });

    expect(onChange).toHaveBeenCalledWith(50);
    const fill = testRenderer.root.findByProps({ testID: 'slider-track-fill' });

    expect(fill.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: '20%' })]),
    );
  });

  it('does not change when disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledRenderer = renderSlider({
      disabled: true,
      onChange,
    });
    const readonlyRenderer = renderSlider({
      readonly: true,
      onChange,
    });
    const disabledTrack = setupTrackWidth(disabledRenderer);
    const readonlyTrack = setupTrackWidth(readonlyRenderer);

    act(() => {
      disabledTrack.props.onResponderGrant({
        nativeEvent: {
          locationX: 100,
        },
      });
      readonlyTrack.props.onResponderMove({
        nativeEvent: {
          locationX: 100,
        },
      });
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies size token mapping to root minHeight', () => {
    const small = renderSlider({ size: 'small' });
    const normal = renderSlider({ size: 'normal' });
    const large = renderSlider({ size: 'large' });

    expect(small.root.findByProps({ testID: 'slider-track' }).parent?.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ minHeight: token.controlHeightSM })]),
    );
    expect(normal.root.findByProps({ testID: 'slider-track' }).parent?.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ minHeight: token.controlHeight })]),
    );
    expect(large.root.findByProps({ testID: 'slider-track' }).parent?.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ minHeight: token.controlHeightLG })]),
    );
  });
});
