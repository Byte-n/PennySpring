import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Column,
  Row,
  Text,
  createUseSheetStyle,
  toShadowStyle,
} from '@pennyspring/ui';

import { formatLanCode } from '../../../features/backup/lanProtocol';
import type { LanSessionInfo } from '../../../features/backup/lan';
import { LanDeviceGlyph } from './LanDeviceGlyph';

const LOCAL_CARD_Z_INDEX = 5;
const ONLINE_DOT_SIZE = 8;
const EMITTER_SIZE = 10;

interface LanLocalCardProps {
  session: LanSessionInfo | null;
  code: string;
  connectedPeerName?: string;
  onRefresh: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  card: {
    position: 'absolute' as const,
    left: token.paddingSM,
    right: token.paddingSM,
    bottom: token.paddingSM,
    zIndex: LOCAL_CARD_Z_INDEX,
    padding: token.padding,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    backgroundColor: token.colorBgElevated,
    ...toShadowStyle(token.boxShadow),
  },
  header: {
    alignItems: 'center' as const,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: token.borderRadius,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: token.colorPrimaryBg,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: token.marginXXS,
  },
  codeRow: {
    alignItems: 'flex-end' as const,
    marginTop: token.marginXS,
  },
  code: {
    fontSize: token.fontSizeHeading1,
    lineHeight: token.lineHeightHeading1,
    letterSpacing: token.marginXS,
    fontVariant: ['tabular-nums'] as const,
  },
  online: {
    alignItems: 'center' as const,
    gap: token.marginXXS,
  },
  onlineDot: {
    width: ONLINE_DOT_SIZE,
    height: ONLINE_DOT_SIZE,
    borderRadius: ONLINE_DOT_SIZE / 2,
    backgroundColor: token.colorSuccess,
  },
  emitter: {
    position: 'absolute' as const,
    bottom: -EMITTER_SIZE / 2,
    left: '50%' as const,
    width: EMITTER_SIZE,
    height: EMITTER_SIZE,
    marginLeft: -EMITTER_SIZE / 2,
    borderRadius: EMITTER_SIZE / 2,
    backgroundColor: token.colorPrimary,
    borderWidth: token.lineWidthBold,
    borderColor: token.colorBgElevated,
  },
}));

export function LanLocalCard({
  session,
  code,
  connectedPeerName,
  onRefresh,
}: LanLocalCardProps) {
  const styles = useStyles();

  return (
    <View style={styles.card}>
      <Row align="center" gap="small" style={styles.header}>
        <View style={styles.icon}>
          <LanDeviceGlyph kind="phone" size={20} />
        </View>
        <Column style={styles.text}>
          <Text numberOfLines={1} size="sm" weight="semibold">
            这台设备 · {session?.name ?? '本机'}
          </Text>
          <Text color="tertiary" size="xs">
            {connectedPeerName ? `已连接 ${connectedPeerName}` : '正在等待连接'}
          </Text>
        </Column>
        <Row align="center" gap="small" style={styles.online}>
          <View style={styles.onlineDot} />
          <Text color="secondary" size="xs">
            在线
          </Text>
        </Row>
      </Row>

      <Row align="center" justify="between" style={styles.codeRow}>
        <Text numberOfLines={1} style={styles.code}>
          {formatLanCode(code)}
        </Text>
        <Button onPress={onRefresh} size="small" type="text">
          刷新
        </Button>
      </Row>
      <Text color="tertiary" size="xs">
        对方连接你时输入这组口令 · 10 分钟后自动刷新
      </Text>
      <Text color="tertiary" size="xs">
        只通过局域网传输；不包含 API Key 或服务器连接。
      </Text>
      <View style={styles.emitter} />
    </View>
  );
}
