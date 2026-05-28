import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
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

    pressStep(testRenderer, 2);

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('keeps selected step controlled by value prop', () => {
    const onChange = jest.fn();
    const testRenderer = renderSteps({
      value: 0,
      onChange,
    });

    pressStep(testRenderer, 1);

    expect(onChange).toHaveBeenCalledWith(1);
    // Pressing the currently selected step (0) should not trigger onChange
    onChange.mockClear();
    pressStep(testRenderer, 0);
    expect(onChange).not.toHaveBeenCalled();
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

  it('does not render title when title is null even if titleText is set', () => {
    const testRenderer = renderSteps({
      items: [
        {
          title: null,
          titleText: 'Should Not Appear',
          descriptionText: 'Visible Description',
        },
      ],
    });
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).not.toContain('Should Not Appear');
    expect(content).toContain('Visible Description');
  });

  it('does not render description when description is null even if descriptionText is set', () => {
    const testRenderer = renderSteps({
      items: [
        {
          titleText: 'Visible Title',
          description: null,
          descriptionText: 'Should Not Appear',
        },
      ],
    });
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('Visible Title');
    expect(content).not.toContain('Should Not Appear');
  });

  it('renders title and description when title/description are undefined and text props are set', () => {
    const testRenderer = renderSteps({
      items: [
        {
          titleText: 'Fallback Title',
          descriptionText: 'Fallback Description',
        },
      ],
    });
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('Fallback Title');
    expect(content).toContain('Fallback Description');
  });

  it.each([
    ['small', 3],
    ['normal', 5],
    ['large', 7],
  ] as const)('maps %s size to item layout gap token', (size, expectedGap) => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider
          config={{
            token: {
              marginXXS: 3,
              marginXS: 5,
              marginSM: 7,
            },
          }}
        >
          <Steps
            size={size}
            items={[
              {
                titleText: 'Start',
              },
              {
                titleText: 'Done',
              },
            ]}
          />
        </ThemeProvider>,
      );
    });
    const content = testRenderer!.root.findAllByProps({
      testID: 'steps-content',
    })[0];
    const contentStyle = StyleSheet.flatten(content.props.style);

    expect(contentStyle.paddingBottom).toBe(expectedGap);
  });
});
