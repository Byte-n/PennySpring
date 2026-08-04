import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import { Column, Icon, Text, useToast } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { AddRecordPresetPayload } from '../addRecord/AddRecordContext';
import {
  formatAmount,
  saveAddRecordDraft,
  validateAddRecordDraft,
} from '../addRecord/addRecordDraft';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { ROOT_ROUTES, useNavigation } from '../../navigation';
import { getPhosphorIconComponent } from '../../constants/typeIconTree';
import { buildDraftFromTemplate, tabTypeFor } from './buildDraft';
import { useQuickTemplates } from './quickTemplateStore';
import type { QuickTemplate } from './types';

interface QuickEntryBarProps {
  /** 直接新建成功后回调（用于刷新记录列表） */
  onCreated: () => void;
}

function toPresetPayload(tpl: QuickTemplate): AddRecordPresetPayload {
  return {
    typeId: tpl.typeId,
    amount: tpl.amount,
    remark: tpl.remark,
    assetId: tpl.assetId > 0 ? tpl.assetId : null,
    intoAssetId: tpl.intoAssetId > 0 ? tpl.intoAssetId : null,
    charge: tpl.charge,
    tagIds: tpl.tagIds,
  };
}

export function QuickEntryBar({ onCreated }: QuickEntryBarProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const templates = useQuickTemplates();
  const [busyId, setBusyId] = useState<string | null>(null);

  const bookId = currentBook?.id;
  const { data: types = [] } = useRequest(
    () => (bookId ? globalApi.type.getAll(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId] },
  );
  const typeMap = useMemo(
    () => new Map(types.map(type => [type.id, type])),
    [types],
  );

  const handleDirectCreate = useCallback(
    async (tpl: QuickTemplate) => {
      if (!currentBook) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }
      const typeRow = typeMap.get(tpl.typeId);
      if (!typeRow) {
        toast.show({ messageText: '模板分类已失效，请重新编辑模板' });
        return;
      }
      const tabType = tabTypeFor(typeRow);
      const draft = buildDraftFromTemplate(tpl, currentBook.id, typeRow);
      const validationMessage = validateAddRecordDraft(tabType, draft);
      if (validationMessage !== undefined) {
        toast.show({ messageText: validationMessage });
        return;
      }
      try {
        setBusyId(tpl.id);
        await saveAddRecordDraft(tabType, draft, undefined);
        toast.show({
          messageText: `已记账 ¥${formatAmount(tpl.amount)} · ${tpl.name}`.trim(),
        });
        onCreated();
      } catch (error: unknown) {
        toast.show({
          messageText: error instanceof Error ? error.message : '记账失败',
        });
      } finally {
        setBusyId(null);
      }
    },
    [currentBook, typeMap, toast, onCreated],
  );

  const handleEditFromPreset = useCallback(
    (tpl: QuickTemplate) => {
      navigation.navigate(ROOT_ROUTES.AddRecord, { preset: toPresetPayload(tpl) });
    },
    [navigation],
  );

  const openManage = useCallback(() => {
    navigation.navigate(ROOT_ROUTES.QuickTemplateManage);
  }, [navigation]);

  const hasTemplates = templates.length > 0;

  return (
    <Column style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}
      >
        {hasTemplates
          ? templates.map(tpl => {
              const typeRow = typeMap.get(tpl.typeId);
              const iconComp = typeRow
                ? getPhosphorIconComponent(typeRow.icon)
                : undefined;
              return (
                <Pressable
                  key={tpl.id}
                  disabled={busyId === tpl.id}
                  onPress={() => handleDirectCreate(tpl)}
                  onLongPress={() => handleEditFromPreset(tpl)}
                  style={styles.tile}
                >
                  <Column align="center" gap={token.marginXXS}>
                    <Icon
                      color="primary"
                      icon={iconComp ?? 'plus'}
                      size="normal"
                    />
                    <Text numberOfLines={1} size="sm" weight="semibold">
                      {tpl.name}
                    </Text>
                    <Text color="secondary" size="sm">
                      ¥{formatAmount(tpl.amount)}
                    </Text>
                  </Column>
                </Pressable>
              );
            })
          : (
            <Pressable onPress={openManage} style={styles.tile}>
              <Column align="center" gap={token.marginXXS}>
                <Icon color="primary" icon="plus" size="normal" />
                <Text size="sm">添加快捷模板</Text>
              </Column>
            </Pressable>
          )}
        <Pressable onPress={openManage} style={styles.tile}>
          <Column align="center" gap={token.marginXXS}>
            <Icon color="secondary" icon="settings" size="normal" />
            <Text color="secondary" size="sm">
              管理
            </Text>
          </Column>
        </Pressable>
      </ScrollView>
      <Text color="tertiary" size="sm" style={styles.hint}>
        单击记账 · 长按编辑后记账
      </Text>
    </Column>
  );
}

const useStyles = createUseSheetStyle(token => ({
  container: {
    gap: token.marginXXS,
  },
  track: {
    gap: token.marginSM,
    paddingVertical: token.paddingXS,
  },
  tile: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    justifyContent: 'center',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingSM,
  },
  hint: {
    paddingHorizontal: token.paddingXS,
  },
}));
