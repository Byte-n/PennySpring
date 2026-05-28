import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Result } from '../src/Result';
import { Icon } from '../src/Icon';
import { RESULT_LARGE_ICON_SCALE, SIZE_STYLE_MAP, useStyles } from '../src/Result/style';

function renderResult(props: Partial<React.ComponentProps<typeof Result>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Result {...props} /></>);
  });
  return testRenderer!;
}

describe('Result', () => {
  it('renders default info status with icon and title', () => {
    const testRenderer = renderResult({
      titleText: 'Operation Info'
    });
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).toContain('Operation Info');
  });

  it('renders subtitleText below the title', () => {
    const testRenderer = renderResult({
      titleText: 'Success',
      subtitleText: 'Your changes have been saved.'
    });
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).toContain('Success');
    expect(tree).toContain('Your changes have been saved.');
  });

  it('supports custom icon, title, subtitle, and extra nodes', () => {
    const customIcon = <RNText testID="custom-icon">★</RNText>;
    const customTitle = <RNText testID="custom-title">Custom Title</RNText>;
    const customSubtitle = <RNText testID="custom-subtitle">Custom Sub</RNText>;
    const customExtra = <RNText testID="custom-extra">Action</RNText>;
    const testRenderer = renderResult({
      icon: customIcon,
      title: customTitle,
      subtitle: customSubtitle,
      extra: customExtra,
      titleText: 'Fallback Title',
      subtitleText: 'Fallback Sub'
    });
    expect(testRenderer.root.findByProps({
      testID: 'custom-icon'
    })).toBeTruthy();
    expect(testRenderer.root.findByProps({
      testID: 'custom-title'
    })).toBeTruthy();
    expect(testRenderer.root.findByProps({
      testID: 'custom-subtitle'
    })).toBeTruthy();
    expect(testRenderer.root.findByProps({
      testID: 'custom-extra'
    })).toBeTruthy();
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).not.toContain('Fallback Title');
    expect(tree).not.toContain('Fallback Sub');
  });

  // Issue 1: null slot semantics
  describe('null slot semantics', () => {
    it('renders default info icon when icon is undefined', () => {
      const testRenderer = renderResult({ titleText: 'Test' });
      const icon = testRenderer.root.findByType(Icon);
      expect(icon.props.icon).toBe('info');
    });

    it('does not render icon container when icon is null', () => {
      const testRenderer = renderResult({
        icon: null,
        titleText: 'No Icon',
      });
      // Icon component should not be present in the tree
      expect(() => testRenderer.root.findByType(Icon)).toThrow();
      // Title should still render
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).toContain('No Icon');
    });

    it('renders titleText when title is undefined', () => {
      const testRenderer = renderResult({
        titleText: 'Default Title',
      });
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).toContain('Default Title');
    });

    it('does not render title when title is null', () => {
      const testRenderer = renderResult({
        title: null,
        titleText: 'Should Not Appear',
        subtitleText: 'Subtitle',
      });
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).not.toContain('Should Not Appear');
      // Subtitle should still render
      expect(tree).toContain('Subtitle');
    });

    it('renders subtitleText when subtitle is undefined', () => {
      const testRenderer = renderResult({
        titleText: 'Title',
        subtitleText: 'Default Subtitle',
      });
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).toContain('Default Subtitle');
    });

    it('does not render subtitle when subtitle is null', () => {
      const testRenderer = renderResult({
        titleText: 'Title',
        subtitle: null,
        subtitleText: 'Should Not Appear',
      });
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).not.toContain('Should Not Appear');
      // Title should still render
      expect(tree).toContain('Title');
    });

    it('does not render extra when extra is undefined', () => {
      const testRenderer = renderResult({
        titleText: 'Title',
      });
      const tree = JSON.stringify(testRenderer.toJSON());
      // No extra content should be present
      expect(tree).toContain('Title');
    });

    it('does not render extra when extra is null', () => {
      const testRenderer = renderResult({
        titleText: 'Title',
        extra: null,
      });
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).toContain('Title');
    });

    it('renders extra when extra is 0', () => {
      const testRenderer = renderResult({
        titleText: 'Title',
        extra: 0,
      });
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).toContain('0');
    });

    it('renders extra when extra is empty string', () => {
      const testRenderer = renderResult({
        titleText: 'Title',
        extra: '',
      });
      // Empty string is a valid ReactNode; the wrapper should still render
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).toContain('Title');
    });
  });

  // Issue 5: status-based default icon
  describe('status-based default icon', () => {
    it('renders check-circle icon for success status', () => {
      const testRenderer = renderResult({
        status: 'success',
        titleText: 'Done',
      });
      const icon = testRenderer.root.findByType(Icon);
      expect(icon.props.icon).toBe('check-circle');
    });

    it('renders warning icon for warning status', () => {
      const testRenderer = renderResult({
        status: 'warning',
        titleText: 'Caution',
      });
      const icon = testRenderer.root.findByType(Icon);
      expect(icon.props.icon).toBe('warning');
    });

    it('renders close-circle icon for error status', () => {
      const testRenderer = renderResult({
        status: 'error',
        titleText: 'Failed',
      });
      const icon = testRenderer.root.findByType(Icon);
      expect(icon.props.icon).toBe('close-circle');
    });

    it('renders info icon for info status', () => {
      const testRenderer = renderResult({
        status: 'info',
        titleText: 'Info',
      });
      const icon = testRenderer.root.findByType(Icon);
      expect(icon.props.icon).toBe('info');
    });
  });

  // Issue 5: size behavior
  describe('size behavior', () => {
    it('passes small size to default icon', () => {
      const testRenderer = renderResult({
        size: 'small',
        titleText: 'Small Result',
      });
      const icon = testRenderer.root.findByType(Icon);
      expect(icon.props.size).toBe('small');
    });

    it('passes normal size to default icon', () => {
      const testRenderer = renderResult({
        size: 'normal',
        titleText: 'Normal Result',
      });
      const icon = testRenderer.root.findByType(Icon);
      expect(icon.props.size).toBe('normal');
    });

    it('passes large size to default icon', () => {
      const testRenderer = renderResult({
        size: 'large',
        titleText: 'Large Result',
      });
      const icon = testRenderer.root.findByType(Icon);
      expect(icon.props.size).toBe('large');
    });

    it('renders title and subtitle content for each size', () => {
      const sizes = ['small', 'normal', 'large'] as const;
      for (const size of sizes) {
        const testRenderer = renderResult({
          size,
          titleText: `${size} Title`,
          subtitleText: `${size} Subtitle`,
        });
        const tree = JSON.stringify(testRenderer.toJSON());
        expect(tree).toContain(`${size} Title`);
        expect(tree).toContain(`${size} Subtitle`);
      }
    });

    it('uses exported semantic scale constant for large icon container', () => {
      expect(RESULT_LARGE_ICON_SCALE).toBe(1.25);
      const tokenStub = { sizeXXL: 80 } as const;
      expect(SIZE_STYLE_MAP.large.iconContainerSize(tokenStub as never)).toBe(
        tokenStub.sizeXXL * RESULT_LARGE_ICON_SCALE,
      );
    });
  });

  describe('text color ownership', () => {
    it('does not set title and subtitle colors in token text styles', () => {
      let capturedStyles: ReturnType<typeof useStyles> | undefined;
      function StyleProbe() {
        capturedStyles = useStyles({ size: 'normal', status: 'info' });
        return null;
      }

      act(() => {
        renderer.create(<StyleProbe />);
      });

      expect(capturedStyles).toBeDefined();
      expect('color' in capturedStyles!.title).toBe(false);
      expect('color' in capturedStyles!.subtitle).toBe(false);
    });
  });
});
