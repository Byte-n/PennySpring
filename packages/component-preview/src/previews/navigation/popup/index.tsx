import React from 'react';
import { View } from 'react-native';
import { Button, Popup, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { PopupPosition } from '@pennyspring/component';

const POSITIONS: PopupPosition[] = ['bottom', 'top', 'left', 'right', 'center'];

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
  sideBody: {
    justifyContent: 'center',
  },
}));

function PopupContent({ title }: { title: string }) {
  const styles = useStyles();

  return (
    <View style={styles.bodyContent}>
      <Text color="heading" weight="strong">{title}</Text>
      <Text color="secondary">Popup content can host actions, forms and contextual details.</Text>
      <View style={styles.footer}>
        <Button size="small">Cancel</Button>
        <Button size="small" type="primary">OK</Button>
      </View>
    </View>
  );
}

export function PopupPreview() {
  const styles = useStyles();
  const [position, setPosition] = React.useState<PopupPosition>('bottom');

  return (
    <PreviewScaffold>
      <PreviewSection title="Position">
        <PreviewRow>
          {POSITIONS.map(item => (
            <Button
              key={item}
              type={position === item ? 'primary' : 'default'}
              size="small"
              onPress={() => {
                setPosition(item);
              }}
            >
              {item}
            </Button>
          ))}
        </PreviewRow>
        <View style={styles.frame}>
          <Popup
            open
            animation="slide"
            closeOnMaskClick={false}
            position={position}
            style={styles.frame}
            styles={{ body: position === 'left' || position === 'right' ? styles.sideBody : undefined }}
          >
            <PopupContent title={`${position} popup`} />
          </Popup>
        </View>
      </PreviewSection>

      <PreviewSection title="Size and mask">
        <View style={styles.frame}>
          <Popup
            open
            mask={false}
            position="center"
            size="small"
            style={styles.frame}
          >
            <PopupContent title="Center without mask" />
          </Popup>
        </View>
      </PreviewSection>

      <PreviewSection title="Default open">
        <View style={styles.frame}>
          <Popup defaultOpen position="bottom" size="large" style={styles.frame}>
            <PopupContent title="Large bottom popup" />
          </Popup>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
