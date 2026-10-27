import React from 'react';
import { ActivityIndicator } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Button } from '../src/Button';
import { Icon } from '../src/Icon';
import { Row } from '../src/Row';
import { Text } from '../src/Text';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';

const token = formatToken(derivative(defaultSeedToken, false));

function renderButton(props: Partial<React.ComponentProps<typeof Button>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Button {...props} /></>);
  });
  return testRenderer!;
}
function flattenStyle(style: unknown) {
  const flatten = (input: unknown): Record<string, unknown>[] => {
    if (input === null || input === undefined || input === false) {
      return [];
    }
    if (Array.isArray(input)) {
      return input.flatMap(flatten);
    }

    return [input as Record<string, unknown>];
  };

  return Object.assign({}, ...flatten(style));
}
function getPressableRoot(testRenderer: renderer.ReactTestRenderer) {
  // The Button renders a single Pressable as its root element
  return testRenderer.root.children[0] as renderer.ReactTestInstance;
}

function getRootStyle(testRenderer: renderer.ReactTestRenderer) {
  const root = getPressableRoot(testRenderer);
  const style = root.props.style({ pressed: false });
  return flattenStyle(style) as Record<string, unknown>;
}
function getContentTextStyle(testRenderer: renderer.ReactTestRenderer) {
  const textNode = testRenderer.root.findByType(Text);
  return flattenStyle(textNode.props.style) as Record<string, unknown>;
}
describe('Button', () => {
  it('renders text content', () => {
    const testRenderer = renderButton({
      children: 'Save'
    });
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Save');
  });
  it('orders icon and content by icon placement', () => {
    const startIcon = renderButton({
      icon: 'check',
      children: 'Label'
    });
    const endIcon = renderButton({
      icon: 'check',
      iconPlacement: 'end',
      children: 'Label'
    });
    const startChildren = (startIcon.toJSON() as renderer.ReactTestRendererJSON).children ?? [];
    const endChildren = (endIcon.toJSON() as renderer.ReactTestRendererJSON).children ?? [];
    expect((startChildren[0] as renderer.ReactTestRendererJSON).type).toBe('View');
    expect((endChildren[0] as renderer.ReactTestRendererJSON).type).toBe('Text');
  });
  it('passes iconProps to internal icon renderer', () => {
    const testRenderer = renderButton({
      icon: 'check',
      iconProps: { weight: 'fill' },
      children: 'Save'
    });
    const iconNode = testRenderer.root.findByType(Icon);
    expect(iconNode.props.weight).toBe('fill');
  });
  it('scales icon size with button size', () => {
    const smallRenderer = renderButton({
      icon: 'check',
      size: 'small',
      children: 'Save'
    });
    const normalRenderer = renderButton({
      icon: 'check',
      size: 'normal',
      children: 'Save'
    });
    const largeRenderer = renderButton({
      icon: 'check',
      size: 'large',
      children: 'Save'
    });
    const smallIcon = smallRenderer.root.findByType(Icon);
    const normalIcon = normalRenderer.root.findByType(Icon);
    const largeIcon = largeRenderer.root.findByType(Icon);
    const smallText = smallRenderer.root.findByType(Text);
    const normalText = normalRenderer.root.findByType(Text);
    const largeText = largeRenderer.root.findByType(Text);
    expect(smallIcon.props.size).toBe(16);
    expect(normalIcon.props.size).toBe(18);
    expect(largeIcon.props.size).toBe(20);
    expect(smallText.props.size).toBe('sm');
    expect(normalText.props.size).toBe('md');
    expect(largeText.props.size).toBe('lg');
  });
  it('blocks presses while loading', () => {
    const onPress = jest.fn();
    const testRenderer = renderButton({
      loading: true,
      onPress,
      children: 'Save'
    });
    const root = getPressableRoot(testRenderer);
    act(() => {
      root.props.onPress({} as never);
    });
    expect(onPress).not.toHaveBeenCalled();
    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });
  it('blocks disabled presses', () => {
    const onPress = jest.fn();
    const testRenderer = renderButton({
      disabled: true,
      onPress,
      children: 'Disabled'
    });
    const root = getPressableRoot(testRenderer);
    act(() => {
      root.props.onPress({} as never);
    });
    expect(onPress).not.toHaveBeenCalled();
    expect(root.props.disabled).toBe(true);
  });
  it('overrides custom text color with disabled text color for text button', () => {
    const enabledRenderer = renderButton({
      type: 'text',
      disabled: false,
      children: <Text style={{ color: 'red' }}>Enabled text</Text>,
    });
    const disabledRenderer = renderButton({
      type: 'text',
      disabled: true,
      children: <Text style={{ color: 'red' }}>Disabled text</Text>,
    });

    expect(getContentTextStyle(enabledRenderer).color).toBe('red');
    expect(getContentTextStyle(disabledRenderer).color).not.toBe('red');
  });
  it('uses a fixed height instead of padding-driven height', () => {
    const testRenderer = renderButton({
      size: 'normal',
      children: 'Save',
    });
    const rootStyle = getRootStyle(testRenderer);

    expect(rootStyle.height).toBe(token.controlHeight);
    expect(rootStyle.paddingVertical).toBeUndefined();
    expect(rootStyle.minHeight).toBeUndefined();
  });
  it('uses token-driven color and size for default loading indicator', () => {
    const baselineRenderer = renderButton({
      icon: 'check',
      size: 'large',
      children: 'Save',
    });
    const enabledRenderer = renderButton({
      loading: true,
      icon: 'check',
      size: 'large',
      children: 'Save',
    });
    const disabledRenderer = renderButton({
      loading: true,
      icon: 'check',
      size: 'large',
      disabled: true,
      children: 'Save',
    });

    const enabledIndicator = enabledRenderer.root.findByType(ActivityIndicator);
    const disabledIndicator = disabledRenderer.root.findByType(ActivityIndicator);
    const baselineIcon = baselineRenderer.root.findByType(Icon);

    expect(enabledIndicator.props.color).toBe(token.colorText);
    expect(baselineIcon.props.size).toBe(20);
    expect(disabledIndicator.props.color).not.toBe(enabledIndicator.props.color);
    expect(typeof enabledIndicator.props.size).toBe('number');
  });
  it('maps button text semantics to Text props before style overrides', () => {
    // Arrange
    const testRenderer = renderButton({
      type: 'primary',
      size: 'small',
      children: 'Save',
    });

    // Act
    const textNode = testRenderer.root.findByType(Text);
    const textStyle = getContentTextStyle(testRenderer);

    // Assert
    expect(textNode.props.size).toBe('sm');
    expect(textNode.props.weight).toBe('semibold');
    expect(textNode.props.color).toBe('lightSolid');
    expect(textStyle.color).toBeUndefined();
    expect(textStyle.fontSize).toBeUndefined();
    expect(textStyle.fontWeight).toBeUndefined();
  });
  it('renders icon container with Row layout primitive', () => {
    // Arrange
    const testRenderer = renderButton({
      icon: 'check',
      children: 'Save',
    });

    // Act
    const rowNodes = testRenderer.root.findAllByType(Row);

    // Assert
    expect(rowNodes).toHaveLength(1);
  });
  it('renders preset color text when color and text variant are combined', () => {
    const testRenderer = renderButton({
      color: 'red',
      variant: 'text',
      children: 'Danger',
    });
    const textNode = testRenderer.root.findByType(Text);

    expect(textNode.props.color).toBe('red6');
  });
  it('renders primary text color when color is primary and variant is outlined', () => {
    const testRenderer = renderButton({
      color: 'primary',
      variant: 'outlined',
      children: 'Save',
    });
    const textNode = testRenderer.root.findByType(Text);

    expect(textNode.props.color).toBe('primaryText');
  });
  it('renders danger text color when type is danger and variant is text', () => {
    const testRenderer = renderButton({
      type: 'danger',
      variant: 'text',
      children: 'Delete',
    });
    const textNode = testRenderer.root.findByType(Text);

    expect(textNode.props.color).toBe('errorText');
  });
  it('renders as solid danger button when type is danger', () => {
    const testRenderer = renderButton({ type: 'danger', children: 'Delete' });

    expect(getRootStyle(testRenderer).backgroundColor).toBe(token.colorError);
    expect(testRenderer.root.findByType(Text).props.color).toBe('lightSolid');
  });
  it('renders icon color matching the button text color', () => {
    const cases: Array<{
      props: Partial<React.ComponentProps<typeof Button>>;
      expected: string;
    }> = [
      { props: { type: 'primary' }, expected: 'lightSolid' },
      { props: { color: 'primary', variant: 'outlined' }, expected: 'primaryText' },
      { props: { type: 'danger' }, expected: 'lightSolid' },
      { props: { color: 'red', variant: 'text' }, expected: 'red6' },
    ];

    for (const { props, expected } of cases) {
      const testRenderer = renderButton({
        icon: 'check',
        children: 'Label',
        ...props,
      });
      const iconNode = testRenderer.root.findByType(Icon);
      const textNode = testRenderer.root.findByType(Text);

      expect(iconNode.props.color).toBe(expected);
      expect(iconNode.props.color).toBe(textNode.props.color);
    }
  });
  it('renders disabled icon color matching disabled text color', () => {
    const testRenderer = renderButton({
      type: 'primary',
      icon: 'check',
      disabled: true,
      children: 'Save',
    });
    const iconNode = testRenderer.root.findByType(Icon);
    const textNode = testRenderer.root.findByType(Text);

    expect(iconNode.props.color).toBe('quaternary');
    expect(textNode.props.color).toBe('quaternary');
  });
  it('allows iconProps.color to override the default icon color', () => {
    const testRenderer = renderButton({
      type: 'primary',
      icon: 'check',
      iconProps: { color: 'secondary' },
      children: 'Save',
    });
    const iconNode = testRenderer.root.findByType(Icon);

    expect(iconNode.props.color).toBe('secondary');
  });
  it('darkens text color to the active token when pressed for outlined/dashed/text/link', () => {
    const cases: Array<{
      props: Partial<React.ComponentProps<typeof Button>>;
      idle: string;
      pressedColor: string;
    }> = [
      {
        props: { color: 'primary', variant: 'outlined' },
        idle: 'primaryText',
        pressedColor: 'primaryTextActive',
      },
      {
        props: { color: 'primary', variant: 'dashed' },
        idle: 'primaryText',
        pressedColor: 'primaryTextActive',
      },
      {
        props: { color: 'primary', variant: 'text' },
        idle: 'primaryText',
        pressedColor: 'primaryTextActive',
      },
      {
        props: { color: 'primary', variant: 'link' },
        idle: 'link',
        pressedColor: 'linkActive',
      },
      {
        props: { type: 'danger', variant: 'text' },
        idle: 'errorText',
        pressedColor: 'errorTextActive',
      },
      {
        props: { color: 'red', variant: 'text' },
        idle: 'red6',
        pressedColor: 'red7',
      },
    ];

    for (const { props, idle, pressedColor } of cases) {
      const idleRenderer = renderButton({ children: 'Save', ...props });
      const pressedRenderer = renderButton({
        children: 'Save',
        testOnly_pressed: true,
        ...props,
      });

      expect(idleRenderer.root.findByType(Text).props.color).toBe(idle);
      expect(pressedRenderer.root.findByType(Text).props.color).toBe(
        pressedColor,
      );
    }
  });
  it('keeps solid and default-color text unchanged when pressed', () => {
    const cases: Array<{
      props: Partial<React.ComponentProps<typeof Button>>;
      color: string;
    }> = [
      { props: { type: 'primary' }, color: 'lightSolid' },
      { props: { variant: 'text' }, color: 'secondary' },
    ];

    for (const { props, color } of cases) {
      const pressedRenderer = renderButton({
        children: 'Save',
        testOnly_pressed: true,
        ...props,
      });

      expect(pressedRenderer.root.findByType(Text).props.color).toBe(color);
    }
  });
  it('darkens icon color together with text color when pressed', () => {
    const pressedRenderer = renderButton({
      color: 'primary',
      variant: 'text',
      icon: 'check',
      testOnly_pressed: true,
      children: 'Save',
    });
    const iconNode = pressedRenderer.root.findByType(Icon);
    const textNode = pressedRenderer.root.findByType(Text);

    expect(iconNode.props.color).toBe('primaryTextActive');
    expect(iconNode.props.color).toBe(textNode.props.color);
  });
  it('does not darken text color when disabled even while pressed', () => {
    const pressedRenderer = renderButton({
      color: 'primary',
      variant: 'text',
      disabled: true,
      testOnly_pressed: true,
      children: 'Save',
    });

    expect(pressedRenderer.root.findByType(Text).props.color).toBe('quaternary');
  });
});

describe('Button redesign', () => {
  it('renders default type as filled surface without border', () => {
    const testRenderer = renderButton({ children: '取消' });
    const rootStyle = getRootStyle(testRenderer);

    expect(rootStyle.backgroundColor).toBe(token.colorFillTertiary);
    expect(rootStyle.borderWidth).toBe(0);
  });

  it('applies fixed height and radius for each size', () => {
    const small = getRootStyle(renderButton({ size: 'small', children: '保存' }));
    const normal = getRootStyle(renderButton({ size: 'normal', children: '保存' }));
    const large = getRootStyle(renderButton({ size: 'large', children: '保存' }));

    expect(small.height).toBe(32);
    expect(small.borderRadius).toBe(token.borderRadiusSM);
    expect(normal.height).toBe(token.controlHeight);
    expect(normal.borderRadius).toBe(token.borderRadius);
    expect(large.height).toBe(52);
    expect(large.borderRadius).toBe(token.borderRadiusLG);
  });

  it('keeps the label and dims it while loading', () => {
    const testRenderer = renderButton({ loading: true, children: '保存记录' });
    const textNode = testRenderer.root.findByType(Text);
    const textStyle = flattenStyle(textNode.props.style) as Record<string, unknown>;

    expect(textNode.props.children).toBe('保存记录');
    expect(textStyle.opacity).toBe(token.opacityLoading);
    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });

  it('renders disabled button with fill surface and quaternary text', () => {
    const testRenderer = renderButton({ type: 'primary', disabled: true, children: '保存' });
    const rootStyle = getRootStyle(testRenderer);
    const textNode = testRenderer.root.findByType(Text);

    expect(rootStyle.backgroundColor).toBe(token.colorFillTertiary);
    expect(rootStyle.borderWidth).toBe(0);
    expect(textNode.props.color).toBe('quaternary');
  });

  it('maps icon size to the per-size icon scale', () => {
    const small = renderButton({ icon: 'check', size: 'small', children: '保存' });
    const normal = renderButton({ icon: 'check', size: 'normal', children: '保存' });
    const large = renderButton({ icon: 'check', size: 'large', children: '保存' });

    expect(small.root.findByType(Icon).props.size).toBe(16);
    expect(normal.root.findByType(Icon).props.size).toBe(18);
    expect(large.root.findByType(Icon).props.size).toBe(20);
  });

  it('uses semibold text for solid primary and danger buttons', () => {
    const primary = renderButton({ type: 'primary', children: '保存' });
    const danger = renderButton({ type: 'danger', children: '删除' });
    const secondary = renderButton({ children: '取消' });

    expect(primary.root.findByType(Text).props.weight).toBe('semibold');
    expect(danger.root.findByType(Text).props.weight).toBe('semibold');
    expect(secondary.root.findByType(Text).props.weight).toBe('medium');
  });
});
