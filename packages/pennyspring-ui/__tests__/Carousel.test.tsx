import React, { createRef } from 'react';
import renderer, { act } from 'react-test-renderer';

import { Carousel } from '../src/Carousel';

const ITEMS = [
  { id: '1', title: 'Alpha' },
  { id: '2', title: 'Beta' },
  { id: '3', title: 'Gamma' },
];

function renderCarousel(
  props: Partial<React.ComponentProps<typeof Carousel<(typeof ITEMS)[number]>>> = {},
): renderer.ReactTestRenderer {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <>
        <Carousel
          data={ITEMS}
          renderItem={item => <>{item.title}</>}
          {...props}
        />
      </>,
    );
  });

  return testRenderer!;
}

function triggerLayout(testRenderer: renderer.ReactTestRenderer, width = 300): void {
  const pressable = testRenderer.root.findAll(
    node => typeof node.props.onLayout === 'function',
  )[0];

  act(() => {
    pressable.props.onLayout({
      nativeEvent: {
        layout: {
          width,
          height: width,
        },
      },
    });
  });
}

describe('Carousel', () => {
  it('renders nothing when data is empty', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <>
          <Carousel data={[]} renderItem={item => <>{String(item)}</>} />
        </>,
      );
    });

    expect(testRenderer!.toJSON()).toBeNull();
  });

  it('supports hiding and customizing indicator', () => {
    const hiddenIndicator = renderCarousel({ indicator: false });
    const customIndicator = renderCarousel({
      indicator: (total: number, current: number) => <>custom-{total}-{current}</>,
    });

    expect(JSON.stringify(hiddenIndicator.toJSON())).not.toContain('custom-');
    const indicatorText = JSON.stringify(customIndicator.toJSON());
    expect(indicatorText).toContain('custom-');
    expect(indicatorText).toContain('"3"');
    expect(indicatorText).toContain('"0"');
  });

  it('supports uncontrolled defaultValue and notifies onChange after swipeTo', () => {
    const onChange = jest.fn();
    const ref = createRef<any>();
    const testRenderer = renderCarousel({
      defaultValue: 1,
      onChange,
      ref,
    });

    triggerLayout(testRenderer, 320);

    act(() => {
      ref.current?.swipeTo(2);
    });

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('supports controlled value and only emits onChange', () => {
    const onChange = jest.fn();
    const ref = createRef<any>();
    const testRenderer = renderCarousel({
      value: 0,
      onChange,
      ref,
    });

    triggerLayout(testRenderer, 320);

    act(() => {
      ref.current?.swipeNext();
    });

    expect(onChange).toHaveBeenCalledWith(1);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Alpha');
  });

  it('uses layout primitives for root and indicator container', () => {
    const testRenderer = renderCarousel();

    const rootColumns = testRenderer.root.findAllByProps({ testID: 'carousel-root' });
    const indicatorRows = testRenderer.root.findAllByProps({ testID: 'carousel-indicator' });

    expect(rootColumns.length).toBeGreaterThan(0);
    expect(indicatorRows.length).toBeGreaterThan(0);
  });

});
