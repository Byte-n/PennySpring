import React from 'react';
import {
  type EmitterSubscription,
  Keyboard,
  Pressable,
  StyleSheet,
  Text as RNText,
} from 'react-native';
import { withTiming } from 'react-native-reanimated';
import renderer, { act } from 'react-test-renderer';
import { Button } from '../src/Button';
import { Popup } from '../src/Popup';

type KeyboardHandler = (event: {
  endCoordinates?: {
    height?: number;
    screenY?: number;
  };
}) => void;

function createKeyboardSubscription(): EmitterSubscription {
  return {
    remove: jest.fn(),
  } as unknown as EmitterSubscription;
}

describe('Popup.FloatingPanel', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('places the drag handle at top for bottom position', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen position="bottom">
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree.indexOf('floating-panel-handle')).toBeGreaterThan(-1);
    expect(tree.indexOf('floating-panel-handle')).toBeLessThan(
      tree.indexOf('content'),
    );
  });

  it('places the drag handle at bottom for top position', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen position="top">
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree.indexOf('floating-panel-handle')).toBeGreaterThan(
      tree.indexOf('content'),
    );
  });

  it('uses the height prop as the panel height', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen height={320}>
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const popupBody = testRenderer!.root.findByProps({
      testID: 'popup-body',
    });
    const flattenedStyle = StyleSheet.flatten(popupBody.props.style);

    expect(flattenedStyle.height).toBe(320);
  });

  it('applies size-based padding to the body area', () => {
    const bodyPaddingBySize = {
      small: 12,
      normal: 20,
      large: 24,
    } as const;

    Object.entries(bodyPaddingBySize).forEach(([size, bodyPadding]) => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderer.create(
          <Popup.FloatingPanel
            defaultOpen
            size={size as keyof typeof bodyPaddingBySize}
          >
            <RNText>content</RNText>
          </Popup.FloatingPanel>,
        );
      });

      const panelBody = testRenderer!.root.findByProps({
        testID: 'floating-panel-body',
      });
      const flattenedStyle = StyleSheet.flatten(panelBody.props.style);

      expect(flattenedStyle.paddingHorizontal).toBe(bodyPadding);
      expect(flattenedStyle.paddingTop).toBe(bodyPadding);
      expect(flattenedStyle.paddingBottom).toBe(bodyPadding);
    });
  });

  it('applies size-based spacing to header and footer areas', () => {
    const spacingBySize = {
      small: {
        actionGap: 8,
        contentPadding: 12,
        sectionMargin: 12,
        sectionPadding: 8,
      },
      normal: {
        actionGap: 12,
        contentPadding: 20,
        sectionMargin: 20,
        sectionPadding: 12,
      },
      large: {
        actionGap: 20,
        contentPadding: 24,
        sectionMargin: 24,
        sectionPadding: 20,
      },
    } as const;

    Object.entries(spacingBySize).forEach(([size, spacing]) => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderer.create(
          <Popup.FloatingPanel
            cancelText="Cancel"
            defaultOpen
            okText="OK"
            size={size as keyof typeof spacingBySize}
            titleText="Panel title"
          >
            <RNText>content</RNText>
          </Popup.FloatingPanel>,
        );
      });

      const header = testRenderer!.root.findByProps({
        testID: 'floating-panel-header',
      });
      const footer = testRenderer!.root.findByProps({
        testID: 'floating-panel-footer',
      });
      const headerStyle = StyleSheet.flatten(header.props.style);
      const footerStyle = StyleSheet.flatten(footer.props.style);

      expect(headerStyle.paddingHorizontal).toBe(spacing.contentPadding);
      expect(headerStyle.paddingTop).toBe(spacing.contentPadding);
      expect(headerStyle.paddingBottom).toBe(spacing.sectionPadding);
      expect(headerStyle.marginBottom).toBe(spacing.sectionMargin);
      expect(footerStyle.gap).toBe(spacing.actionGap);
      expect(footerStyle.paddingHorizontal).toBe(spacing.contentPadding);
      expect(footerStyle.paddingTop).toBe(spacing.sectionPadding);
      expect(footerStyle.paddingBottom).toBe(spacing.contentPadding);
      expect(footerStyle.marginTop).toBe(spacing.sectionMargin);
    });
  });

  it('applies size-based title text and default button sizes', () => {
    const titleTextSizeByPanelSize = {
      small: 'md',
      normal: 'lg',
      large: 'xl',
    } as const;

    Object.entries(titleTextSizeByPanelSize).forEach(([size, titleTextSize]) => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderer.create(
          <Popup.FloatingPanel
            cancelText="Cancel"
            defaultOpen
            okText="OK"
            size={size as keyof typeof titleTextSizeByPanelSize}
            titleText="Panel title"
          >
            <RNText>content</RNText>
          </Popup.FloatingPanel>,
        );
      });

      const titleText = testRenderer!.root.findByProps({
        testID: 'floating-panel-title-text',
      });
      const defaultButtons = testRenderer!.root.findAllByType(Button);

      expect(titleText.props.size).toBe(titleTextSize);
      expect(defaultButtons).toHaveLength(2);
      defaultButtons.forEach(button => {
        expect(button.props.size).toBe(size);
      });
    });
  });

  it('uses the height prop as a resizable initial height', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen height={320}>
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const handle = testRenderer!.root.findByProps({
      testID: 'floating-panel-handle',
    });

    act(() => {
      handle.props.onResponderGrant();
      handle.props.onResponderMove(undefined, { dy: -100 });
    });

    const popupBody = testRenderer!.root.findByProps({
      testID: 'popup-body',
    });
    const flattenedStyle = StyleSheet.flatten(popupBody.props.style);

    expect(flattenedStyle.height).toBe(420);
  });

  it('resolves percentage height against the viewport height', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen height="50%">
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const popupBody = testRenderer!.root.findByProps({
      testID: 'popup-body',
    });
    const flattenedStyle = StyleSheet.flatten(popupBody.props.style);

    expect(flattenedStyle.height).toBe(667);
  });

  it('resolves percentage minHeight and maxHeight before clamping value', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel
          defaultOpen
          maxHeight="50%"
          minHeight="25%"
          value={800}
        >
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const popupBody = testRenderer!.root.findByProps({
      testID: 'popup-body',
    });
    const flattenedStyle = StyleSheet.flatten(popupBody.props.style);

    expect(flattenedStyle.height).toBe(667);
  });

  it('moves bottom panel above keyboard when keyboard avoiding is enabled', () => {
    const handlers: KeyboardHandler[] = [];
    jest.spyOn(Keyboard, 'addListener').mockImplementation((_, handler) => {
      handlers.push(handler as KeyboardHandler);

      return createKeyboardSubscription();
    });

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen keyboardAvoiding position="bottom">
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    act(() => {
      handlers[0]({ endCoordinates: { height: 280, screenY: 560 } });
    });

    const popupLayout = testRenderer!.root.findByProps({
      testID: 'popup-layout',
    });
    const flattenedStyle = StyleSheet.flatten(popupLayout.props.style);

    expect(flattenedStyle.bottom).toBe(280);
    expect(withTiming).toHaveBeenLastCalledWith(
      280,
      expect.objectContaining({
        duration: expect.any(Number),
        easing: expect.any(Function),
      }),
    );
  });

  it('renders titleText inside the header slot', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen titleText="Panel title">
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    expect(JSON.stringify(testRenderer!.toJSON())).toContain('Panel title');
    expect(testRenderer!.root.findByProps({
      testID: 'floating-panel-header',
    })).toBeTruthy();
  });

  it('fires onCancel before onOpenChange when cancel is pressed', () => {
    const calls: string[] = [];
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel
          cancelText="Cancel"
          defaultOpen
          onCancel={() => calls.push('cancel')}
          onOpenChange={nextOpen => calls.push(`open:${nextOpen}`)}
        >
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    act(() => {
      testRenderer!.root.findByProps({
        testID: 'floating-panel-cancel-button',
      }).props.onPress();
    });

    expect(calls).toEqual(['cancel', 'open:false']);
    expect(testRenderer!.toJSON()).toBeNull();
  });

  it('fires onOk before closing when ok is pressed', async () => {
    const calls: string[] = [];
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel
          defaultOpen
          okText="Save"
          onOk={() => {
            calls.push('ok');
          }}
          onOpenChange={nextOpen => calls.push(`open:${nextOpen}`)}
        >
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    await act(async () => {
      await testRenderer!.root.findByProps({
        testID: 'floating-panel-ok-button',
      }).props.onPress();
    });

    expect(calls).toEqual(['ok', 'open:false']);
    expect(testRenderer!.toJSON()).toBeNull();
  });

  it('keeps open when onOk returns false', async () => {
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel
          defaultOpen
          okText="Save"
          onOk={() => false}
          onOpenChange={onOpenChange}
        >
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    await act(async () => {
      await testRenderer!.root.findByProps({
        testID: 'floating-panel-ok-button',
      }).props.onPress();
    });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(JSON.stringify(testRenderer!.toJSON())).toContain('content');
  });

  it('passes cancel and confirm actions to renderHeader and renderFooter', async () => {
    const calls: string[] = [];
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel
          closeOnCancel={false}
          defaultOpen
          onCancel={() => calls.push('cancel')}
          onOk={() => {
            calls.push('ok');
          }}
          renderFooter={({ confirm }) => (
            <Pressable onPress={confirm} testID="custom-confirm" />
          )}
          renderHeader={({ cancel }) => (
            <Pressable onPress={cancel} testID="custom-cancel" />
          )}
        >
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    act(() => {
      testRenderer!.root.findByProps({
        testID: 'custom-cancel',
      }).props.onPress();
    });

    await act(async () => {
      await testRenderer!.root.findByProps({
        testID: 'custom-confirm',
      }).props.onPress();
    });

    expect(calls).toEqual(['cancel', 'ok']);
    expect(testRenderer!.toJSON()).toBeNull();
  });
});
