import React from 'react';
import { View } from 'react-native';
import { Button, Dialog, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { DialogSize } from '@pennyspring/component';

const DIALOG_SIZES: DialogSize[] = ['small', 'normal', 'large'];

const useStyles = createUseSheetStyle(token => ({
  frame: {
    minHeight: token.controlHeightLG * 5,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    overflow: 'hidden',
    backgroundColor: token.colorBgLayout,
  },
  body: {
    gap: token.marginSM,
  },
}));

export function DialogPreview() {
  const styles = useStyles();
  const [size, setSize] = React.useState<DialogSize>('normal');
  const [open, setOpen] = React.useState(true);

  return (
    <PreviewScaffold>
      <PreviewSection title="Controlled">
        <PreviewRow>
          <Button
            size="small"
            type={open ? 'primary' : 'default'}
            onPress={() => {
              setOpen(true);
            }}
          >
            Open
          </Button>
          <Button
            size="small"
            onPress={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
        </PreviewRow>
        <View style={styles.frame}>
          <Dialog
            open={open}
            closeOnMaskClick={false}
            titleText="Controlled dialog"
            cancelText="Cancel"
            okText="OK"
            onCancel={() => {
              setOpen(false);
            }}
            onOk={() => {
              setOpen(false);
            }}
            onOpenChange={setOpen}
          >
            <Text color="secondary">
              Dialog content supports text, forms and custom actions.
            </Text>
          </Dialog>
        </View>
      </PreviewSection>

      <PreviewSection title="Size">
        <PreviewRow>
          {DIALOG_SIZES.map(item => (
            <Button
              key={item}
              size="small"
              type={size === item ? 'primary' : 'default'}
              onPress={() => {
                setSize(item);
              }}
            >
              {item}
            </Button>
          ))}
        </PreviewRow>
        <View style={styles.frame}>
          <Dialog
            open
            size={size}
            closeOnMaskClick={false}
            titleText={`${size} dialog`}
            cancelText="Later"
            okText="Apply"
          >
            <View style={styles.body}>
              <Text color="secondary">
                The panel spacing and radius follow the selected size.
              </Text>
              <Text color="description" size="sm">
                Selected size: {size}
              </Text>
            </View>
          </Dialog>
        </View>
      </PreviewSection>

      <PreviewSection title="State">
        <View style={styles.frame}>
          <Dialog
            defaultOpen
            closeOnMaskClick={false}
            titleText="Disabled action"
            cancelText="Back"
            okText="OK"
            okDisabled
          >
            <Text color="secondary">
              The confirm action is disabled while required input is incomplete.
            </Text>
          </Dialog>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
