import React, { useCallback, useEffect, useState } from 'react';
import { MAX_AGENT_RULES_LENGTH } from '@pennyspring/api';
import {
  Button,
  Card,
  Column,
  Loading,
  Row,
  Text,
  Textarea,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

import { useGlobalApi } from '../../stores/bookStore';
import {
  DEFAULT_AGENT_RULES,
  DEFAULT_QUICK_BOOK_DRAFT_RULES,
} from '../projection/rules';

const useStyles = createUseSheetStyle(token => ({
  section: {
    gap: token.marginSM,
  },
}));

interface RulesDraft {
  agentRules: string;
  quickBookRules: string;
}

export interface AgentRulesCardProps {
  booksId: number;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

function toStoredRules(value: string, defaultRules: string): string {
  const trimmed = value.trim();
  return trimmed === defaultRules.trim() ? '' : trimmed;
}

function toDraftRules(agentRules: string, quickBookRules: string): RulesDraft {
  return {
    agentRules: agentRules || DEFAULT_AGENT_RULES,
    quickBookRules: quickBookRules || DEFAULT_QUICK_BOOK_DRAFT_RULES,
  };
}

export function AgentRulesCard({
  booksId,
}: AgentRulesCardProps): React.ReactElement {
  const styles = useStyles();
  const toast = useToast();
  const api = useGlobalApi();

  const [draft, setDraft] = useState<RulesDraft>(() => toDraftRules('', ''));
  const [saved, setSaved] = useState<RulesDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [mainResetArmed, setMainResetArmed] = useState(false);
  const [draftResetArmed, setDraftResetArmed] = useState(false);

  useEffect(() => {
    if (booksId <= 0) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    api.agentRules
      .get(booksId)
      .then(row => {
        if (cancelled) return;
        const next = toDraftRules(row.agentRules, row.quickBookRules);
        setSaved(next);
        setDraft(next);
        setMainResetArmed(false);
        setDraftResetArmed(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(getErrorMessage(error, '读取规则失败，请稍后重试'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api, booksId, reloadToken]);

  const dirty =
    saved !== null &&
    (draft.agentRules !== saved.agentRules ||
      draft.quickBookRules !== saved.quickBookRules);

  const handleSave = useCallback(async (): Promise<void> => {
    if (booksId <= 0 || saving) {
      return;
    }
    setSaving(true);
    try {
      const row = await api.agentRules.set({
        booksId,
        agentRules: toStoredRules(draft.agentRules, DEFAULT_AGENT_RULES),
        quickBookRules: toStoredRules(
          draft.quickBookRules,
          DEFAULT_QUICK_BOOK_DRAFT_RULES,
        ),
      });
      const next = toDraftRules(row.agentRules, row.quickBookRules);
      setSaved(next);
      setDraft(next);
      setMainResetArmed(false);
      setDraftResetArmed(false);
      toast.show({ messageText: '规则已保存，下一条消息生效' });
    } catch (error: unknown) {
      toast.show({
        messageText: getErrorMessage(error, '保存规则失败，请稍后重试'),
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
  }, [api, booksId, draft, saving, toast]);

  const handleResetMainRules = useCallback((): void => {
    if (!mainResetArmed) {
      setMainResetArmed(true);
      setDraftResetArmed(false);
      return;
    }
    setDraft(current => ({ ...current, agentRules: DEFAULT_AGENT_RULES }));
    setMainResetArmed(false);
  }, [mainResetArmed]);

  const handleResetDraftRules = useCallback((): void => {
    if (!draftResetArmed) {
      setDraftResetArmed(true);
      setMainResetArmed(false);
      return;
    }
    setDraft(current => ({
      ...current,
      quickBookRules: DEFAULT_QUICK_BOOK_DRAFT_RULES,
    }));
    setDraftResetArmed(false);
  }, [draftResetArmed]);

  if (loading) {
    return (
      <Card titleText="助手规则" variant="plain">
        <Loading text="正在读取助手规则" variant="inline" />
      </Card>
    );
  }

  return (
    <Card
      footer={
        <Button
          block
          disabled={!dirty || saving}
          loading={saving}
          onPress={() => {
            handleSave().catch(() => undefined);
          }}
          type="primary"
        >
          保存规则
        </Button>
      }
      titleText="助手规则"
      variant="plain"
    >
      <Column style={styles.section}>
        <Text color="secondary" size="xs">
          规则保存在当前账本，切换账本后独立生效；留空使用默认规则。
          用自然语言写你的记账偏好即可，工具名和参数由系统处理；角色与安全约束固定不可改。
        </Text>

        {loadError !== '' ? (
          <Row align="center" gap="normal" justify="between">
            <Text color="errorText" size="xs">
              {loadError}
            </Text>
            <Button
              onPress={() => setReloadToken(value => value + 1)}
              size="small"
              type="text"
            >
              重试
            </Button>
          </Row>
        ) : null}

        <Row align="center" justify="between">
          <Text size="sm" weight="medium">
            主对话规则
          </Text>
          <Button
            onPress={handleResetMainRules}
            size="small"
            testID="agent-rules-reset-main"
            type={mainResetArmed ? 'danger' : 'text'}
          >
            {mainResetArmed ? '确认恢复' : '恢复默认'}
          </Button>
        </Row>
        <Textarea
          maxLength={MAX_AGENT_RULES_LENGTH}
          maxRows={16}
          minRows={8}
          onChange={value => {
            setMainResetArmed(false);
            setDraftResetArmed(false);
            setDraft(current => ({ ...current, agentRules: value }));
          }}
          showCount
          testID="agent-rules-main-input"
          value={draft.agentRules}
        />
        <Text color="tertiary" size="xs">
          适用于记账助手对话；截图提醒与系统分享图片进入的对话也使用这套规则。
        </Text>

        <Row align="center" justify="between">
          <Text size="sm" weight="medium">
            草稿生成规则
          </Text>
          <Button
            onPress={handleResetDraftRules}
            size="small"
            testID="agent-rules-reset-draft"
            type={draftResetArmed ? 'danger' : 'text'}
          >
            {draftResetArmed ? '确认恢复' : '恢复默认'}
          </Button>
        </Row>
        <Textarea
          maxLength={MAX_AGENT_RULES_LENGTH}
          maxRows={16}
          minRows={8}
          onChange={value => {
            setMainResetArmed(false);
            setDraftResetArmed(false);
            setDraft(current => ({ ...current, quickBookRules: value }));
          }}
          showCount
          testID="agent-rules-draft-input"
          value={draft.quickBookRules}
        />
        <Text color="tertiary" size="xs">
          适用于悬浮球截图与系统分享图片生成的草稿；金额缺失、最多 20
          笔等限制仍由系统固定。
        </Text>

        {dirty ? (
          <Text color="warningText" size="xs">
            有未保存的修改
          </Text>
        ) : null}
      </Column>
    </Card>
  );
}
