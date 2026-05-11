import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Checkbox,
  Notification,
  type NotificationPlacement,
  useNotification,
} from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type {
  CheckboxGroupOption,
  CheckboxValue,
} from '@pennyspring/component';

const NOTIFICATION_PLACEMENTS: readonly NotificationPlacement[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];
const NOTIFICATION_PLACEMENT_OPTIONS: CheckboxGroupOption[] =
  NOTIFICATION_PLACEMENTS.map(placement => ({
    label: placement,
    value: placement,
  }));

type ActiveNotificationKeys = Record<NotificationPlacement, number | null>;

function createActiveNotificationKeys(): ActiveNotificationKeys {
  return {
    'top-left': null,
    'top-right': null,
    'bottom-left': null,
    'bottom-right': null,
  };
}

function isNotificationPlacement(
  value: CheckboxValue,
): value is NotificationPlacement {
  return NOTIFICATION_PLACEMENTS.includes(value as NotificationPlacement);
}

const useStyles = createUseSheetStyle(token => ({
  panel: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    padding: token.paddingSM,
    gap: token.marginXS,
  },
  localPanel: {
    minHeight: token.controlHeightLG * 4,
  },
}));

export function NotificationPreview() {
  const styles = useStyles();
  const notification = useNotification();
  const [isLocalMountVisible, setIsLocalMountVisible] = React.useState(true);
  const [activeKeys, setActiveKeys] =
    React.useState<ActiveNotificationKeys>(createActiveNotificationKeys);

  const closePlacement = (placement: NotificationPlacement): void => {
    const activeKey = activeKeys[placement];

    if (activeKey === null) {
      return;
    }

    notification.hide(activeKey);
    setActiveKeys(prevActiveKeys => ({
      ...prevActiveKeys,
      [placement]: null,
    }));
  };

  const openPlacement = (placement: NotificationPlacement): void => {
    let nextKey = 0;

    const key = notification.show({
      titleText: 'Budget updated',
      descriptionText: `Notification from useNotification (${placement})`,
      type: 'info',
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

  const togglePlacement = (placement: NotificationPlacement): void => {
    if (activeKeys[placement] !== null) {
      closePlacement(placement);
      return;
    }

    openPlacement(placement);
  };

  const selectedPlacements = NOTIFICATION_PLACEMENTS.filter(
    placement => activeKeys[placement] !== null,
  );

  const changePlacements = (values: CheckboxValue[]): void => {
    const nextPlacements = values.filter(isNotificationPlacement);

    NOTIFICATION_PLACEMENTS.forEach(placement => {
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
      <PreviewSection title="Placement checkboxes">
        <View style={styles.panel}>
          <PreviewRow>
            <Checkbox.Group
              displayType="button"
              options={NOTIFICATION_PLACEMENT_OPTIONS}
              value={selectedPlacements}
              onChange={changePlacements}
            />
            <Button
              onPress={() => {
                notification.clear();
                setActiveKeys(createActiveNotificationKeys());
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
          <Notification
            descriptionText="Notification mounted inside this section"
            duration={0}
            mountPoint="local"
            open={isLocalMountVisible}
            placement="top-right"
            titleText="Local notification"
            type="info"
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
