import React, { useState } from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  Button,
  Column,
  DisplayInput,
  Divider,
  Icon,
  Input,
  Popover,
  Row,
  Text,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

import {
  CONTEXT_WINDOW_OPTIONS,
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_REASONING_EFFORT,
  REASONING_EFFORT_OPTIONS,
  formatContextWindow,
  formatReasoningEffort,
} from '../providers/models';
import type {
  AgentModelConfig,
  AgentReasoningEffort,
} from '../providers/types';
import { InfoHint } from './InfoHint';

/** 表头与值列共用固定宽度，跨行对齐；窄屏剩余宽度全部留给模型名。 */
const CONTEXT_COLUMN_WIDTH = 72;
const EFFORT_COLUMN_WIDTH = 68;
const IMAGE_COLUMN_WIDTH = 32;
const IMAGE_TOGGLE_HIT_SLOP = 8;

export interface ModelRowState {
  modelId: string;
  contextWindow: number;
  reasoningEffort: AgentReasoningEffort;
  multimodal: boolean;
}

export interface ProviderModelSectionProps {
  rows: readonly ModelRowState[];
  defaultModelId: string;
  modelPlaceholder: string;
  manualModel: string;
  availableModels: readonly string[];
  onAddModel: (modelId: string) => void;
  onRemoveModel: (modelId: string) => void;
  onSetDefaultModel: (modelId: string) => void;
  onUpdateRow: (modelId: string, patch: Partial<ModelRowState>) => void;
  onChangeManualModel: (value: string) => void;
  onSubmitManualModel: () => void;
}

type ModelMenuField = 'context' | 'effort' | 'actions';

interface OpenMenuState {
  modelId: string;
  field: ModelMenuField;
}

const useStyles = createUseSheetStyle(token => ({
  headName: {
    flex: 1,
  },
  nameCell: {
    flex: 1,
    minWidth: 0,
  },
  modelName: {
    flexShrink: 1,
  },
  contextCell: {
    width: CONTEXT_COLUMN_WIDTH,
  },
  effortCell: {
    width: EFFORT_COLUMN_WIDTH,
  },
  imageCell: {
    width: IMAGE_COLUMN_WIDTH,
  },
  imageToggle: {
    alignItems: 'center',
    borderRadius: token.borderRadiusSM,
    height: token.controlHeightSM,
    justifyContent: 'center',
    width: IMAGE_COLUMN_WIDTH,
  },
  imageTogglePressed: {
    backgroundColor: token.colorFillContent,
  },
  actionsCell: {
    width: token.controlHeightSM,
  },
  modelRow: {
    minHeight: token.controlHeight,
    paddingVertical: token.paddingXXS,
  },
  contextField: {
    width: CONTEXT_COLUMN_WIDTH,
  },
  effortField: {
    width: EFFORT_COLUMN_WIDTH,
  },
  menu: {
    minWidth: 80,
  },
  menuOption: {
    alignItems: 'center',
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    gap: token.marginXS,
    minHeight: token.controlHeight,
    paddingHorizontal: token.paddingXS,
  },
  menuOptionSelected: {
    backgroundColor: token.colorPrimaryBg,
  },
  menuOptionPressed: {
    backgroundColor: token.colorFillContent,
  },
  menuOptionLabel: {
    flex: 1,
  },
  addField: {
    flex: 1,
  },
}));

export function createModelRow(modelId: string): ModelRowState {
  return {
    modelId,
    contextWindow: DEFAULT_CONTEXT_WINDOW,
    reasoningEffort: DEFAULT_REASONING_EFFORT,
    multimodal: false,
  };
}

export function toModelRow(model: AgentModelConfig): ModelRowState {
  return {
    modelId: model.modelId,
    contextWindow: model.contextWindow,
    reasoningEffort: model.reasoningEffort,
    multimodal: model.multimodal === true,
  };
}

export function toModelConfigs(
  rows: readonly ModelRowState[],
): AgentModelConfig[] {
  return rows.map(row => ({
    modelId: row.modelId,
    contextWindow: row.contextWindow,
    reasoningEffort: row.reasoningEffort,
    multimodal: row.multimodal,
  }));
}

interface MenuOptionProps {
  label: string;
  danger?: boolean;
  selected?: boolean;
  onPress: () => void;
}

function MenuOption({
  label,
  danger = false,
  selected = false,
  onPress,
}: MenuOptionProps): React.ReactElement {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuOption,
        selected ? styles.menuOptionSelected : undefined,
        pressed ? styles.menuOptionPressed : undefined,
      ]}
    >
      <Text
        color={danger ? 'error' : 'default'}
        size="sm"
        style={styles.menuOptionLabel}
      >
        {label}
      </Text>
      {selected ? <Icon color="primary" icon="check" size="small" /> : null}
    </Pressable>
  );
}

interface ContextMenuProps {
  value: number;
  onSelect: (value: number) => void;
}

function ContextMenu({ value, onSelect }: ContextMenuProps): React.ReactElement {
  const { token } = useTheme();
  const styles = useStyles();

  return (
    <Column style={styles.menu} gap={token.marginXXS}>
      {CONTEXT_WINDOW_OPTIONS.map(option => (
        <MenuOption
          key={option.value}
          label={option.label}
          onPress={() => onSelect(option.value)}
          selected={value === option.value}
        />
      ))}
    </Column>
  );
}

interface EffortMenuProps {
  value: AgentReasoningEffort;
  onSelect: (value: AgentReasoningEffort) => void;
}

function EffortMenu({ value, onSelect }: EffortMenuProps): React.ReactElement {
  const { token } = useTheme();
  const styles = useStyles();

  return (
    <Column style={styles.menu} gap={token.marginXXS}>
      {REASONING_EFFORT_OPTIONS.map(option => (
        <MenuOption
          key={option.value}
          label={option.label}
          onPress={() => onSelect(option.value)}
          selected={value === option.value}
        />
      ))}
    </Column>
  );
}

interface ActionsMenuProps {
  isDefault: boolean;
  onSetDefault: () => void;
  onRemove: () => void;
  onClose: () => void;
}

function ActionsMenu({
  isDefault,
  onSetDefault,
  onRemove,
  onClose,
}: ActionsMenuProps): React.ReactElement {
  const { token } = useTheme();
  const styles = useStyles();

  return (
    <Column style={styles.menu} gap={token.marginXXS}>
      {isDefault ? (
        <MenuOption label="默认模型" onPress={onClose} selected />
      ) : (
        <MenuOption label="设为默认" onPress={onSetDefault} />
      )}
      <MenuOption danger label="移除" onPress={onRemove} />
    </Column>
  );
}

interface SelectFieldProps {
  label: string;
  open: boolean;
  style: StyleProp<ViewStyle>;
  content: React.ReactNode;
  onPress: () => void;
  onOpenChange: (open: boolean) => void;
}

function SelectField({
  label,
  open,
  style,
  content,
  onPress,
  onOpenChange,
}: SelectFieldProps): React.ReactElement {
  return (
    <Popover
      align="end"
      content={content}
      onOpenChange={onOpenChange}
      open={open}
      placement="bottom"
      trigger="manual"
    >
      <DisplayInput
        display="inline"
        onPress={onPress}
        size="small"
        style={style}
        suffix={<Icon color="tertiary" icon="caret-down" size="small" />}
        valueText={label}
      />
    </Popover>
  );
}

interface ModelRowProps {
  row: ModelRowState;
  isDefault: boolean;
  openField: ModelMenuField | null;
  onOpenFieldChange: (field: ModelMenuField | null) => void;
  onUpdate: (patch: Partial<ModelRowState>) => void;
  onSetDefault: () => void;
  onRemove: () => void;
}

function ModelRow({
  row,
  isDefault,
  openField,
  onOpenFieldChange,
  onUpdate,
  onSetDefault,
  onRemove,
}: ModelRowProps): React.ReactElement {
  const { token } = useTheme();
  const styles = useStyles();
  const closeMenu = () => onOpenFieldChange(null);
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeMenu();
    }
  };
  const toggleMenu = (field: ModelMenuField) => {
    onOpenFieldChange(openField === field ? null : field);
  };

  return (
    <Row style={styles.modelRow} gap={token.marginXXS} align="center">
      <Row style={styles.nameCell} gap={token.marginXXS}>
        <Text
          ellipsizeMode="middle"
          numberOfLines={1}
          size="sm"
          style={styles.modelName}
          weight={isDefault ? 'medium' : 'regular'}
        >
          {row.modelId}
        </Text>
        {isDefault ? (
          <Icon color="primary" icon="check-circle" size="small" />
        ) : null}
      </Row>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: row.multimodal }}
        hitSlop={IMAGE_TOGGLE_HIT_SLOP}
        onPress={() => onUpdate({ multimodal: !row.multimodal })}
        style={({ pressed }) => [
          styles.imageToggle,
          pressed ? styles.imageTogglePressed : undefined,
        ]}
        testID={`agent-model-multimodal-${row.modelId}`}
      >
        <Icon
          color={row.multimodal ? 'primary' : 'tertiary'}
          icon="image"
          size="small"
          weight={row.multimodal ? 'fill' : undefined}
        />
      </Pressable>

      <SelectField
        content={
          <ContextMenu
            onSelect={value => {
              onUpdate({ contextWindow: value });
              closeMenu();
            }}
            value={row.contextWindow}
          />
        }
        label={formatContextWindow(row.contextWindow)}
        onOpenChange={handleOpenChange}
        onPress={() => toggleMenu('context')}
        open={openField === 'context'}
        style={styles.contextField}
      />

      <SelectField
        content={
          <EffortMenu
            onSelect={value => {
              onUpdate({ reasoningEffort: value });
              closeMenu();
            }}
            value={row.reasoningEffort}
          />
        }
        label={formatReasoningEffort(row.reasoningEffort)}
        onOpenChange={handleOpenChange}
        onPress={() => toggleMenu('effort')}
        open={openField === 'effort'}
        style={styles.effortField}
      />

      <Popover
        align="end"
        content={
          <ActionsMenu
            isDefault={isDefault}
            onClose={closeMenu}
            onRemove={() => {
              onRemove();
              closeMenu();
            }}
            onSetDefault={() => {
              onSetDefault();
              closeMenu();
            }}
          />
        }
        onOpenChange={handleOpenChange}
        open={openField === 'actions'}
        placement="bottom"
        trigger="manual"
      >
        <Button
          icon="more"
          onPress={() => toggleMenu('actions')}
          shape="circle"
          size="small"
          type="text"
        />
      </Popover>
    </Row>
  );
}

export function ProviderModelSection({
  rows,
  defaultModelId,
  modelPlaceholder,
  manualModel,
  availableModels,
  onAddModel,
  onRemoveModel,
  onSetDefaultModel,
  onUpdateRow,
  onChangeManualModel,
  onSubmitManualModel,
}: ProviderModelSectionProps): React.ReactElement {
  const { token } = useTheme();
  const styles = useStyles();
  const [openMenu, setOpenMenu] = useState<OpenMenuState | null>(null);

  const handleOpenFieldChange = (modelId: string) => (
    field: ModelMenuField | null,
  ): void => {
    setOpenMenu(field === null ? null : { modelId, field });
  };

  return (
    <Column gap="normal">
      <Row gap="small" align="center">
        <Text size="md" weight="medium">
          可用模型
        </Text>
        <InfoHint content="默认模型用于新会话，会话中可在输入框左侧随时切换。点亮「图片」的模型支持图片输入，只有多模态模型才能发送图片。" />
      </Row>

      {rows.length === 0 ? (
        <Text color="placeholder" size="xs">
          尚未添加模型，请从下方选择或手动添加。
        </Text>
      ) : (
        <Column>
          <Row gap={token.marginXXS} align="center">
            <Text color="tertiary" size="xs" style={styles.headName}>
              模型
            </Text>
            <Text color="tertiary" size="xs" style={styles.imageCell} textAlign="center">
              图片
            </Text>
            <Text color="tertiary" size="xs" style={styles.contextCell} textAlign="center">
              上下文
            </Text>
            <Text color="tertiary" size="xs" style={styles.effortCell} textAlign="center">
              思考强度
            </Text>
            <Text color="tertiary" size="xs" style={styles.actionsCell} textAlign="center">
              操作
            </Text>
          </Row>
          <Divider spacing="none" />
          {rows.map((row, index) => (
            <React.Fragment key={row.modelId}>
              {index > 0 ? <Divider spacing="none" /> : null}
              <ModelRow
                isDefault={row.modelId === defaultModelId}
                onOpenFieldChange={handleOpenFieldChange(row.modelId)}
                onRemove={() => onRemoveModel(row.modelId)}
                onSetDefault={() => onSetDefaultModel(row.modelId)}
                onUpdate={patch => onUpdateRow(row.modelId, patch)}
                openField={
                  openMenu?.modelId === row.modelId ? openMenu.field : null
                }
                row={row}
              />
            </React.Fragment>
          ))}
        </Column>
      )}

      <Row gap="small" align="end">
        <Column style={styles.addField}>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            labelText="手动添加模型"
            onChange={onChangeManualModel}
            placeholder={modelPlaceholder}
            size="small"
            value={manualModel}
          />
        </Column>
        <Button
          disabled={!manualModel.trim()}
          onPress={onSubmitManualModel}
          size="small"
          type="default"
        >
          添加
        </Button>
      </Row>

      {availableModels.length > 0 ? (
        <Column gap="small">
          <Text color="secondary" size="xs">
            可添加的模型
          </Text>
          <Row gap="small" wrap>
            {availableModels.map(modelId => (
              <Button
                key={modelId}
                onPress={() => onAddModel(modelId)}
                size="small"
                type="text"
              >
                {modelId}
              </Button>
            ))}
          </Row>
        </Column>
      ) : null}
    </Column>
  );
}
