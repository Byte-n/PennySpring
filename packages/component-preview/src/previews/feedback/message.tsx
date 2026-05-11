import React from 'react';
import { View } from 'react-native';
import { Button, Message, Text, message, MessagePortal } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../PreviewScaffold';
import type { MessageType } from '@pennyspring/component';

const useStyles = createUseSheetStyle(token => ({
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

function MessageDemo() {
  const styles = useStyles();
  const [controlledOpen, setControlledOpen] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No message action yet');

  const showMessage = (type: MessageType): void => {
    message.show({
      contentText: `${type.charAt(0).toUpperCase() + type.slice(1)} message`,
      type,
      duration: 3000,
      onCancel: () => setLastEvent(`${type} message closed`),
    });
    setLastEvent(`Showed ${type} message`);
  };

  return (
    <PreviewScaffold>
      <PreviewSection title="Type variants">
        <PreviewRow>
          <Button
            onPress={() => showMessage('info')}
            size="small"
          >
            Info
          </Button>
          <Button
            onPress={() => showMessage('success')}
            size="small"
          >
            Success
          </Button>
          <Button
            onPress={() => showMessage('warning')}
            size="small"
          >
            Warning
          </Button>
          <Button
            onPress={() => showMessage('error')}
            size="small"
          >
            Error
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Declarative">
        <PreviewRow>
          <Button
            onPress={() => setControlledOpen(true)}
            size="small"
          >
            Show controlled
          </Button>
          <Button
            onPress={() => {
              message.show({
                contentText: 'Persistent message (duration=0)',
                duration: 0,
                closeable: true,
              });
            }}
            size="small"
          >
            Persistent
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

      <Message
        open={controlledOpen}
        contentText="Controlled message"
        type="info"
        duration={3000}
        onCancel={() => {
          setLastEvent('Controlled message dismissed');
          setControlledOpen(false);
        }}
      />
    </PreviewScaffold>
  );
}

export function MessagePreview() {
  return (
    <>
      <MessagePortal />
      <MessageDemo />
    </>
  );
}
