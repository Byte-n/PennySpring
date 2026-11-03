import React from 'react';
import {
  Card,
  Column,
  Loading,
  Progress,
  Row,
  Text,
  createUseSheetStyle,
} from '@pennyspring/ui';

import { formatBytes } from '../../../features/transfer';
import type { LanTransferState } from '../../../features/backup/useLanSession';

interface LanTransferCardProps {
  transfer: LanTransferState;
}

const useStyles = createUseSheetStyle(token => ({
  content: {
    gap: token.marginXS,
  },
  head: {
    alignItems: 'center' as const,
  },
  note: {
    marginTop: token.marginXS,
  },
}));

export function LanTransferCard({ transfer }: LanTransferCardProps) {
  const styles = useStyles();
  const isReceiving = transfer.direction === 'receive';

  return (
    <Card titleText={isReceiving ? '正在接收' : '正在发送'}>
      <Column style={styles.content}>
        <Row align="center" justify="between" style={styles.head}>
          <Text size="sm" weight="semibold">
            {transfer.fileName}
          </Text>
          <Text color="tertiary" size="xs">
            {isReceiving
              ? `${formatBytes(transfer.bytesRead)} / ${formatBytes(
                  transfer.sizeBytes,
                )}`
              : formatBytes(transfer.sizeBytes)}
          </Text>
        </Row>

        {isReceiving ? (
          <Progress.Bar percent={transfer.percent} showInfo />
        ) : (
          <Loading text="对方已接受，正在传输" variant="inline" />
        )}

        <Text color="tertiary" size="xs" style={styles.note}>
          请保持两台设备在同一 Wi-Fi，并停留在此页面。
        </Text>
      </Column>
    </Card>
  );
}
