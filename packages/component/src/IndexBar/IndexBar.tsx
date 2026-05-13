import React, { Children, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useStyles } from './style';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  IndexBarComponent,
  IndexBarPanelProps,
  IndexBarProps,
  IndexBarSize,
  IndexBarValue,
} from './types';

const DEFAULT_SIZE: IndexBarSize = 'normal';

interface NormalizedPanel {
  index: IndexBarValue;
  title?: ReactNode;
  titleText?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

function collectPanels(children: ReactNode): NormalizedPanel[] {
  const panels: NormalizedPanel[] = [];

  Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === React.Fragment) {
      const fragmentChild = child as React.ReactElement<{ children?: ReactNode }>;
      panels.push(...collectPanels(fragmentChild.props.children));
      return;
    }

    if (!React.isValidElement<IndexBarPanelProps>(child)) {
      return;
    }

    const panelProps = child.props;

    if (panelProps.index === undefined) {
      return;
    }

    panels.push({
      children: panelProps.children,
      disabled: panelProps.disabled,
      index: panelProps.index,
      style: panelProps.style,
      title: panelProps.title,
      titleText: panelProps.titleText ?? String(panelProps.index),
    });
  });

  return panels;
}

function resolveSize(size?: IndexBarSize): IndexBarSize {
  return size ?? DEFAULT_SIZE;
}

function renderTextNode(node: ReactNode, style: StyleProp<TextStyle>) {
  if (node === undefined || node === null || node === false) {
    return null;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return <Text style={style}>{node}</Text>;
  }

  return node;
}

function getInitialValue(
  panels: NormalizedPanel[],
  defaultValue?: IndexBarValue,
): IndexBarValue | undefined {
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return panels.find(panel => panel.disabled !== true)?.index;
}

function IndexBarPanel(_props: IndexBarPanelProps): null {
  return null;
}

function IndexBarRoot({
  value,
  defaultValue,
  onChange,
  onPress,
  disabled = false,
  size,
  children,
  style,
  styles,
  ...rest
}: IndexBarProps) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useStyles({
    disabled,
    size: resolvedSize,
  });
  const panels = useMemo(() => collectPanels(children), [children]);

  const [selectedValue, setSelectedValue] = useControllableValue(
    getInitialValue(panels, defaultValue),
    value,
    onChange,
  );

  return (
    <View testID="index-bar-root" style={[tokenStyles.root, style]}>
      <View testID="index-bar-content" style={[tokenStyles.content, styles?.content]}>
        {panels.map(panel => (
          <View
            key={String(panel.index)}
            testID={`index-bar-panel-${String(panel.index)}`}
            style={[tokenStyles.panel, styles?.panel, panel.style]}
          >
            <View style={[tokenStyles.panelTitleContainer, styles?.panelTitleContainer]}>
              {panel.title ?? renderTextNode(panel.titleText, [tokenStyles.panelTitleText, styles?.panelTitleText])}
            </View>
            {panel.children}
          </View>
        ))}
      </View>
      <View testID="index-bar-sidebar" style={[tokenStyles.sidebar, styles?.sidebar]}>
        {panels.map(panel => {
          const itemDisabled = disabled || panel.disabled === true;
          const isSelected = selectedValue === panel.index;

          return (
            <Pressable
              {...rest}
              key={String(panel.index)}
              testID={`index-bar-item-${String(panel.index)}`}
              accessibilityRole="button"
              accessibilityState={{
                disabled: itemDisabled,
                selected: isSelected,
              }}
              disabled={itemDisabled}
              onPress={event => {
                if (itemDisabled || isSelected) {
                  return;
                }

                onPress?.(event, panel.index);
                setSelectedValue(panel.index);
              }}
              style={({ pressed }) => [
                tokenStyles.indexItem,
                styles?.indexItem,
                isSelected ? tokenStyles.indexItemActive : null,
                isSelected ? styles?.indexItemActive : null,
                pressed && !itemDisabled ? tokenStyles.indexItemPressed : null,
                pressed && !itemDisabled ? styles?.indexItemPressed : null,
                itemDisabled ? tokenStyles.indexItemDisabled : null,
                itemDisabled ? styles?.indexItemDisabled : null,
              ]}
            >
              {renderTextNode(panel.index, [
                tokenStyles.indexText,
                styles?.indexText,
                isSelected ? tokenStyles.indexTextActive : null,
                isSelected ? styles?.indexTextActive : null,
                itemDisabled ? tokenStyles.indexTextDisabled : null,
                itemDisabled ? styles?.indexTextDisabled : null,
              ])}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const IndexBar = Object.assign(IndexBarRoot, {
  Panel: IndexBarPanel,
}) as IndexBarComponent;
