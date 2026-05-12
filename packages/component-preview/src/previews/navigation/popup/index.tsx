import React from 'react';
import { View } from 'react-native';
import { Button, Popup, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../../PreviewScaffold';
import type { PopupPosition } from '@pennyspring/component';

const POSITIONS: PopupPosition[] = ['bottom', 'top', 'left', 'right', 'center'];
type PopupAnimationDemo = 'slide' | 'fade' | 'none';

const useStyles = createUseSheetStyle(token => ({
  frame: {
    minHeight: token.controlHeightLG * 5,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    overflow: 'hidden',
    backgroundColor: token.colorBgLayout,
  },
  bodyContent: {
    gap: token.marginSM,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: token.marginXS,
  },
  meta: {
    gap: token.marginXXS,
  },
  sideBody: {
    justifyContent: 'center',
  },
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

interface PopupContentProps {
  description?: string;
  detail?: string;
  onClose: () => void;
  title: string;
}

function PopupContent({
  description = 'Popup content can host actions, forms and contextual details.',
  detail,
  onClose,
  title,
}: PopupContentProps) {
  const styles = useStyles();

  return (
    <View style={styles.bodyContent}>
      <Text color="heading" weight="strong">
        {title}
      </Text>
      <View style={styles.meta}>
        <Text color="secondary">{description}</Text>
        {detail ? (
          <Text color="description" size="sm">
            {detail}
          </Text>
        ) : null}
      </View>
      <View style={styles.footer}>
        <Button onPress={onClose}>Cancel</Button>
        <Button type="primary" onPress={onClose}>
          OK
        </Button>
      </View>
    </View>
  );
}

export function PopupPreview() {
  const styles = useStyles();
  const [position, setPosition] = React.useState<PopupPosition>('bottom');
  const [animation, setAnimation] = React.useState<PopupAnimationDemo>('slide');
  const [positionOpen, setPositionOpen] = React.useState(false);
  const [centerOpen, setCenterOpen] = React.useState(false);
  const [lockedOpen, setLockedOpen] = React.useState(false);
  const [floatingOpen, setFloatingOpen] = React.useState(false);
  const [floatingSize, setFloatingSize] = React.useState<'small' | 'normal' | 'large'>('normal');
  const [floatingPosition, setFloatingPosition] = React.useState<'top' | 'bottom'>('bottom');
  const [floatingHeight, setFloatingHeight] = React.useState(260);
  const [lastEvent, setLastEvent] = React.useState('No popup action yet');

  const closePositionPopup = (source: string): void => {
    setLastEvent(`${position} popup closed by ${source}`);
    setPositionOpen(false);
  };

  return (
    <PreviewScaffold>
      <PreviewSection title="Position">
        <PreviewRow>
          {POSITIONS.map(item => (
            <Button
              key={item}
              type={position === item ? 'primary' : 'default'}
              onPress={() => {
                setPosition(item);
                setLastEvent(`Opened ${item} popup`);
                setPositionOpen(true);
              }}
            >
              Open {item}
            </Button>
          ))}
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Animation">
        <PreviewRow>
          {(['slide', 'fade', 'none'] as const).map(item => (
            <Button
              key={item}
              type={animation === item ? 'primary' : 'default'}
              onPress={() => {
                setAnimation(item);
                setLastEvent(`Animation set to ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Mask and close behavior">
        <PreviewRow>
          <Button
            type={centerOpen ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened center popup without mask');
              setCenterOpen(true);
            }}
          >
            No mask
          </Button>
          <Button
            type={lockedOpen ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened locked popup');
              setLockedOpen(true);
            }}
          >
            Mask locked
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="FloatingPanel">
        <PreviewRow>
          <Button
            type={floatingOpen ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened floating panel');
              setFloatingOpen(true);
            }}
          >
            Open panel
          </Button>
          {(['small', 'normal', 'large'] as const).map(item => (
            <Button
              key={item}
              type={floatingSize === item ? 'primary' : 'default'}
              onPress={() => {
                setFloatingSize(item);
                setLastEvent(`Floating panel size set to ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
          {(['bottom', 'top'] as const).map(item => (
            <Button
              key={item}
              type={floatingPosition === item ? 'primary' : 'default'}
              onPress={() => {
                setFloatingPosition(item);
                setLastEvent(`Floating panel position set to ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Event feedback">
        <View style={styles.statusLine}>
          <Text color="description" size="sm">
            {lastEvent}
          </Text>
        </View>
      </PreviewSection>

      <Popup
        open={centerOpen}
        animation="fade"
        mask={false}
        position="center"
        style={styles.frame}
        onOpenChange={(nextOpen, params) => {
          setCenterOpen(nextOpen);
          if (!nextOpen) {
            setLastEvent(`Center popup closed by ${params.reason}`);
          }
        }}
      >
        <PopupContent
          title="Center without mask"
          description="A centered popup can be displayed without a mask."
          detail="Use the content actions to close it."
          onClose={() => {
            setLastEvent('Center popup closed by action');
            setCenterOpen(false);
          }}
        />
      </Popup>
      <Popup
        open={positionOpen}
        animation={animation}
        position={position}
        style={styles.frame}
        styles={{
          body:
            position === 'left' || position === 'right'
              ? styles.sideBody
              : undefined,
        }}
        onCancel={params => {
          setLastEvent(`${position} popup cancelled by ${params.reason}`);
        }}
        onOpenChange={(nextOpen, params) => {
          setPositionOpen(nextOpen);
          if (!nextOpen) {
            setLastEvent(`${position} popup closed by ${params.reason}`);
          }
        }}
      >
        <PopupContent
          title={`${position} popup`}
          onClose={() => {
            closePositionPopup('action');
          }}
          detail={`Animation: ${animation}`}
        />
      </Popup>
      <Popup
        open={lockedOpen}
        animation="slide"
        closeOnMaskClick={false}
        position="bottom"
        style={styles.frame}
        onOpenChange={(nextOpen, params) => {
          setLockedOpen(nextOpen);
          if (!nextOpen) {
            setLastEvent(`Locked popup closed by ${params.reason}`);
          }
        }}
      >
        <PopupContent
          title="Mask locked popup"
          description="Mask taps are ignored when closeOnMaskClick is false."
          detail="Use Cancel or OK to close this popup."
          onClose={() => {
            setLastEvent('Locked popup closed by action');
            setLockedOpen(false);
          }}
        />
      </Popup>
      <Popup.FloatingPanel
        open={floatingOpen}
        value={floatingHeight}
        minHeight={180}
        maxHeight={420}
        size={floatingSize}
        position={floatingPosition}
        onChange={nextHeight => {
          setFloatingHeight(nextHeight);
        }}
        onOpenChange={(nextOpen, params) => {
          setFloatingOpen(nextOpen);
          if (!nextOpen) {
            setLastEvent(`Floating panel closed by ${params.reason}`);
          }
        }}
      >
        <PopupContent
          title="Floating panel"
          description="Drag the handle to resize between min and max height."
          detail={`Height: ${String(Math.round(floatingHeight))}`}
          onClose={() => {
            setLastEvent('Floating panel closed by action');
            setFloatingOpen(false);
          }}
        />
      </Popup.FloatingPanel>
    </PreviewScaffold>
  );
}
