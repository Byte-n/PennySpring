import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRequest } from 'ahooks';
import { fromByteArray } from 'base64-js';
import { ArrowClockwiseIcon } from 'phosphor-react-native';
import {
  BOOK_TYPE,
  localApi,
  type ApplyLibrarySnapshotResult,
  type BookRow,
} from '@pennyspring/api';
import {
  Button,
  Column,
  Result,
  Text,
  createUseSheetStyle,
  toShadowStyle,
  useTheme,
  useToast,
} from '@pennyspring/ui';

import { useLanSession } from '../../features/backup/useLanSession';
import {
  deleteFileUri,
  writePackageToCache,
} from '../../features/transfer/nativeFileSystem';
import {
  applyImportedPackageContent,
  buildExportPackage,
  importPackage,
} from '../../features/transfer/operations';
import {
  DEFAULT_BOOK_CONTENT_OPTIONS,
  parseSnapshotPackage,
  totalRecords,
} from '../../features/transfer';
import type { BookContentOptions } from '../../features/transfer/types';
import type { LanPeer } from '../../features/backup/lanProtocol';
import { ROOT_ROUTES, useNavigation } from '../../navigation';
import {
  createBackupHistoryId,
  useBackupHistoryStore,
} from '../../stores/backupHistoryStore';
import { useBookStore } from '../../stores/bookStore';
import { LanDeviceCard } from './components/LanDeviceCard';
import { LanLocalCard } from './components/LanLocalCard';
import { LanRadar } from './components/LanRadar';
import { LanSendPanel } from './components/LanSendPanel';
import {
  LanOfferSheet,
  LanOfferWaitingSheet,
  LanPairRequestSheet,
  LanPairSheet,
} from './components/LanSheets';
import { LanTransferCard } from './components/LanTransferCard';

const SCAN_DOT_SIZE = 8;
const SCAN_REFRESH_SIZE = 16;
const SCAN_REFRESH_HIT_SLOP = 8;

interface ScreenStyleOptions {
  bottomInset: number;
}

const useStyles = createUseSheetStyle(
  (token, { bottomInset }: ScreenStyleOptions) => ({
    container: {
      flex: 1,
      backgroundColor: token.colorBgLayout,
    },
    radarStage: {
      flex: 1,
      overflow: 'hidden' as const,
      paddingBottom: bottomInset,
    },
    scanPill: {
      position: 'absolute' as const,
      top: token.paddingSM,
      left: token.padding,
      right: token.padding,
      zIndex: 4,
      minHeight: token.controlHeightSM,
      paddingHorizontal: token.paddingSM,
      paddingVertical: token.paddingXXS,
      borderRadius: token.borderRadiusLG,
      borderWidth: token.lineWidth,
      borderColor: token.colorSplit,
      backgroundColor: token.colorBgElevated,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: token.marginXS,
      ...toShadowStyle(token.boxShadowTertiary),
    },
    scanDot: {
      width: SCAN_DOT_SIZE,
      height: SCAN_DOT_SIZE,
      borderRadius: SCAN_DOT_SIZE / 2,
      backgroundColor: token.colorPrimary,
    },
    scanTitle: {
      flex: 1,
    },
    scanRefresh: {
      width: SCAN_REFRESH_SIZE,
      height: SCAN_REFRESH_SIZE,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    connectedScroll: {
      flex: 1,
    },
    connectedContent: {
      padding: token.padding,
      paddingBottom: token.paddingXL + bottomInset,
      gap: token.marginSM,
    },
    connectedBanner: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: token.marginXS,
      paddingHorizontal: token.paddingSM,
      paddingVertical: token.paddingXS,
      borderRadius: token.borderRadius,
      backgroundColor: token.colorSuccessBg,
    },
    connectedDot: {
      width: SCAN_DOT_SIZE,
      height: SCAN_DOT_SIZE,
      borderRadius: SCAN_DOT_SIZE / 2,
      backgroundColor: token.colorSuccess,
    },
    connectedText: {
      flex: 1,
      minWidth: 0,
      gap: token.marginXXS,
    },
    resultScroll: {
      flex: 1,
      backgroundColor: token.colorBgLayout,
    },
    resultContent: {
      padding: token.padding,
      paddingBottom: token.paddingXL + bottomInset,
      gap: token.marginSM,
    },
    resultActions: {
      gap: token.marginXS,
      width: '100%',
    },
    note: {
      gap: token.marginXXS,
    },
  }),
);

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

interface SentOfferSnapshot {
  fileName: string;
  sizeBytes: number;
  bookNames: string[];
  recordCount: number;
}

export function BackupLanScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { token } = useTheme();
  const navigation = useNavigation();
  const toast = useToast();
  const addHistory = useBackupHistoryStore(state => state.addEntry);
  const { data, loading: booksLoading } = useRequest(() =>
    localApi.book.getAll(),
  );
  const books = useMemo<BookRow[]>(() => data ?? [], [data]);

  const {
    view,
    openPair,
    closePair,
    setPairCode,
    submitPair,
    allowPair,
    denyPair,
    disconnect,
    sendOffer,
    cancelOffer,
    acceptOffer,
    declineOffer,
    downloadReceivePackage,
    completeReceive,
    closeResult,
    refreshCode,
    refreshNearby,
  } = useLanSession();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bookOptions, setBookOptions] = useState<
    Record<number, BookContentOptions>
  >({});
  const [includeSettings, setIncludeSettings] = useState(false);
  const [includeNetworkBooks, setIncludeNetworkBooks] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [importedResult, setImportedResult] =
    useState<ApplyLibrarySnapshotResult | null>(null);

  const cacheRef = useRef('');
  const sentOfferRef = useRef<SentOfferSnapshot | null>(null);
  const selectedSeededRef = useRef(false);
  const receivingRef = useRef(false);
  const recordedSendRef = useRef<object | null>(null);
  const lastErrorRef = useRef('');

  useEffect(() => {
    if (selectedSeededRef.current || books.length === 0) return;
    selectedSeededRef.current = true;
    setSelectedIds([books[0].id]);
  }, [books]);

  useEffect(() => {
    const result = view.result;
    if (!result || result.direction !== 'send' || result.status !== 'success') {
      return;
    }
    if (recordedSendRef.current === result) return;
    recordedSendRef.current = result;

    const sent = sentOfferRef.current;
    if (!sent) return;
    addHistory({
      id: createBackupHistoryId(),
      kind: 'lan-send',
      fileName: sent.fileName,
      sizeBytes: sent.sizeBytes,
      createdAt: Date.now(),
      bookNames: sent.bookNames,
      recordCount: sent.recordCount,
      uri: '',
      status: 'success',
      errorText: '',
    });
  }, [addHistory, view.result]);

  useEffect(() => {
    if (!view.errorText) {
      lastErrorRef.current = '';
      return;
    }
    if (lastErrorRef.current === view.errorText) return;
    lastErrorRef.current = view.errorText;
    toast.show({ messageText: view.errorText, status: 'error' });
  }, [toast, view.errorText]);

  useEffect(() => {
    return () => {
      if (cacheRef.current) {
        deleteFileUri(cacheRef.current).catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (
      view.phase !== 'receiving' ||
      !view.incomingOffer ||
      receivingRef.current
    ) {
      return undefined;
    }

    receivingRef.current = true;
    const offer = view.incomingOffer;
    let active = true;

    const receive = async (): Promise<void> => {
      try {
        const downloaded = await downloadReceivePackage();
        try {
          const parsed = await parseSnapshotPackage(downloaded.bytes);
          const imported = await importPackage(parsed);
          const applied = await applyImportedPackageContent(
            parsed,
            imported.result,
          );
          const records = imported.result.books.reduce(
            (sum, book) => sum + book.counts.records,
            0,
          );
          if (!active) return;
          setImportedResult(
            imported.result.books.length > 0 ? imported.result : null,
          );
          addHistory({
            id: createBackupHistoryId(),
            kind: 'lan-receive',
            fileName: offer.fileName,
            sizeBytes: offer.sizeBytes,
            createdAt: Date.now(),
            bookNames: parsed.manifest.books.map(book => book.name),
            recordCount: records,
            uri: '',
            status: 'success',
            errorText: '',
          });
          const parts: string[] = [];
          if (imported.result.books.length > 0) {
            parts.push(
              `${imported.result.books.length} 个账本 · ${records.toLocaleString(
                'zh-CN',
              )} 条流水`,
            );
          }
          if (applied.aiConfigsApplied > 0) {
            parts.push(`${applied.aiConfigsApplied} 份 AI 设置`);
          }
          if (applied.settingsApplied) parts.push('设置包');
          if (applied.networkBooks) parts.push('网络账本列表');
          await completeReceive(
            true,
            parts.length > 0 ? `已恢复 ${parts.join(' · ')}` : '内容已接收',
          );
        } finally {
          await downloaded.cleanup();
        }
      } catch (error: unknown) {
        if (active) {
          await completeReceive(false, getErrorMessage(error, '接收失败'));
        }
      } finally {
        receivingRef.current = false;
      }
    };

    receive();

    return () => {
      active = false;
    };
  }, [
    addHistory,
    completeReceive,
    downloadReceivePackage,
    view.incomingOffer,
    view.phase,
  ]);

  const handleSend = useCallback(async (): Promise<void> => {
    const hasContent =
      selectedIds.length > 0 || includeSettings || includeNetworkBooks;
    if (preparing || !hasContent) return;
    setPreparing(true);
    try {
      const pkg = await buildExportPackage({
        bookIds: selectedIds,
        bookOptions: Object.fromEntries(
          selectedIds.map(bookId => [
            bookId,
            bookOptions[bookId] ?? DEFAULT_BOOK_CONTENT_OPTIONS,
          ]),
        ),
        includeSettings,
        includeNetworkBooks,
      });
      const cacheUri = await writePackageToCache(
        pkg.fileName,
        fromByteArray(pkg.zip),
      );

      if (cacheRef.current && cacheRef.current !== cacheUri) {
        await deleteFileUri(cacheRef.current).catch(() => undefined);
      }
      cacheRef.current = cacheUri;
      sentOfferRef.current = {
        fileName: pkg.fileName,
        sizeBytes: pkg.sizeBytes,
        bookNames: pkg.manifest.books.map(book => book.name),
        recordCount: totalRecords(pkg.manifest),
      };

      await sendOffer({
        fileUri: cacheUri,
        fileName: pkg.fileName,
        sizeBytes: pkg.sizeBytes,
        totalRecords: totalRecords(pkg.manifest),
        books: pkg.manifest.books.map(book => ({
          name: book.name,
          records: book.counts.records,
          assets: book.counts.assets,
          images: book.counts.images,
        })),
        includeSettings: pkg.manifest.options.includeSettings,
        includeNetworkBooks: pkg.manifest.options.includeNetworkBooks,
      });
    } catch (error: unknown) {
      toast.show({
        messageText: getErrorMessage(error, '打包内容失败'),
        status: 'error',
      });
    } finally {
      setPreparing(false);
    }
  }, [
    bookOptions,
    includeNetworkBooks,
    includeSettings,
    preparing,
    selectedIds,
    sendOffer,
    toast,
  ]);

  const handlePair = useCallback((): void => {
    if (!view.pairTarget) return;
    submitPair(view.pairTarget, view.pairCode);
  }, [submitPair, view.pairCode, view.pairTarget]);

  const handlePairPress = useCallback(
    (peer: LanPeer): void => {
      if (view.connectedPeer) return;
      openPair(peer);
    },
    [openPair, view.connectedPeer],
  );

  const handleResultDone = useCallback((): void => {
    setImportedResult(null);
    closeResult();
  }, [closeResult]);

  const openImportedBook = useCallback(async (): Promise<void> => {
    if (!importedResult?.books[0]) {
      handleResultDone();
      navigation.navigate(ROOT_ROUTES.Home);
      return;
    }

    try {
      const book = await localApi.book.getById(importedResult.books[0].bookId);
      useBookStore
        .getState()
        .setCurrentBook(
          { kind: 'local', id: book.id },
          { kind: BOOK_TYPE.local, ...book },
        );
      setImportedResult(null);
      closeResult();
      navigation.navigate(ROOT_ROUTES.Home);
    } catch (error: unknown) {
      toast.show({
        messageText: getErrorMessage(error, '无法打开导入的账本'),
        status: 'error',
      });
    }
  }, [closeResult, handleResultDone, importedResult, navigation, toast]);

  if (view.result) {
    const result = view.result;
    const canOpenBook =
      result.direction === 'receive' &&
      result.status === 'success' &&
      Boolean(importedResult?.books[0]);

    return (
      <ScrollView
        contentContainerStyle={styles.resultContent}
        style={styles.resultScroll}
      >
        <Result
          status={result.status}
          titleText={result.title}
          subtitleText={result.subtitle}
          extra={
            <Column style={styles.resultActions}>
              {canOpenBook ? (
                <Button block onPress={openImportedBook} type="primary">
                  打开导入的账本
                </Button>
              ) : null}
              <Button
                block
                onPress={handleResultDone}
                type={canOpenBook ? 'dashed' : 'primary'}
              >
                完成
              </Button>
            </Column>
          }
        />
      </ScrollView>
    );
  }

  if (view.phase === 'error' && !view.session) {
    return (
      <ScrollView
        contentContainerStyle={styles.resultContent}
        style={styles.resultScroll}
      >
        <Result
          status="error"
          titleText="局域网传输不可用"
          subtitleText={view.errorText || '无法启动局域网服务'}
          extra={
            <Button block onPress={() => navigation.goBack()} type="primary">
              返回
            </Button>
          }
        />
      </ScrollView>
    );
  }

  const isSheetOpen = Boolean(
    view.pairTarget ||
    view.incomingPair ||
    (view.phase === 'connected' && view.incomingOffer) ||
    (view.phase === 'waiting-offer' && view.outgoingOffer),
  );
  const isTransferring = view.phase === 'receiving' || view.phase === 'sending';
  const peers = view.nearby.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.radarStage}>
        <LanRadar
          paused={isSheetOpen || isTransferring}
          peerCount={view.nearby.length}
        />

        {view.connectedPeer ? (
          <ScrollView
            contentContainerStyle={styles.connectedContent}
            style={styles.connectedScroll}
          >
            <View style={styles.connectedBanner}>
              <View style={styles.connectedDot} />
              <Column style={styles.connectedText}>
                <Text size="sm" weight="semibold">
                  已连接 {view.connectedPeer.name}
                </Text>
                <Text color="tertiary" size="xs">
                  校验码 {view.verificationCode}
                </Text>
              </Column>
              {!view.transfer ? (
                <Button onPress={disconnect} size="small" type="text">
                  断开
                </Button>
              ) : null}
            </View>

            {view.transfer ? (
              <LanTransferCard transfer={view.transfer} />
            ) : (
              <LanSendPanel
                bookOptions={bookOptions}
                books={books}
                busy={preparing || view.busy || view.phase === 'waiting-offer'}
                defaultBookOptions={DEFAULT_BOOK_CONTENT_OPTIONS}
                includeNetworkBooks={includeNetworkBooks}
                includeSettings={includeSettings}
                loading={booksLoading}
                onBookOptionsChange={(bookId, options) =>
                  setBookOptions(current => ({
                    ...current,
                    [bookId]: options,
                  }))
                }
                onIncludeNetworkBooksChange={setIncludeNetworkBooks}
                onIncludeSettingsChange={setIncludeSettings}
                onSelectedBookIdsChange={setSelectedIds}
                onSend={handleSend}
                selectedBookIds={selectedIds}
              />
            )}

            <Column style={styles.note}>
              <Text color="tertiary" size="xs">
                连接与传输都只在本机局域网内进行，不经过互联网。
              </Text>
              <Text color="tertiary" size="xs">
                传输完成前请保持两台设备在同一 Wi-Fi。
              </Text>
            </Column>
          </ScrollView>
        ) : (
          <>
            <View style={styles.scanPill}>
              <View style={styles.scanDot} />
              <Text style={styles.scanTitle} size="sm">
                {view.session ? '正在搜索附近设备' : '正在启动局域网服务'}
              </Text>
              <Text color="tertiary" size="xs">
                {peers.length} 台 · 同一 Wi-Fi
              </Text>
              <Pressable
                hitSlop={SCAN_REFRESH_HIT_SLOP}
                onPress={refreshNearby}
                style={styles.scanRefresh}
              >
                <ArrowClockwiseIcon
                  color={token.colorTextTertiary}
                  size={SCAN_REFRESH_SIZE}
                />
              </Pressable>
            </View>

            {peers.map((peer, index) => (
              <LanDeviceCard
                key={peer.id}
                onPress={handlePairPress}
                peer={peer}
                slot={index}
              />
            ))}

            <LanLocalCard
              code={view.localCode}
              onRefresh={refreshCode}
              session={view.session}
            />
          </>
        )}
      </View>

      <LanPairSheet
        code={view.pairCode}
        errorText={view.pairError}
        onChangeCode={setPairCode}
        onCancel={closePair}
        onConnect={handlePair}
        open={Boolean(view.pairTarget)}
        phase={view.phase === 'waiting-peer' ? 'waiting' : 'input'}
        target={view.pairTarget}
        verificationCode={view.verificationCode}
      />
      <LanPairRequestSheet
        busy={view.busy}
        onAllow={allowPair}
        onDeny={denyPair}
        open={Boolean(view.incomingPair)}
        pair={view.incomingPair}
      />
      <LanOfferSheet
        busy={view.busy}
        onAccept={acceptOffer}
        onDecline={declineOffer}
        offer={view.incomingOffer}
        open={view.phase === 'connected' && Boolean(view.incomingOffer)}
      />
      <LanOfferWaitingSheet
        onCancel={cancelOffer}
        open={view.phase === 'waiting-offer' && Boolean(view.outgoingOffer)}
        offer={view.outgoingOffer}
      />
    </View>
  );
}
