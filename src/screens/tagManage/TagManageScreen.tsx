import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Button,
  Column,
  Form,
  Input,
  Row,
  Switch,
  Text,
  useToast,
} from '@pennyspring/ui';
import { VISIBILITY, type TagRow } from '@pennyspring/api';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

import { FormIconGrid, TAG_FORM_ICONS } from '../../component/FormIconGrid';
import { PhosphorIconPicker } from '../../component/PhosphorIconPicker';
import { TagChip } from '../../component/TagChip';
import { createHeaderAddButton } from '../../components/HeaderAddButton';
import { LoadErrorEmpty } from '../../components/LoadErrorEmpty';
import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { FormFloatingPanel } from '../../components/FormFloatingPanel';
import { ManageSkeleton } from '../../components/ManageSkeleton';
import { useNavigation } from '../../navigation';
import {
  useBookKey,
  useCurrentBookId,
  useGlobalApi,
} from '../../stores/bookStore';

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
    paddingHorizontal: token.paddingXXS,
  },
  sectionHeader: {
    paddingHorizontal: token.paddingXXS,
  },
  listEnd: {
    lineHeight: token.lineHeight,
  },
  preview: {
    paddingVertical: token.paddingXS,
  },
  switchText: {
    flex: 1,
  },
}));

function getTagDeleteErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('Tag is in use')) {
    return '该标签已被记录使用，先解除关联后再删除。';
  }
  return message || '删除失败';
}

interface TagFormValues {
  name: string;
  icon: string;
  hidden: boolean;
}

const TypedForm = Form.infer<TagFormValues>();

const EMPTY_TAG_FORM: TagFormValues = {
  name: '',
  icon: '',
  hidden: false,
};

function buildTagIconValues(icon: string | undefined): readonly string[] {
  if (icon && !(TAG_FORM_ICONS as readonly string[]).includes(icon)) {
    return [icon, ...TAG_FORM_ICONS];
  }
  return TAG_FORM_ICONS;
}

export function TagManageScreen() {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const bookKey = useBookKey();
  const bookId = useCurrentBookId();
  const globalApi = useGlobalApi();

  const {
    data,
    error: loadError,
    loading,
    refresh,
  } = useRequest(
    () => {
      if (bookId === null) return Promise.resolve<TagRow[]>([]);
      return globalApi.tag.getAll(bookId);
    },
    { refreshDeps: [bookKey] },
  );
  const tags = data ?? [];

  const visibleTags = useMemo(
    () => tags.filter(tag => tag.invisible !== VISIBILITY.hidden),
    [tags],
  );
  const hiddenTags = useMemo(
    () => tags.filter(tag => tag.invisible === VISIBILITY.hidden),
    [tags],
  );

  const [form] = TypedForm.useForm();
  const submitSucceededRef = useRef(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [menuTag, setMenuTag] = useState<TagRow | null>(null);
  const [pendingDeleteTag, setPendingDeleteTag] = useState<TagRow | null>(null);

  const openCreate = useCallback(() => {
    setEditingTag(null);
    form.reset(EMPTY_TAG_FORM);
    setFormOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (tag: TagRow) => {
      setEditingTag(tag);
      form.reset({
        name: tag.name,
        icon: tag.icon,
        hidden: tag.invisible === VISIBILITY.hidden,
      });
      setFormOpen(true);
    },
    [form],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: createHeaderAddButton(openCreate),
    });
  }, [navigation, openCreate]);

  const handleFinish = useCallback(
    async (values: TagFormValues) => {
      submitSucceededRef.current = false;
      if (bookId === null) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }
      setSubmitting(true);
      try {
        const invisible = values.hidden
          ? VISIBILITY.hidden
          : VISIBILITY.visible;
        if (editingTag) {
          await globalApi.tag.update({
            booksId: bookId,
            icon: values.icon,
            id: editingTag.id,
            invisible,
            name: values.name.trim(),
          });
        } else {
          await globalApi.tag.create({
            booksId: bookId,
            icon: values.icon,
            invisible,
            name: values.name.trim(),
          });
        }
        refresh();
        submitSucceededRef.current = true;
      } catch (error: unknown) {
        toast.show({
          messageText:
            error instanceof Error && error.message
              ? error.message
              : '保存失败',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [bookId, editingTag, globalApi.tag, refresh, toast],
  );

  const handlePanelOk = useCallback(async () => {
    submitSucceededRef.current = false;
    await form.handleSubmit();
    return submitSucceededRef.current;
  }, [form]);

  const toggleVisibility = useCallback(
    async (tag: TagRow) => {
      if (bookId === null) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }
      try {
        const invisible =
          tag.invisible === VISIBILITY.hidden
            ? VISIBILITY.visible
            : VISIBILITY.hidden;
        await globalApi.tag.update({
          booksId: bookId,
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
    [bookId, globalApi.tag, refresh, toast],
  );

  const handleDelete = useCallback(async () => {
    const target = pendingDeleteTag;
    if (!target || bookId === null) {
      return;
    }
    try {
      await globalApi.tag.delete(target.id, bookId);
    } catch (error: unknown) {
      throw new Error(getTagDeleteErrorMessage(error));
    }
    if (editingTag?.id === target.id) {
      setFormOpen(false);
    }
    setPendingDeleteTag(null);
    refresh();
  }, [bookId, editingTag?.id, globalApi.tag, pendingDeleteTag, refresh]);

  const menuActions = useMemo(() => {
    const tag = menuTag;
    return [
      { text: '编辑标签', icon: 'edit' as const },
      {
        text: tag?.invisible === VISIBILITY.hidden ? '显示标签' : '隐藏标签',
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

  const submitText = editingTag ? '保存' : '新增';

  if (loading && tags.length === 0) {
    return (
      <Column style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} scrollEnabled>
          <ManageSkeleton rows={3} />
        </ScrollView>
      </Column>
    );
  }

  if (loadError && tags.length === 0) {
    return (
      <Column style={styles.container}>
        <LoadErrorEmpty
          descriptionText="标签数据加载失败，请检查网络或稍后重试。"
          onRetry={refresh}
          titleText="标签加载失败"
        />
      </Column>
    );
  }

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} scrollEnabled>
        <Row style={styles.metaLine} gap={token.marginXXS} align="center">
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

        <Column gap="small">
          <Row style={styles.sectionHeader} gap="small" align="baseline">
            <Text size="xs" weight="semibold" color="secondary">
              标签
            </Text>
            <Text size="xs" color="tertiary">
              {visibleTags.length}
            </Text>
          </Row>
          <Row gap="normal" wrap>
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
          <Column gap="small">
            <Row style={styles.sectionHeader} gap="small" align="baseline">
              <Text size="xs" weight="semibold" color="secondary">
                已隐藏
              </Text>
              <Text size="xs" color="tertiary">
                {hiddenTags.length}
              </Text>
            </Row>
            <Row gap="normal" wrap>
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

        <Text
          size="xs"
          style={styles.listEnd}
          color="tertiary"
          textAlign="center"
        >
          轻点标签可编辑、隐藏或删除{'\n'}
          删除只解除关联，不影响记录金额
        </Text>
      </ScrollView>

      <FormFloatingPanel
        scrollEnabled
        onOk={handlePanelOk}
        onOpenChange={open => {
          if (!open) {
            setFormOpen(false);
          }
        }}
        open={formOpen}
        submitLoading={submitting}
        submitText={submitText}
        titleText={editingTag ? '编辑标签' : '新增标签'}
      >
        <TypedForm form={form} labelMode="child" onFinish={handleFinish}>
          <TypedForm.Subscribe selector={state => state.values}>
            {values => (
              <Column style={styles.preview} align="center">
                <TagChip
                  iconName={values.icon}
                  label={values.name.trim() || '标签名称'}
                  placeholder={!values.name.trim()}
                  variant={values.hidden ? 'hidden' : 'default'}
                />
              </Column>
            )}
          </TypedForm.Subscribe>
          <TypedForm.Item
            name="name"
            labelText="标签名称"
            required
            requiredMessage="请输入标签名称"
          >
            <Input allowClear placeholder="例如：报销" />
          </TypedForm.Item>
          <TypedForm.Item name="icon" noStyle>
            <Column>
              <Text color="tertiary" size="xs">
                图标（可选）
              </Text>
              <TypedForm.Subscribe selector={state => state.values.icon}>
                {icon => (
                  <>
                    <FormIconGrid values={buildTagIconValues(icon)} />
                    <Row gap="small" align="center">
                      <Button
                        onPress={() => setIconPickerOpen(true)}
                        size="small"
                        type="link"
                      >
                        更多图标
                      </Button>
                      <Button
                        disabled={!icon}
                        onPress={() => form.setFieldValue('icon', '')}
                        size="small"
                        type="link"
                      >
                        清除图标
                      </Button>
                    </Row>
                  </>
                )}
              </TypedForm.Subscribe>
            </Column>
          </TypedForm.Item>
          <TypedForm.Item name="hidden" noStyle>
            <Row align="center">
              <Column style={styles.switchText}>
                <Text size="md">隐藏该标签</Text>
                <Text size="xs" color="tertiary">
                  隐藏后不出现在新增记录与统计里，历史记录保留
                </Text>
              </Column>
              <Switch />
            </Row>
          </TypedForm.Item>
        </TypedForm>
      </FormFloatingPanel>

      <form.Subscribe selector={state => state.values.icon}>
        {icon => (
          <PhosphorIconPicker
            onChange={value => form.setFieldValue('icon', value)}
            onOpenChange={setIconPickerOpen}
            open={iconPickerOpen}
            value={icon}
          />
        )}
      </form.Subscribe>

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
          pendingDeleteTag ? `删除「${pendingDeleteTag.name}」？` : '删除标签'
        }
      />
    </Column>
  );
}
