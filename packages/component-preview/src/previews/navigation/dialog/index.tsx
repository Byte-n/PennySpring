import React from 'react';
import { View } from 'react-native';
import { Button, Dialog, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../../PreviewScaffold';
import type {
  DialogCancelParams,
  DialogOpenChangeParams,
} from '@pennyspring/component';

type DialogDemoKey = 'controlled' | 'disabled' | 'custom' | 'locked';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  body: {
    gap: token.marginXS,
  },
  customTitle: {
    gap: token.marginXXS,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: token.marginXS,
  },
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

function getDialogTitle(key: DialogDemoKey): string {
  if (key === 'disabled') {
    return 'Disabled action';
  }

  if (key === 'custom') {
    return 'Custom content';
  }

  if (key === 'locked') {
    return 'Mask locked dialog';
  }

  return 'Controlled dialog';
}

interface DialogBodyProps {
  description: string;
  detail?: string;
}

function DialogBody({ description, detail }: DialogBodyProps) {
  const styles = useStyles();

  return (
    <View style={styles.body}>
      <Text color="secondary">{description}</Text>
      {detail ? (
        <Text color="description" size="sm">
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

export function DialogPreview() {
  const styles = useStyles();
  const [openDialog, setOpenDialog] =
    React.useState<DialogDemoKey | null>(null);
  const [lastEvent, setLastEvent] = React.useState('No dialog action yet');
  const isOpen = (key: DialogDemoKey): boolean => openDialog === key;

  const open = (key: DialogDemoKey): void => {
    setLastEvent(`Opened ${getDialogTitle(key)}`);
    setOpenDialog(key);
  };

  const close = (
    key: DialogDemoKey,
    source: DialogCancelParams['reason'] | DialogOpenChangeParams['reason'],
  ): void => {
    setLastEvent(`${getDialogTitle(key)} closed by ${source}`);
    setOpenDialog(null);
  };

  return (
    <PreviewScaffold>
      <PreviewSection title="Controlled">
        <PreviewRow>
          <Button
            type={isOpen('controlled') ? 'primary' : 'default'}
            onPress={() => {
              open('controlled');
            }}
          >
            Open
          </Button>
          <Button
            type={isOpen('locked') ? 'primary' : 'default'}
            onPress={() => {
              open('locked');
            }}
          >
            Mask locked
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="State and slots">
        <PreviewRow>
          <Button
            type={isOpen('disabled') ? 'primary' : 'default'}
            onPress={() => {
              open('disabled');
            }}
          >
            Open disabled action
          </Button>
          <Button
            type={isOpen('custom') ? 'primary' : 'default'}
            onPress={() => {
              open('custom');
            }}
          >
            Open custom slots
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Event feedback">
        <View style={styles.statusLine}>
          <Text color="description" size="sm">
            {lastEvent}
          </Text>
        </View>
      </PreviewSection>

      <Dialog
        open={isOpen('controlled')}
        titleText="Controlled dialog"
        cancelText="Cancel"
        okText="OK"
        onCancel={params => {
          close('controlled', params.reason);
        }}
        onOk={() => {
          close('controlled', 'ok');
        }}
        onOpenChange={(nextOpen, params) => {
          if (!nextOpen) {
            close('controlled', params.reason);
          }
        }}
      >
        <DialogBody
          description="Dialog content supports text, forms and custom actions."
          detail="Mask, cancel and confirm paths report their close reason."
        />
      </Dialog>
      <Dialog
        open={isOpen('disabled')}
        titleText="Disabled action"
        cancelText="Back"
        okText="OK"
        okDisabled
        onCancel={params => {
          close('disabled', params.reason);
        }}
        onOpenChange={(nextOpen, params) => {
          if (!nextOpen) {
            close('disabled', params.reason);
          }
        }}
      >
        <DialogBody
          description="The confirm action is disabled while required input is incomplete."
          detail="Use Cancel or the mask to close this state."
        />
      </Dialog>
      <Dialog
        open={isOpen('custom')}
        title={
          <View style={styles.customTitle}>
            <Text color="heading" size="h5" weight="strong">
              Review changes
            </Text>
            <Text color="description" size="sm">
              Custom title node
            </Text>
          </View>
        }
        cancel="Keep editing"
        ok="Apply now"
        onCancel={params => {
          close('custom', params.reason);
        }}
        onOk={() => {
          close('custom', 'ok');
        }}
        onOpenChange={(nextOpen, params) => {
          if (!nextOpen) {
            close('custom', params.reason);
          }
        }}
      >
        <View style={styles.stack}>
          <DialogBody
            description="Title and action content can be replaced with custom nodes."
            detail="The dialog keeps the same spacing and footer layout."
          />
          <View style={styles.footerRow}>
            <Text color="tertiary" size="sm">
              3 pending fields
            </Text>
          </View>
        </View>
      </Dialog>
      <Dialog
        open={isOpen('locked')}
        titleText="Mask locked dialog"
        cancelText="Close"
        okText="Confirm"
        closeOnMaskClick={false}
        onCancel={params => {
          close('locked', params.reason);
        }}
        onOk={() => {
          close('locked', 'ok');
        }}
        onOpenChange={(nextOpen, params) => {
          if (!nextOpen) {
            close('locked', params.reason);
          }
        }}
      >
        <DialogBody
          description="Mask taps are ignored for workflows that need an explicit choice."
          detail="Use Close or Confirm to dismiss this dialog."
        />
      </Dialog>
    </PreviewScaffold>
  );
}
