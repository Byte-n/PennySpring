import React from 'react';
import { Button, Popup, Row } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import {
  ClockCounterClockwiseIcon,
  GearSixIcon,
  PlusIcon,
} from 'phosphor-react-native';

const useStyles = createUseSheetStyle(() => ({
  panelBody: {
    padding: 0,
  },
}));

export interface AgentDrawerFrameProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSession?: () => void;
  createSessionDisabled?: boolean;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  children: React.ReactNode;
}

export function AgentDrawerFrame({
  open,
  onOpenChange,
  onCreateSession,
  createSessionDisabled = false,
  onOpenSessions,
  onOpenSettings,
  children,
}: AgentDrawerFrameProps): React.ReactElement {
  const styles = useStyles();

  return (
    <Popup.FloatingPanel
      bodyScrollable={false}
      height="82%"
      keyboardAvoiding
      maxHeight="95%"
      minHeight="45%"
      // 自定义 Portal 会丢失 assistant-ui 的 React context，Agent 弹层必须本地挂载。
      mountPoint="local"
      onOpenChange={onOpenChange}
      open={open}
      position="bottom"
      renderFooter={null}
      renderHeaderRight={() => (
        <Row align="center" gap="small">
          {onCreateSession ? (
            <Button
              disabled={createSessionDisabled}
              icon={PlusIcon}
              onPress={onCreateSession}
              shape="circle"
              size="small"
              testID="agent-new-session-button"
              type="text"
            />
          ) : null}
          <Button
            icon={ClockCounterClockwiseIcon}
            onPress={onOpenSessions}
            shape="circle"
            size="small"
            testID="agent-sessions-button"
            type="text"
          />
          <Button
            icon={GearSixIcon}
            onPress={onOpenSettings}
            shape="circle"
            size="small"
            testID="agent-settings-button"
            type="text"
          />
        </Row>
      )}
      styles={{ panelBody: styles.panelBody }}
      titleText="记账助手"
    >
      {children}
    </Popup.FloatingPanel>
  );
}
