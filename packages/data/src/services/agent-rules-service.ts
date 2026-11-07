import { eq } from 'drizzle-orm';

import { agentRules } from '../schema';
import type { Database } from '../types';
import { validateBookExists } from './helpers';
import type { AgentRulesRow, UpdateAgentRulesInput } from './types';

export const MAX_AGENT_RULES_LENGTH = 4000;

type RulesReader = Pick<Database, 'select'>;

export function normalizeAgentRulesText(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length > MAX_AGENT_RULES_LENGTH) {
    throw new Error(`规则不能超过 ${MAX_AGENT_RULES_LENGTH} 字符`);
  }
  return trimmed;
}

async function readAgentRules(
  db: RulesReader,
  booksId: number,
): Promise<AgentRulesRow> {
  const row = await db
    .select()
    .from(agentRules)
    .where(eq(agentRules.booksId, booksId))
    .get();
  if (!row) {
    return {
      booksId,
      agentRules: '',
      quickBookRules: '',
      createdTime: 0,
      updatedTime: 0,
    };
  }
  return {
    booksId: row.booksId,
    agentRules: row.agentRules,
    quickBookRules: row.quickBookRules,
    createdTime: row.createdTime,
    updatedTime: row.updatedTime,
  };
}

export function getAgentRules(
  db: Database,
  booksId: number,
): Promise<AgentRulesRow> {
  return readAgentRules(db, booksId);
}

export async function setAgentRules(
  db: Database,
  input: UpdateAgentRulesInput,
): Promise<AgentRulesRow> {
  const normalized = {
    agentRules: normalizeAgentRulesText(input.agentRules),
    quickBookRules: normalizeAgentRulesText(input.quickBookRules),
  };

  return db.transaction(async tx => {
    await validateBookExists(tx, input, 'booksId');
    await tx
      .insert(agentRules)
      .values({
        booksId: input.booksId,
        ...normalized,
      })
      .onConflictDoUpdate({
        target: agentRules.booksId,
        set: {
          ...normalized,
          updatedTime: Date.now(),
        },
      });
    return readAgentRules(tx, input.booksId);
  });
}
