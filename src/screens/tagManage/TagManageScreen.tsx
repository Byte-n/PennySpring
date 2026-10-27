import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Button,
  Column,
  Input,
  Row,
  Switch,
  Text,
  useToast,
} from '@pennyspring/ui';
import { VISIBILITY, type TagRow } from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/theme';

import { FormIconGrid, TAG_FORM_ICONS } from '../../component/FormIconGrid';
import { PhosphorIconPicker } from '../../component/PhosphorIconPicker';
import { TagChip } from '../../component/TagChip';
import { createHeaderAddButton } from '../../components/HeaderAddButton';
import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { FormFloatingPanel } from '../../components/FormFloatingPanel';
import { ManageSkeleton } from '../../components/ManageSkeleton';
import { useNavigation } from '../../navigation';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    gap: token.marginSM,
    padding: token.padding,
    paddingBottom: token.paddingXL,
  },
  metaLine: {
    alignItems: 'center',
    gap: token.marginXXS,
    paddingHorizontal: token.paddingXXS,
  },
  section: {
    gap: token.marginXS,
  },
  sectionHeader: {
    alignItems: 'baseline',
    gap: token.marginXS,
    paddingHorizontal: token.paddingXXS,
  },
  sectionTitle: {
    color: token.colorTextSecondary,
  },
  sectionCount: {
    color: token.colorTextTertiary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginSM,
  },
  listEnd: {
    color: token.colorTextTertiary,
    lineHeight: token.lineHeight,
    textAlign: 'center',
  },
  formBody: {
    gap: token.marginMD,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: token.paddingXS,
  },
  switchRow: {
    alignItems: 'center',
  },
  switchText: {
    flex: 1,
  },
  switchNote: {
    color: token.colorTextTertiary,
  },
  iconActions: {
    alignItems: 'center',
    gap: token.marginXS,
  },
}));

function getTagDeleteErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('Tag is in use')) {
    return '该标签已被记录使用，先解除关联后再删除。';
  }
  return message || '删除失败';
}

export function TagManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();

  const { data, loading, refresh } = useRequest(() => {
    if (!currentBook) return Promise.resolve<TagRow[]>([]);
    return globalApi.tag.getAll(currentBook.id);
  });
  const tags = data ?? [];

  const visibleTags = useMemo(
    () => tags.filter(tag => tag.invisible !== VISIBILITY.hidden),
    [tags],
  );
  const hiddenTags = useMemo(
    () => tags.filter(tag => tag.invisible === VISIBILITY.hidden),
    [tags],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [hidden, setHidden] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [menuTag, setMenuTag] = useState<TagRow | null>(null);
  const [pendingDeleteTag, setPendingDeleteTag] = useState<TagRow | null>(null);

  const formIconValues = useMemo(() => {
    if (
      icon &&
      !(TAG_FORM_ICONS as readonly string[]).includes(icon)
    ) {
      return [icon, ...TAG_FORM_ICONS];
    }
    return TAG_FORM_ICONS;
  }, [icon]);

  const openCreate = useCallback(() => {
    setEditingTag(null);
    setName('');
    setIcon('');
    setHidden(false);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((tag: TagRow) => {
    setEditingTag(tag);
    setName(tag.name);
    setIcon(tag.icon);
    setHidden(tag.invisible === VISIBILITY.hidden);
    setFormOpen(true);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: createHeaderAddButton(openCreate),
    });
  }, [navigation, openCreate]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!name.trim()) {
      toast.show({ messageText: '请输入标签名称' });
      return false;
    }
    if (!currentBook) {
      toast.show({ messageText: '未找到当前账本' });
      return false;
    }
    setSubmitting(true);
    try {
      const invisible = hidden ? VISIBILITY.hidden : VISIBILITY.visible;
      if (editingTag) {
        await globalApi.tag.update({
          booksId: currentBook.id,
          icon,
          id: editingTag.id,
          invisible,
          name: name.trim(),
        });
      } else {
        await globalApi.tag.create({
          booksId: currentBook.id,
          icon,
          invisible,
          name: name.trim(),
        });
      }
      refresh();
      return true;
    } catch (error: unknown) {
      toast.show({
        messageText:
          error instanceof Error && error.message
            ? error.message
            : '保存失败',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [currentBook, editingTag, globalApi.tag, hidden, icon, name, refresh, toast]);

  const toggleVisibility = useCallback(
    async (tag: TagRow) => {
      if (!currentBook) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }
      try {
        const invisible =
          tag.invisible === VISIBILITY.hidden
            ? VISIBILITY.visible
            : VISIBILITY.hidden;
        await globalApi.tag.update({
          booksId: currentBook.id,
          icon: tag.icon,
          id: tag.id,
          invisible,
          name: tag.name,
        });
        refresh();
        toast.show({
          messageText:
            invisible === VISIBILITY.hidden
              ? `「${tag.name}」已隐藏`
              : `「${tag.name}」已恢复显示`,
        });
      } catch (error: unknown) {
        toast.show({
          messageText:
            error instanceof Error && error.message
              ? error.message
              : '操作失败',
        });
      }
    },
    [currentBook, globalApi.tag, refresh, toast],
  );

  const handleDelete = useCallback(async () => {
    const target = pendingDeleteTag;
    if (!target || !currentBook) {
      return;
    }
    try {
      await globalApi.tag.delete(target.id, currentBook.id);
    } catch (error: unknown) {
      throw new Error(getTagDeleteErrorMessage(error));
    }
    if (editingTag?.id === target.id) {
      setFormOpen(false);
    }
    setPendingDeleteTag(null);
    refresh();
  }, [currentBook, editingTag?.id, globalApi.tag, pendingDeleteTag, refresh]);

  const menuActions = useMemo(() => {
    const tag = menuTag;
    return [
      { text: '编辑标签', icon: 'edit' as const },
      {
        text:
          tag?.invisible === VISIBILITY.hidden ? '显示标签' : '隐藏标签',
        icon:
          tag?.invisible === VISIBILITY.hidden
            ? ('eye' as const)
            : ('eye-slash' as const),
      },
      { text: '删除标签', icon: 'trash' as const, danger: true },
    ];
  }, [menuTag]);

  const handleMenuAction = useCallback(
    (_action: { text: string }, index: number) => {
      const tag = menuTag;
      setMenuTag(null);
      if (!tag) {
        return;
      }
      if (index === 0) {
        openEdit(tag);
      } else if (index === 1) {
        toggleVisibility(tag);
      } else {
        setPendingDeleteTag(tag);
      }
    },
    [menuTag, openEdit, toggleVisibility],
  );

  const okDisabled = submitting || !name.trim();
  const previewLabel = name.trim() || '标签名称';
  const submitText = editingTag ? '保存' : '新增';

  if (loading && tags.length === 0) {
    return (
      <Column style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ManageSkeleton rows={3} />
        </ScrollView>
      </Column>
    );
  }

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Row style={styles.metaLine}>
          <Text color="secondary" size="xs" weight="semibold">
            {tags.length}
          </Text>
          <Text color="tertiary" size="xs">
            个标签 ·
          </Text>
          <Text color="secondary" size="xs" weight="semibold">
            {hiddenTags.length}
          </Text>
          <Text color="tertiary" size="xs">
            个已隐藏
          </Text>
        </Row>

        <Column style={styles.section}>
          <Row style={styles.sectionHeader}>
            <Text size="xs" style={styles.sectionTitle} weight="semibold">
              标签
            </Text>
            <Text size="xs" style={styles.sectionCount}>
              {visibleTags.length}
            </Text>
          </Row>
          <Row style={styles.chips}>
            <TagChip label="新建标签" onPress={openCreate} variant="add" />
            {visibleTags.map(tag => (
              <TagChip
                iconName={tag.icon}
                key={tag.id}
                label={tag.name}
                onLongPress={() => setMenuTag(tag)}
                onPress={() => setMenuTag(tag)}
              />
            ))}
          </Row>
        </Column>

        {hiddenTags.length > 0 ? (
          <Column style={styles.section}>
            <Row style={styles.sectionHeader}>
              <Text size="xs" style={styles.sectionTitle} weight="semibold">
                已隐藏
              </Text>
              <Text size="xs" style={styles.sectionCount}>
                {hiddenTags.length}
              </Text>
            </Row>
            <Row style={styles.chips}>
              {hiddenTags.map(tag => (
                <TagChip
                  iconName={tag.icon}
                  key={tag.id}
                  label={tag.name}
                  onLongPress={() => setMenuTag(tag)}
                  onPress={() => setMenuTag(tag)}
                  variant="hidden"
                />
              ))}
            </Row>
          </Column>
        ) : null}

        <Text size="xs" style={styles.listEnd}>
          轻点标签可编辑、隐藏或删除{'\n'}
          删除只解除关联，不影响记录金额
        </Text>
      </ScrollView>

      <FormFloatingPanel
        onOk={handleSave}
        onOpenChange={open => {
          if (!open) {
            setFormOpen(false);
          }
        }}
        open={formOpen}
        panelBodyStyle={styles.formBody}
        submitDisabled={okDisabled}
        submitLoading={submitting}
        submitText={submitText}
        titleText={editingTag ? '编辑标签' : '新增标签'}
      >
        <Column style={styles.preview}>
          <TagChip
            iconName={icon}
            label={previewLabel}
            placeholder={!name.trim()}
            variant={hidden ? 'hidden' : 'default'}
          />
        </Column>
        <Input
          labelText="标签名称"
          onChange={setName}
          placeholder="例如：报销"
          value={name}
        />
        <Column>
          <Text color="tertiary" size="xs">
            图标（可选）
          </Text>
          <FormIconGrid
            onChange={setIcon}
            value={icon}
            values={formIconValues}
          />
          <Row style={styles.iconActions}>
            <Button
              onPress={() => setIconPickerOpen(true)}
              size="small"
              type="link"
            >
              更多图标
            </Button>
            <Button
              disabled={!icon}
              onPress={() => setIcon('')}
              size="small"
              type="link"
            >
              清除图标
            </Button>
          </Row>
        </Column>
        <Row style={styles.switchRow}>
          <Column style={styles.switchText}>
            <Text size="md">隐藏该标签</Text>
            <Text size="xs" style={styles.switchNote}>
              隐藏后不出现在新增记录与统计里，历史记录保留
            </Text>
          </Column>
          <Switch onChange={setHidden} value={hidden} />
        </Row>
      </FormFloatingPanel>

      <PhosphorIconPicker
        onChange={setIcon}
        onOpenChange={setIconPickerOpen}
        open={iconPickerOpen}
        value={icon}
      />

      <ActionSheet
        actions={menuActions}
        cancelText="取消"
        onAction={handleMenuAction}
        onOpenChange={open => {
          if (!open) {
            setMenuTag(null);
          }
        }}
        open={menuTag !== null}
        titleText={menuTag?.name}
      />

      <ManageConfirmDialog
        messageText="删除只解除记录上的关联，不影响记录金额；历史记录会保留。"
        onCancel={() => setPendingDeleteTag(null)}
        onConfirm={handleDelete}
        open={pendingDeleteTag !== null}
        titleText={
          pendingDeleteTag
            ? `删除「${pendingDeleteTag.name}」？`
            : '删除标签'
        }
      />
    </Column>
  );
}
