import React, { useCallback, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Button,
  Column,
  Empty,
  Icon,
  Popup,
  Row,
  SwipeAction,
  Text,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import {
  formatAmount,
  saveAddRecordDraft,
  validateAddRecordDraft,
} from '../addRecord/addRecordDraft';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { useSyncVersionStore } from '../../stores/syncVersionStore';
import { ROOT_ROUTES, useNavigation } from '../../navigation';
import { getPhosphorIconComponent } from '../../constants/typeIconTree';
import { useRecordSync } from '../home/recordSync';
import { buildDraftFromTemplate, tabTypeFor } from './buildDraft';
import { toPresetPayload, toTemplatePayload } from './payload';
import { useQuickTemplates } from './useQuickTemplates';
import type { QuickTemplate } from './types';

interface QuickTemplatePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 快捷模板面板：单击直接记账、长按预填后新建、右滑编辑/删除、头部「+」新增模板。
 * 受控于 HomeScreen（open/onOpenChange）；悬浮按钮已合并进 HomeScreen 的 FloatingActionGroup。
 * 记账成功后通过 useRecordSync().bump 通知明细列表刷新。
 * 模板编辑/新增复用 AddRecord 界面（template 模式）。
 */
export function QuickTemplatePanel({
  open,
  onOpenChange,
}: QuickTemplatePanelProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const { bump } = useRecordSync();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const bumpTemplateVersion = useSyncVersionStore(
    state => state.bumpTemplateVersion,
  );
  const { templates } = useQuickTemplates();
  const [busyId, setBusyId] = useState<number | null>(null);

  const bookId = currentBook?.id;
  const { data: types = [] } = useRequest(
    () => (bookId ? globalApi.type.getAll(bookId) : Promise.resolve([])),
    { refreshDeps: [bookId] },
  );
  const typeMap = useMemo(
    () => new Map(types.map(type => [type.id, type])),
    [types],
  );

  const closePanel = useCallback(() => onOpenChange(false), [onOpenChange]);

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
        closePanel();
        bump();
      } catch (error: unknown) {
        toast.show({
          messageText: error instanceof Error ? error.message : '记账失败',
        });
      } finally {
        setBusyId(null);
      }
    },
    [bump, closePanel, currentBook, toast, typeMap],
  );

  const handleEditFromPreset = useCallback(
    (tpl: QuickTemplate) => {
      closePanel();
      navigation.navigate(ROOT_ROUTES.AddRecord, { preset: toPresetPayload(tpl) });
    },
    [closePanel, navigation],
  );

  const handleEditTemplate = useCallback(
    (tpl: QuickTemplate) => {
      closePanel();
      navigation.navigate(ROOT_ROUTES.AddRecord, {
        template: true,
        templatePayload: toTemplatePayload(tpl),
      });
    },
    [closePanel, navigation],
  );

  const handleNewTemplate = useCallback(() => {
    closePanel();
    navigation.navigate(ROOT_ROUTES.AddRecord, { template: true });
  }, [closePanel, navigation]);

  const handleDeleteTemplate = useCallback(
    async (id: number): Promise<void> => {
      if (!currentBook) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }
      try {
        await globalApi.quickTemplate.delete(id, currentBook.id);
        bumpTemplateVersion();
        toast.show({ messageText: '已删除模板' });
      } catch (error) {
        toast.show({
          messageText: error instanceof Error ? error.message : '删除模板失败',
          status: 'error',
        });
      }
    },
    [bumpTemplateVersion, currentBook, globalApi, toast],
  );

  const hasTemplates = templates.length > 0;

  return (
    <Popup.FloatingPanel
      bodyScrollable
      scrollEnabled
      closeOnMaskClick
      footer={null}
      height="50%"
      keyboardAvoiding
      onOpenChange={onOpenChange}
      open={open}
      position="bottom"
      renderHeader={() => (
        <Row align="center" justify="between" style={styles.header}>
          <Text size="md" weight="semibold">
            快捷记账
          </Text>
          <Button
            icon="plus"
            onPress={handleNewTemplate}
            shape="circle"
            size="small"
            type="text"
          />
        </Row>
      )}
      styles={{ panelBody: styles.panelBody }}
    >
      {hasTemplates ? (
        templates.map(tpl => {
          const typeRow = typeMap.get(tpl.typeId);
          const iconComp = typeRow
            ? getPhosphorIconComponent(typeRow.icon)
            : undefined;
          return (
            <SwipeAction
              key={tpl.id}
              rightActions={[
                {
                  key: 'edit',
                  actionText: '编辑',
                  color: 'primary',
                  onPress: () => handleEditTemplate(tpl),
                },
                {
                  key: 'delete',
                  actionText: '删除',
                  color: 'danger',
                  onPress: () => handleDeleteTemplate(tpl.id),
                },
              ]}
            >
              <Pressable
                disabled={busyId === tpl.id}
                onLongPress={() => handleEditFromPreset(tpl)}
                onPress={() => handleDirectCreate(tpl)}
                style={({ pressed }) => [
                  styles.item,
                  pressed ? styles.itemPressed : null,
                ]}
              >
                <Row align="center" gap="normal">
                  <Column
                    align="center"
                    justify="center"
                    style={styles.itemIcon}
                  >
                    <Icon
                      color="primary"
                      icon={iconComp ?? 'plus'}
                      size="normal"
                    />
                  </Column>
                  <Column gap={token.marginXXS} style={styles.itemMain}>
                    <Text numberOfLines={1} weight="semibold">
                      {tpl.name}
                    </Text>
                    <Text color="secondary" numberOfLines={1} size="sm">
                      {`${typeRow?.name ?? '分类已失效'} · ¥${formatAmount(tpl.amount)}`}
                    </Text>
                  </Column>
                </Row>
              </Pressable>
            </SwipeAction>
          );
        })
      ) : (
        <Empty
          descriptionText="暂无快捷模板，点右上角加号添加"
          style={styles.state}
        />
      )}
    </Popup.FloatingPanel>
  );
}

const useStyles = createUseSheetStyle(token => ({
  header: {
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  panelBody: {
    paddingVertical: token.paddingSM,
    gap: token.marginXXS,
  },
  state: {
    paddingVertical: token.paddingLG,
  },
  item: {
    backgroundColor: token.colorBgContainer,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  itemPressed: {
    backgroundColor: token.controlItemBgHover,
  },
  itemIcon: {
    backgroundColor: token.colorPrimaryBg,
    borderRadius: token.borderRadiusLG,
    height: token.controlHeight,
    width: token.controlHeight,
  },
  itemMain: {
    flex: 1,
  },
}));
