import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Checkbox,
  Message,
  Text,
  useMessage,
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
  MessagePlacement,
} from '@pennyspring/component';

const MESSAGE_PLACEMENTS: readonly MessagePlacement[] = ['top', 'bottom'];
const MESSAGE_PLACEMENT_OPTIONS: CheckboxGroupOption[] = MESSAGE_PLACEMENTS.map(
  placement => ({
    label: placement,
    value: placement,
  }),
);

type ActiveMessageKeys = Record<MessagePlacement, number | null>;

function createActiveMessageKeys(): ActiveMessageKeys {
  return {
    top: null,
    bottom: null,
  };
}

function isMessagePlacement(value: CheckboxValue): value is MessagePlacement {
  return MESSAGE_PLACEMENTS.includes(value as MessagePlacement);
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

export function MessagePreview() {
  const styles = useStyles();
  const message = useMessage();
  const [isLocalMountVisible, setIsLocalMountVisible] = React.useState(true);
  const [activeKeys, setActiveKeys] = React.useState<ActiveMessageKeys>(
    createActiveMessageKeys,
  );

  const closePlacement = (placement: MessagePlacement): void => {
    const activeKey = activeKeys[placement];

    if (activeKey === null) {
      return;
    }

    message.hide(activeKey);
    setActiveKeys(prevActiveKeys => ({
      ...prevActiveKeys,
      [placement]: null,
    }));
  };

  const openPlacement = (placement: MessagePlacement): void => {
    let nextKey = 0;

    const key = message.show({
      messageText: `Message from useMessage (${placement})`,
      type: 'warning',
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

  const togglePlacement = (placement: MessagePlacement): void => {
    if (activeKeys[placement] !== null) {
      closePlacement(placement);
      return;
    }

    openPlacement(placement);
  };

  const selectedPlacements = MESSAGE_PLACEMENTS.filter(
    placement => activeKeys[placement] !== null,
  );

  const changePlacements = (values: CheckboxValue[]): void => {
    const nextPlacements = values.filter(isMessagePlacement);

    MESSAGE_PLACEMENTS.forEach(placement => {
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
            useMessage
          </Text>
          <Text color="secondary" size="sm">
            useMessage 提供 show、hide、clear 三个方法，用于命令式管理 Message。
          </Text>
          <Text color="secondary" size="sm">
            当前页面中的 Placement checkboxes 使用 useMessage.show/hide 控制顶部与底部消息条。
          </Text>
          <Text color="secondary" size="sm">
            Message 依赖 PortalProvider；在组件预览应用中由 App 自动注入，无需手动包裹。
          </Text>
        </View>
      </PreviewSection>
      <PreviewSection title="Placement checkboxes">
        <View style={styles.panel}>
          <PreviewRow>
            <Checkbox.Group
              displayType="button"
              options={MESSAGE_PLACEMENT_OPTIONS}
              value={selectedPlacements}
              onChange={changePlacements}
            />
            <Button
              onPress={() => {
                message.clear();
                setActiveKeys(createActiveMessageKeys());
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
          <Message
            duration={0}
            messageText="Message mounted inside this section"
            mountPoint="local"
            open={isLocalMountVisible}
            placement="top"
            type="success"
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
