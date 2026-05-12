import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Steps } from '../src/Steps';
import type { StepsProps } from '../src/Steps';

function renderSteps(props: Partial<StepsProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <>
        <Steps
          items={[
            {
              titleText: 'Start',
              descriptionText: 'Create plan',
            },
            {
              titleText: 'Verify',
              descriptionText: 'Review change',
            },
            {
              titleText: 'Done',
              descriptionText: 'Ship release',
            },
          ]}
          {...props}
        />
      </>,
    );
  });

  return testRenderer!;
}

function pressStep(testRenderer: renderer.ReactTestRenderer, index: number) {
  const target = testRenderer.root.findByProps({
    testID: `steps-item-${index}`,
  });

  act(() => {
    target.props.onPress();
  });

  return target;
}

function getStepSelectedState(testRenderer: renderer.ReactTestRenderer, index: number) {
  const target = testRenderer.root.findByProps({
    testID: `steps-item-${index}`,
  });

  return target.props.accessibilityState?.selected;
}

describe('Steps', () => {
  it('renders title and description text from items', () => {
    const testRenderer = renderSteps();
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('Start');
    expect(content).toContain('Create plan');
    expect(content).toContain('Verify');
    expect(content).toContain('Done');
  });

  it('updates uncontrolled value and calls onChange', () => {
    const onChange = jest.fn();
    const testRenderer = renderSteps({
      defaultValue: 0,
      onChange,
    });

    expect(getStepSelectedState(testRenderer, 0)).toBe(true);

    pressStep(testRenderer, 2);

    expect(onChange).toHaveBeenCalledWith(2);
    expect(getStepSelectedState(testRenderer, 2)).toBe(true);
  });

  it('keeps selected step controlled by value prop', () => {
    const onChange = jest.fn();
    const testRenderer = renderSteps({
      value: 0,
      onChange,
    });

    pressStep(testRenderer, 1);

    expect(onChange).toHaveBeenCalledWith(1);
    expect(getStepSelectedState(testRenderer, 0)).toBe(true);
    expect(getStepSelectedState(testRenderer, 1)).toBe(false);
  });

  it('blocks interaction when disabled, readonly, or item disabled', () => {
    const onChange = jest.fn();
    const disabledSteps = renderSteps({
      disabled: true,
      onChange,
    });
    const readonlySteps = renderSteps({
      readonly: true,
      onChange,
    });
    const itemDisabledSteps = renderSteps({
      onChange,
      items: [
        {
          titleText: 'Start',
        },
        {
          titleText: 'Verify',
          disabled: true,
        },
      ],
    });

    pressStep(disabledSteps, 1);
    pressStep(readonlySteps, 1);
    const disabledItem = pressStep(itemDisabledSteps, 1);

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledItem.props.disabled).toBe(true);
  });

  it('does not call onChange when pressing selected step', () => {
    const onChange = jest.fn();
    const testRenderer = renderSteps({
      defaultValue: 1,
      onChange,
    });

    pressStep(testRenderer, 1);

    expect(onChange).not.toHaveBeenCalled();
  });
});
