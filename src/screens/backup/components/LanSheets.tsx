import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Column,
  Loading,
  Popup,
  Row,
  Text,
  createUseSheetStyle,
} from '@pennyspring/ui';

import { formatBytes } from '../../../features/transfer';
import type {
  LanIncomingPair,
  LanOffer,
} from '../../../features/backup/useLanSession';
import type { LanPeer } from '../../../features/backup/lanProtocol';
import { LanDeviceGlyph } from './LanDeviceGlyph';
import { LanKeypad } from './LanKeypad';

const OTP_CELL_WIDTH = 44;
const OTP_CELL_HEIGHT = 52;

const useStyles = createUseSheetStyle(token => ({
  content: {
    gap: token.marginSM,
  },
  otpRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: token.marginXS,
    marginTop: token.marginXS,
  },
  otpCell: {
    flex: 1,
    maxWidth: OTP_CELL_WIDTH,
    height: OTP_CELL_HEIGHT,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillQuaternary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: token.lineWidth,
    borderColor: 'transparent' as const,
  },
  otpCellActive: {
    borderColor: token.colorPrimary,
    backgroundColor: token.colorPrimaryBg,
  },
  otpCellError: {
    borderColor: token.colorError,
    backgroundColor: token.colorErrorBg,
  },
  otpText: {
    fontSize: token.fontSizeHeading4,
    lineHeight: token.lineHeightHeading4,
    fontVariant: ['tabular-nums'] as const,
  },
  verifyStrip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: token.marginSM,
    padding: token.paddingSM,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillQuaternary,
  },
  verifyCode: {
    fontSize: token.fontSizeHeading4,
    lineHeight: token.lineHeightHeading4,
    letterSpacing: token.marginXXS,
    fontVariant: ['tabular-nums'] as const,
  },
  actions: {
    flexDirection: 'row' as const,
    gap: token.marginXS,
    marginTop: token.marginXS,
  },
  action: {
    flex: 1,
  },
  deviceIcon: {
    width: 54,
    height: 54,
    borderRadius: token.borderRadiusLG,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: token.colorPrimaryBg,
  },
  deviceHead: {
    alignItems: 'center' as const,
    gap: token.marginSM,
  },
  bookList: {
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  bookRow: {
    paddingVertical: token.paddingXS,
    borderBottomWidth: token.lineWidth,
    borderBottomColor: token.colorSplit,
    gap: token.marginXXS,
  },
}));

interface LanPairSheetProps {
  open: boolean;
  target: LanPeer | null;
  code: string;
  phase: 'input' | 'waiting';
  verificationCode: string;
  errorText: string;
  onChangeCode: (code: string) => void;
  onConnect: () => void;
  onCancel: () => void;
}

export function LanPairSheet({
  open,
  target,
  code,
  phase,
  verificationCode,
  errorText,
  onChangeCode,
  onConnect,
  onCancel,
}: LanPairSheetProps) {
  const styles = useStyles();

  return (
    <Popup
      closeOnMaskClick={phase === 'input'}
      onCancel={onCancel}
      open={open}
      position="bottom"
    >
      <Column style={styles.content}>
        {phase === 'waiting' ? (
          <>
            <Loading text="等待对方允许" variant="block" />
            <Text color="secondary" size="sm">
              已向 {target?.name ?? '对方设备'}{' '}
              发送连接请求。对方核对校验码并点允许后，连接才会建立。
            </Text>
            <View style={styles.verifyStrip}>
              <Text color="secondary" size="sm">
                本次校验码
              </Text>
              <Text style={styles.verifyCode}>{verificationCode}</Text>
            </View>
            <Button block onPress={onCancel} type="dashed">
              取消连接
            </Button>
          </>
        ) : (
          <>
            <Text size="h4" weight="semibold">
              连接 {target?.name ?? '附近设备'}
            </Text>
            <Text color="tertiary" size="sm">
              输入对方屏幕上显示的 6 位口令
            </Text>

            <View style={styles.otpRow}>
              {Array.from({ length: 6 }).map((_, index) => {
                const digit = code[index] ?? '';
                const isActive = index === code.length && code.length < 6;
                const isError = Boolean(errorText);
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpCell,
                      isActive ? styles.otpCellActive : undefined,
                      isError ? styles.otpCellError : undefined,
                    ]}
                  >
                    <Text style={styles.otpText}>{digit}</Text>
                  </View>
                );
              })}
            </View>

            {errorText ? (
              <Text color="errorText" size="sm">
                {errorText}
              </Text>
            ) : null}

            <LanKeypad
              onPress={value => {
                if (value === 'clear') {
                  onChangeCode('');
                  return;
                }
                if (value === 'delete') {
                  onChangeCode(code.slice(0, -1));
                  return;
                }
                if (code.length < 6) {
                  onChangeCode(`${code}${value}`);
                }
              }}
            />

            <Button
              block
              disabled={code.length !== 6}
              onPress={onConnect}
              type="primary"
            >
              连接
            </Button>
            <Button block onPress={onCancel} type="dashed">
              取消
            </Button>
          </>
        )}
      </Column>
    </Popup>
  );
}

interface LanPairRequestSheetProps {
  open: boolean;
  pair: LanIncomingPair | null;
  busy: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export function LanPairRequestSheet({
  open,
  pair,
  busy,
  onAllow,
  onDeny,
}: LanPairRequestSheetProps) {
  const styles = useStyles();

  return (
    <Popup closeOnMaskClick={false} open={open} position="bottom">
      <Column style={styles.content}>
        <Column style={styles.deviceHead}>
          <View style={styles.deviceIcon}>
            <LanDeviceGlyph
              kind={pair?.peer.platform === 'ios' ? 'tablet' : 'phone'}
              size={28}
            />
          </View>
          <Text size="h4" weight="semibold">
            连接请求
          </Text>
          <Text color="secondary" size="sm" textAlign="center">
            {pair?.peer.name ?? '附近设备'} 想连接这台设备
          </Text>
        </Column>

        <View style={styles.verifyStrip}>
          <Text color="secondary" size="sm">
            请核对对方屏幕
          </Text>
          <Text style={styles.verifyCode}>
            {pair?.verificationCode ?? '----'}
          </Text>
        </View>
        <Text color="tertiary" size="sm">
          两端显示相同的校验码才允许连接。允许后，对方才能发送账本。
        </Text>

        <Row gap="small" style={styles.actions}>
          <Button
            disabled={busy}
            onPress={onDeny}
            style={styles.action}
            type="dashed"
          >
            拒绝
          </Button>
          <Button
            loading={busy}
            onPress={onAllow}
            style={styles.action}
            type="primary"
          >
            允许
          </Button>
        </Row>
      </Column>
    </Popup>
  );
}

interface LanOfferSheetProps {
  open: boolean;
  offer: LanOffer | null;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function LanOfferSheet({
  open,
  offer,
  busy,
  onAccept,
  onDecline,
}: LanOfferSheetProps) {
  const styles = useStyles();
  const totalRecords = offer?.totalRecords ?? 0;

  return (
    <Popup closeOnMaskClick={false} open={open} position="bottom">
      <Column style={styles.content}>
        <Text size="h4" weight="semibold">
          传输提议
        </Text>
        <Text color="secondary" size="sm">
          {offer?.peer.name ?? '对方设备'} 想发送 {offer?.books.length ?? 0}{' '}
          个账本
        </Text>

        <View style={styles.bookList}>
          {offer?.books.map((book, index) => (
            <Row
              align="center"
              justify="between"
              key={`${book.name}-${index}`}
              style={styles.bookRow}
            >
              <Text size="sm">{book.name}</Text>
              <Text color="tertiary" size="xs">
                {book.records.toLocaleString('zh-CN')} 条 · {book.assets} 个资产
              </Text>
            </Row>
          ))}
        </View>

        <View style={styles.verifyStrip}>
          <Text color="secondary" size="sm">
            合计
          </Text>
          <Text style={styles.verifyCode}>
            {totalRecords.toLocaleString('zh-CN')} 条 ·{' '}
            {formatBytes(offer?.sizeBytes ?? 0)}
          </Text>
        </View>
        <Text color="tertiary" size="xs">
          会新建账本，不覆盖现有数据；不包含 API Key、AI
          提供商配置或服务器连接。
        </Text>

        <Row gap="small" style={styles.actions}>
          <Button
            disabled={busy}
            onPress={onDecline}
            style={styles.action}
            type="dashed"
          >
            拒绝
          </Button>
          <Button
            loading={busy}
            onPress={onAccept}
            style={styles.action}
            type="primary"
          >
            接受并下载
          </Button>
        </Row>
      </Column>
    </Popup>
  );
}

interface LanOfferWaitingSheetProps {
  open: boolean;
  offer: LanOffer | null;
  onCancel: () => void;
}

export function LanOfferWaitingSheet({
  open,
  offer,
  onCancel,
}: LanOfferWaitingSheetProps) {
  const styles = useStyles();

  return (
    <Popup closeOnMaskClick={false} open={open} position="bottom">
      <Column style={styles.content}>
        <Loading text="等待对方接受" variant="block" />
        <Text color="secondary" size="sm" textAlign="center">
          已向 {offer?.peer.name ?? '对方设备'} 发送传输提议：
          {offer?.books.length ?? 0} 个账本 ·{' '}
          {(offer?.totalRecords ?? 0).toLocaleString('zh-CN')} 条流水 ·{' '}
          {formatBytes(offer?.sizeBytes ?? 0)}
        </Text>
        <View style={styles.verifyStrip}>
          <Text color="secondary" size="sm">
            提议有效期
          </Text>
          <Text style={styles.verifyCode}>2 分钟</Text>
        </View>
        <Button block onPress={onCancel} type="dashed">
          撤回提议
        </Button>
      </Column>
    </Popup>
  );
}
