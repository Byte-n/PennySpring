import React from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Notification } from '../src/Notification/Notification';
import { notification, NotificationPortal } from '../src/Notification';
import { _resetNotificationState } from '../src/Notification/NotificationManager';
import { PortalProvider } from '../src/Portal';

jest.useFakeTimers();

function renderNotification(
  props: Partial<React.ComponentProps<typeof Notification>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <PortalProvider>
          <Notification {...props} />
        </PortalProvider>
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function renderPortalTree() {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <PortalProvider>
          <NotificationPortal />
        </PortalProvider>
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

describe('Notification', () => {
  afterEach(() => {
    _resetNotificationState();
  });

  describe('declarative mode', () => {
    it('renders with titleText and contentText when open', () => {
      const testRenderer = renderNotification({
        defaultOpen: true,
        titleText: 'New message',
        contentText: 'You have a new notification',
      });
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).toContain('New message');
      expect(treeString).toContain('You have a new notification');
    });

    it('does not render when closed', () => {
      const testRenderer = renderNotification({
        titleText: 'Hidden',
        contentText: 'Should not appear',
      });
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).not.toContain('Hidden');
      expect(treeString).not.toContain('Should not appear');
    });

    it('renders with custom title and content nodes', () => {
      const testRenderer = renderNotification({
        defaultOpen: true,
        title: <RNText>Custom Title Node</RNText>,
        content: <RNText>Custom Content Node</RNText>,
      });
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).toContain('Custom Title Node');
      expect(treeString).toContain('Custom Content Node');
    });

    it('renders descriptionText when provided', () => {
      const testRenderer = renderNotification({
        defaultOpen: true,
        titleText: 'Title',
        contentText: 'Content',
        descriptionText: 'Additional details here',
      });
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).toContain('Additional details here');
    });

    it('renders description node when provided', () => {
      const testRenderer = renderNotification({
        defaultOpen: true,
        titleText: 'Title',
        description: <RNText>Custom Description</RNText>,
      });
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).toContain('Custom Description');
    });

    it('auto-dismisses after default duration', () => {
      const onOpenChange = jest.fn();
      renderNotification({
        defaultOpen: true,
        titleText: 'Auto dismiss',
        contentText: 'Will disappear',
        onOpenChange,
      });

      expect(onOpenChange).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(4500);
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('auto-dismisses after custom duration', () => {
      const onOpenChange = jest.fn();
      renderNotification({
        defaultOpen: true,
        duration: 2000,
        titleText: 'Custom duration',
        contentText: 'Faster dismiss',
        onOpenChange,
      });

      act(() => {
        jest.advanceTimersByTime(1999);
      });

      expect(onOpenChange).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not auto-dismiss when duration is 0', () => {
      const onOpenChange = jest.fn();
      renderNotification({
        defaultOpen: true,
        duration: 0,
        titleText: 'Persistent',
        contentText: 'Stays until closed',
        onOpenChange,
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('renders close button when closeable is true', () => {
      const testRenderer = renderNotification({
        defaultOpen: true,
        closeable: true,
        titleText: 'Closeable',
      });

      const closeButton = testRenderer.root.findByProps({
        testID: 'notification-close-button',
      });

      expect(closeButton).toBeTruthy();
    });

    it('does not render close button when closeable is false', () => {
      const testRenderer = renderNotification({
        defaultOpen: true,
        closeable: false,
        titleText: 'Not closeable',
      });

      expect(() => {
        testRenderer.root.findByProps({
          testID: 'notification-close-button',
        });
      }).toThrow();
    });

    it('calls onCancel and onOpenChange when close button is pressed', () => {
      const onCancel = jest.fn();
      const onOpenChange = jest.fn();
      const testRenderer = renderNotification({
        closeable: true,
        defaultOpen: true,
        onCancel,
        onOpenChange,
        titleText: 'Close me',
      });

      act(() => {
        testRenderer.root.findByProps({
          testID: 'notification-close-button',
        }).props.onPress();
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onPress when notification body is pressed', () => {
      const onPress = jest.fn();
      const testRenderer = renderNotification({
        defaultOpen: true,
        onPress,
        titleText: 'Pressable',
        contentText: 'Tap me',
      });

      act(() => {
        testRenderer.root.findByProps({
          testID: 'notification-body',
        }).props.onPress();
      });

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when parent sets open to false externally', () => {
      const onCancel = jest.fn();
      const onOpenChange = jest.fn();
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderer.create(
          <ThemeProvider>
            <PortalProvider>
              <Notification
                open
                onCancel={onCancel}
                onOpenChange={onOpenChange}
                titleText="Controlled"
              />
            </PortalProvider>
          </ThemeProvider>,
        );
      });

      act(() => {
        testRenderer!.update(
          <ThemeProvider>
            <PortalProvider>
              <Notification
                open={false}
                onCancel={onCancel}
                onOpenChange={onOpenChange}
                titleText="Controlled"
              />
            </PortalProvider>
          </ThemeProvider>,
        );
      });

      expect(onCancel).not.toHaveBeenCalled();
    });

    it('renders with type variants', () => {
      const types = ['info', 'success', 'warning', 'error'] as const;

      for (const type of types) {
        const testRenderer = renderNotification({
          defaultOpen: true,
          type,
          titleText: `${type} notification`,
        });
        const treeString = JSON.stringify(testRenderer.toJSON());

        expect(treeString).toContain(`${type} notification`);
      }
    });

    it('renders with size variants', () => {
      const sizes = ['small', 'normal', 'large'] as const;

      for (const size of sizes) {
        const testRenderer = renderNotification({
          defaultOpen: true,
          size,
          titleText: `${size} notification`,
        });
        const treeString = JSON.stringify(testRenderer.toJSON());

        expect(treeString).toContain(`${size} notification`);
      }
    });

    it('renders custom icon when provided', () => {
      const testRenderer = renderNotification({
        defaultOpen: true,
        icon: <RNText testID="custom-icon">★</RNText>,
        titleText: 'With icon',
      });

      expect(
        testRenderer.root.findByProps({ testID: 'custom-icon' }),
      ).toBeTruthy();
    });
  });

  describe('imperative mode', () => {
    it('opens a notification via notification.open()', () => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderPortalTree();
      });

      act(() => {
        notification.open({
          titleText: 'Imperative',
          contentText: 'Opened via API',
        });
      });

      const treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).toContain('Imperative');
      expect(treeString).toContain('Opened via API');
    });

    it('opens a success notification via notification.success()', () => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderPortalTree();
      });

      act(() => {
        notification.success({
          titleText: 'Success',
          contentText: 'Operation completed',
        });
      });

      const treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).toContain('Success');
    });

    it('opens a warning notification via notification.warning()', () => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderPortalTree();
      });

      act(() => {
        notification.warning({
          titleText: 'Warning',
          contentText: 'Be careful',
        });
      });

      const treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).toContain('Warning');
    });

    it('opens an error notification via notification.error()', () => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderPortalTree();
      });

      act(() => {
        notification.error({
          titleText: 'Error',
          contentText: 'Something went wrong',
        });
      });

      const treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).toContain('Error');
    });

    it('opens an info notification via notification.info()', () => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderPortalTree();
      });

      act(() => {
        notification.info({
          titleText: 'Info',
          contentText: 'For your information',
        });
      });

      const treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).toContain('Info');
    });

    it('clears all notifications via notification.clear()', () => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderPortalTree();
      });

      act(() => {
        notification.open({ titleText: 'First', contentText: 'content' });
        notification.open({ titleText: 'Second', contentText: 'content' });
      });

      let treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).toContain('First');
      expect(treeString).toContain('Second');

      act(() => {
        notification.clear();
      });

      treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).not.toContain('First');
      expect(treeString).not.toContain('Second');
    });

    it('respects maxCount by removing oldest notification when limit is exceeded', () => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderPortalTree();
      });

      // Default maxCount is 5; opening 6 should evict the oldest
      act(() => {
        notification.open({ titleText: 'Oldest', contentText: 'c' });
        notification.open({ titleText: 'Second', contentText: 'c' });
        notification.open({ titleText: 'Third', contentText: 'c' });
        notification.open({ titleText: 'Fourth', contentText: 'c' });
        notification.open({ titleText: 'Fifth', contentText: 'c' });
        notification.open({ titleText: 'Sixth', contentText: 'c' });
      });

      const treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).not.toContain('Oldest');
      expect(treeString).toContain('Fifth');
      expect(treeString).toContain('Sixth');
    });

    it('auto-dismisses imperative notification after duration', () => {
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderPortalTree();
      });

      act(() => {
        notification.open({
          duration: 3000,
          contentText: 'Will dismiss',
          titleText: 'Timed',
        });
      });

      let treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).toContain('Timed');

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      treeString = JSON.stringify(testRenderer!.toJSON());
      expect(treeString).not.toContain('Timed');
    });

    it('calls onCancel callback when imperative notification is dismissed', () => {
      const onCancel = jest.fn();
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderPortalTree();
      });

      act(() => {
        notification.open({
          duration: 1000,
          onCancel,
          titleText: 'With callback',
        });
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
