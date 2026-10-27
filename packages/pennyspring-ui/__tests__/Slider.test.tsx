import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Slider } from '../src/Slider';

jest.mock('react-native-gesture-handler', () => {
  const ReactLocal = require('react');
  const ReactNative = require('react-native');
  type MockGestureHandler = (
    mockEvent?: unknown,
    mockSuccess?: boolean,
  ) => void;

  const createPanGesture = () => {
    const handlers: Record<string, MockGestureHandler> = {};
    const gesture = {
      __handlers: handlers,
      enabled: () => gesture,
      runOnJS: () => gesture,
      minDistance: () => gesture,
      onBegin: (handler: MockGestureHandler) => {
        handlers.onBegin = handler;
        return gesture;
      },
      onUpdate: (handler: MockGestureHandler) => {
        handlers.onUpdate = handler;
        return gesture;
      },
      onEnd: (handler: MockGestureHandler) => {
        handlers.onEnd = handler;
        return gesture;
      },
      onFinalize: (handler: MockGestureHandler) => {
        handlers.onFinalize = handler;
        return gesture;
      },
    };

    return gesture;
  };

  return {
    Gesture: {
      Pan: createPanGesture,
    },
    GestureDetector: ({
      children,
      gesture,
    }: {
      children: React.ReactNode;
      gesture: unknown;
    }) =>
      ReactLocal.createElement(
        ReactNative.View,
        {
          gesture,
          testID: 'slider-gesture-detector',
        },
        children,
      ),
  };
});

function renderSlider(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Slider {...props} /></>);
  });
  return testRenderer!;
}

function setupTrackWidth(testRenderer: renderer.ReactTestRenderer, width = 200) {
  const track = testRenderer.root.findByProps({
    testID: 'slider-track',
  });
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

function getGesture(testRenderer: renderer.ReactTestRenderer) {
  const detector = testRenderer.root.findByProps({
    testID: 'slider-gesture-detector',
  });
  return detector.props.gesture as {
    __handlers: Record<string, (event?: unknown) => void>;
  };
}

describe('Slider', () => {
  describe('gesture-handler integration', () => {
    it('renders with GestureDetector from react-native-gesture-handler', () => {
      const testRenderer = renderSlider();
      const detector = testRenderer.root.findByProps({
        testID: 'slider-gesture-detector',
      });
      expect(detector).toBeTruthy();
    });

    it('uses Pan gesture with onBegin, onUpdate, onEnd callbacks', () => {
      const testRenderer = renderSlider();
      const gesture = getGesture(testRenderer);
      expect(gesture.__handlers.onBegin).toBeDefined();
      expect(gesture.__handlers.onUpdate).toBeDefined();
      expect(gesture.__handlers.onEnd).toBeDefined();
    });
  });

  describe('uncontrolled mode', () => {
    it('updates value on pan gesture at track position', () => {
      const onChange = jest.fn();
      const testRenderer = renderSlider({
        defaultValue: 0,
        min: 0,
        max: 100,
        onChange,
      });
      setupTrackWidth(testRenderer);
      const gesture = getGesture(testRenderer);
      act(() => {
        gesture.__handlers.onBegin?.({ x: 100 });
        gesture.__handlers.onUpdate?.({ x: 100 });
        gesture.__handlers.onEnd?.({ x: 100 });
      });
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBeGreaterThanOrEqual(0);
      expect(lastCall[0]).toBeLessThanOrEqual(100);
    });

    it('initializes with defaultValue', () => {
      const onChange = jest.fn();
      const testRenderer = renderSlider({
        defaultValue: 50,
        min: 0,
        max: 100,
        onChange,
      });
      setupTrackWidth(testRenderer);
      const gesture = getGesture(testRenderer);
      act(() => {
        gesture.__handlers.onBegin?.({ x: 0 });
        gesture.__handlers.onUpdate?.({ x: 0 });
        gesture.__handlers.onEnd?.({ x: 0 });
      });
      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith(0);
    });
  });

  describe('controlled mode', () => {
    it('calls onChange when value is controlled', () => {
      const onChange = jest.fn();
      const testRenderer = renderSlider({
        value: 50,
        min: 0,
        max: 100,
        onChange,
      });
      setupTrackWidth(testRenderer);
      const gesture = getGesture(testRenderer);
      act(() => {
        gesture.__handlers.onBegin?.({ x: 0 });
        gesture.__handlers.onUpdate?.({ x: 0 });
        gesture.__handlers.onEnd?.({ x: 0 });
      });
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('disabled and readonly', () => {
    it('does not change when disabled', () => {
      const onChange = jest.fn();
      const testRenderer = renderSlider({
        disabled: true,
        onChange,
      });
      setupTrackWidth(testRenderer);
      const gesture = getGesture(testRenderer);
      act(() => {
        gesture.__handlers.onBegin?.({ x: 100 });
        gesture.__handlers.onUpdate?.({ x: 100 });
        gesture.__handlers.onEnd?.({ x: 100 });
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not change when readonly', () => {
      const onChange = jest.fn();
      const testRenderer = renderSlider({
        readonly: true,
        onChange,
      });
      setupTrackWidth(testRenderer);
      const gesture = getGesture(testRenderer);
      act(() => {
        gesture.__handlers.onBegin?.({ x: 100 });
        gesture.__handlers.onUpdate?.({ x: 100 });
        gesture.__handlers.onEnd?.({ x: 100 });
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('min, max and step', () => {
    it('snaps value to nearest step', () => {
      const onChange = jest.fn();
      const testRenderer = renderSlider({
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 25,
        onChange,
      });
      setupTrackWidth(testRenderer, 100);
      const gesture = getGesture(testRenderer);
      act(() => {
        gesture.__handlers.onBegin?.({ x: 40 });
        gesture.__handlers.onUpdate?.({ x: 40 });
        gesture.__handlers.onEnd?.({ x: 40 });
      });
      expect(onChange).toHaveBeenCalled();
      const calledValue = onChange.mock.calls[0][0];
      expect(calledValue % 25).toBe(0);
    });

    it('normalizes value when max is less than min', () => {
      const onChange = jest.fn();
      const testRenderer = renderSlider({
        defaultValue: 50,
        min: 100,
        max: 0,
        onChange,
      });
      setupTrackWidth(testRenderer, 200);
      const gesture = getGesture(testRenderer);
      act(() => {
        gesture.__handlers.onBegin?.({ x: 100 });
        gesture.__handlers.onUpdate?.({ x: 100 });
        gesture.__handlers.onEnd?.({ x: 100 });
      });
      expect(onChange).toHaveBeenCalled();
      const calledValue = onChange.mock.calls[0][0];
      expect(calledValue).toBeGreaterThanOrEqual(0);
      expect(calledValue).toBeLessThanOrEqual(100);
    });

    it('clamps value within min and max bounds', () => {
      const onChange = jest.fn();
      const testRenderer = renderSlider({
        defaultValue: 50,
        min: 10,
        max: 90,
        onChange,
      });
      setupTrackWidth(testRenderer, 200);
      const gesture = getGesture(testRenderer);
      act(() => {
        gesture.__handlers.onBegin?.({ x: 0 });
        gesture.__handlers.onUpdate?.({ x: 0 });
        gesture.__handlers.onEnd?.({ x: 0 });
      });
      expect(onChange).toHaveBeenCalled();
      const calledValue = onChange.mock.calls[0][0];
      expect(calledValue).toBeGreaterThanOrEqual(10);
      expect(calledValue).toBeLessThanOrEqual(90);
    });
  });

});
