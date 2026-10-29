import React from 'react';
import {
  Button,
  Column,
  Divider,
  Input,
  Row,
  Tag,
  Text,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

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

export interface ModelRowState {
  modelId: string;
  contextWindow: number;
  reasoningEffort: AgentReasoningEffort;
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

const useStyles = createUseSheetStyle(token => ({
  section: {
    gap: token.marginSM,
  },
  header: {
    gap: token.marginXXS,
  },
  modelRow: {
    gap: token.marginSM,
    paddingVertical: token.paddingXS,
  },
  modelHeader: {
    alignItems: 'center',
    gap: token.marginXS,
  },
  modelNameWrap: {
    flex: 1,
    gap: token.marginXXS,
  },
  effortField: {
    gap: token.marginXS,
  },
  optionRow: {
    flexWrap: 'wrap',
    gap: token.marginXS,
  },
  addRow: {
    alignItems: 'flex-end',
    gap: token.marginXS,
  },
  addField: {
    flex: 1,
  },
  available: {
    gap: token.marginXS,
  },
  availableList: {
    flexWrap: 'wrap',
    gap: token.marginXS,
  },
}));

export function createModelRow(modelId: string): ModelRowState {
  return {
    modelId,
    contextWindow: DEFAULT_CONTEXT_WINDOW,
    reasoningEffort: DEFAULT_REASONING_EFFORT,
  };
}

export function toModelRow(model: AgentModelConfig): ModelRowState {
  return {
    modelId: model.modelId,
    contextWindow: model.contextWindow,
    reasoningEffort: model.reasoningEffort,
  };
}

export function toModelConfigs(
  rows: readonly ModelRowState[],
): AgentModelConfig[] {
  return rows.map(row => ({
    modelId: row.modelId,
    contextWindow: row.contextWindow,
    reasoningEffort: row.reasoningEffort,
  }));
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
  const styles = useStyles();

  return (
    <Column style={styles.section}>
      <Column style={styles.header}>
        <Text size="md" weight="medium">
          可用模型
        </Text>
        <Text color="tertiary" size="xs">
          默认模型用于新会话；会话中可在输入框左侧随时切换。
        </Text>
        <Text color="tertiary" size="xs">
          思考强度为「关闭」时不下发参数；所选档位需模型支持。
        </Text>
      </Column>

      {rows.length === 0 ? (
        <Text color="placeholder" size="xs">
          尚未添加模型，请从下方选择或手动添加。
        </Text>
      ) : (
        rows.map((row, index) => (
          <React.Fragment key={row.modelId}>
            {index > 0 ? <Divider /> : null}
            <Column style={styles.modelRow}>
              <Row style={styles.modelHeader}>
                <Column style={styles.modelNameWrap}>
                  <Text numberOfLines={1} size="sm" weight="medium">
                    {row.modelId}
                  </Text>
                  <Text color="tertiary" size="xs">
                    上下文 {formatContextWindow(row.contextWindow)}
                    {' · '}
                    思考{formatReasoningEffort(row.reasoningEffort)}
                  </Text>
                </Column>
                {row.modelId === defaultModelId ? (
                  <Tag color="success" size="small">
                    默认
                  </Tag>
                ) : (
                  <Button
                    onPress={() => onSetDefaultModel(row.modelId)}
                    size="small"
                    type="text"
                  >
                    设为默认
                  </Button>
                )}
                <Button
                  color="danger"
                  onPress={() => onRemoveModel(row.modelId)}
                  size="small"
                  type="text"
                >
                  移除
                </Button>
              </Row>

              <Column style={styles.effortField}>
                <Text color="secondary" size="xs">
                  上下文窗口
                </Text>
                <Row style={styles.optionRow}>
                  {CONTEXT_WINDOW_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      onPress={() =>
                        onUpdateRow(row.modelId, {
                          contextWindow: option.value,
                        })
                      }
                      size="small"
                      type={
                        row.contextWindow === option.value
                          ? 'primary'
                          : 'default'
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </Row>
              </Column>

              <Column style={styles.effortField}>
                <Text color="secondary" size="xs">
                  思考强度
                </Text>
                <Row style={styles.optionRow}>
                  {REASONING_EFFORT_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      onPress={() =>
                        onUpdateRow(row.modelId, {
                          reasoningEffort: option.value,
                        })
                      }
                      size="small"
                      type={
                        row.reasoningEffort === option.value
                          ? 'primary'
                          : 'default'
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </Row>
              </Column>
            </Column>
          </React.Fragment>
        ))
      )}

      <Row style={styles.addRow}>
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
        <Column style={styles.available}>
          <Text color="secondary" size="xs">
            可添加的模型
          </Text>
          <Row style={styles.availableList}>
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
