import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Checkbox,
  Text,
  Toast,
  useToast,
} from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../../PreviewScaffold';
import type {
  CheckboxGroupOption,
  CheckboxValue,
  ToastPlacement,
} from '@pennyspring/component';

const TOAST_PLACEMENTS: readonly ToastPlacement[] = ['top', 'center', 'bottom'];
const TOAST_PLACEMENT_OPTIONS: CheckboxGroupOption[] = TOAST_PLACEMENTS.map(
  placement => ({
    label: placement,
    value: placement,
  }),
);

type ActiveToastKeys = Record<ToastPlacement, number | null>;

function createActiveToastKeys(): ActiveToastKeys {
  return {
    top: null,
    center: null,
    bottom: null,
  };
}

function isToastPlacement(value: CheckboxValue): value is ToastPlacement {
  return TOAST_PLACEMENTS.includes(value as ToastPlacement);
}

const useStyles = createUseSheetStyle(token => ({
  infoPanel: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    padding: token.paddingSM,
    gap: token.marginXXS,
  },
  panel: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    padding: token.paddingSM,
    gap: token.marginXS,
  },
  localPanel: {
    minHeight: token.controlHeightLG * 3,
  },
}));

export function ToastPreview() {
  const styles = useStyles();
  const toast = useToast();
  const [isLocalMountVisible, setIsLocalMountVisible] = React.useState(true);
  const [activeKeys, setActiveKeys] = React.useState<ActiveToastKeys>(
    createActiveToastKeys,
  );

  const closePlacement = (placement: ToastPlacement): void => {
    const activeKey = activeKeys[placement];

    if (activeKey === null) {
      return;
    }

    toast.hide(activeKey);
    setActiveKeys(prevActiveKeys => ({
      ...prevActiveKeys,
      [placement]: null,
    }));
  };

  const openPlacement = (placement: ToastPlacement): void => {
    let nextKey = 0;

    const key = toast.show({
      messageText: `Toast from useToast (${placement})`,
      placement,
      onCancel: () => {
        setActiveKeys(prevActiveKeys => {
          if (prevActiveKeys[placement] !== nextKey) {
            return prevActiveKeys;
          }

          return {
            ...prevActiveKeys,
            [placement]: null,
          };
        });
      },
    });

    nextKey = key;
    setActiveKeys(prevActiveKeys => ({
      ...prevActiveKeys,
      [placement]: key,
    }));
  };

  const togglePlacement = (placement: ToastPlacement): void => {
    if (activeKeys[placement] !== null) {
      closePlacement(placement);
      return;
    }

    openPlacement(placement);
  };

  const selectedPlacements = TOAST_PLACEMENTS.filter(
    placement => activeKeys[placement] !== null,
  );

  const changePlacements = (values: CheckboxValue[]): void => {
    const nextPlacements = values.filter(isToastPlacement);

    TOAST_PLACEMENTS.forEach(placement => {
      const shouldOpen = nextPlacements.includes(placement);
      const isOpen = activeKeys[placement] !== null;

      if (shouldOpen === isOpen) {
        return;
      }

      togglePlacement(placement);
    });
  };

  return (
    <PreviewScaffold>
      <PreviewSection title="文字说明">
        <View style={styles.infoPanel}>
          <Text color="heading" weight="medium">
            useToast
          </Text>
          <Text color="secondary" size="sm">
            useToast 提供 show、hide、clear 三个方法，用于命令式管理 Toast。
          </Text>
          <Text color="secondary" size="sm">
            当前页面中的 Placement checkboxes 使用 useToast.show/hide 控制不同位置的提示。
          </Text>
          <Text color="secondary" size="sm">
            Toast 依赖 PortalProvider；在组件预览应用中由 App 自动注入，无需手动包裹。
          </Text>
        </View>
      </PreviewSection>
      <PreviewSection title="Placement checkboxes">
        <View style={styles.panel}>
          <PreviewRow>
            <Checkbox.Group
              displayType="button"
              options={TOAST_PLACEMENT_OPTIONS}
              value={selectedPlacements}
              onChange={changePlacements}
            />
            <Button
              onPress={() => {
                toast.clear();
                setActiveKeys(createActiveToastKeys());
              }}
            >
              clear
            </Button>
          </PreviewRow>
        </View>
      </PreviewSection>
      <PreviewSection title="Declarative local mount">
        <PreviewRow>
          <Checkbox
            displayType="button"
            value={isLocalMountVisible}
            onChange={setIsLocalMountVisible}
          >
            {isLocalMountVisible ? 'Hide local mount' : 'Show local mount'}
          </Checkbox>
        </PreviewRow>
        <View style={[styles.panel, styles.localPanel]}>
          <Toast
            duration={0}
            messageText="Toast mounted inside this section"
            mountPoint="local"
            open={isLocalMountVisible}
            placement="center"
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
