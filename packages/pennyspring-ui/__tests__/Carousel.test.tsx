import fs from 'node:fs';
import path from 'node:path';
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

  it('uses reanimated for position animation implementation', () => {
    const sourcePath = path.resolve(
      __dirname,
      '../src/Carousel/hooks/use-carousel-position.ts',
    );
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).toContain('react-native-reanimated');
    expect(source).not.toContain("Animated, Easing } from 'react-native'");
  });

  it('uses gesture-handler for drag gestures', () => {
    const sourcePath = path.resolve(
      __dirname,
      '../src/Carousel/hooks/use-carousel-pan-responder.ts',
    );
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).toContain('react-native-gesture-handler');
    expect(source).not.toContain('PanResponder.create');
    expect(source).not.toContain("from 'react-native';");
  });

  it('avoids dynamic inline style objects in carousel indicator and slides', () => {
    const indicatorPath = path.resolve(
      __dirname,
      '../src/Carousel/carousel-indicator.tsx',
    );
    const slidesPath = path.resolve(__dirname, '../src/Carousel/carousel-slides.tsx');

    const indicatorSource = fs.readFileSync(indicatorPath, 'utf8');
    const slidesSource = fs.readFileSync(slidesPath, 'utf8');

    expect(indicatorSource).not.toContain('{ backgroundColor: isActive ? activeColor : inactiveColor }');
    expect(slidesSource).not.toContain("{ width: slidePixels, height: '100%' }");
    expect(slidesSource).not.toContain("{ height: slidePixels, width: '100%' }");
  });
});
