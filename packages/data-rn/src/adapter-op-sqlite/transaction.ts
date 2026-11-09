import { sql } from 'drizzle-orm';
import { OPSQLiteSession, OPSQLiteTransaction } from 'drizzle-orm/op-sqlite';

interface SessionInternals {
  client: { transaction(run: () => Promise<void>): Promise<void> };
  dialect: unknown;
  schema: unknown;
  run(query: unknown): Promise<unknown>;
}

interface TransactionInternals {
  dialect: unknown;
  session: SessionInternals;
  schema: unknown;
  nestedIndex: number;
}

interface SessionPrototype {
  transaction(
    this: SessionInternals,
    run: (tx: unknown) => unknown,
    config?: unknown,
  ): Promise<unknown>;
}

interface TransactionPrototype {
  transaction(
    this: TransactionInternals,
    run: (tx: unknown) => unknown,
  ): Promise<unknown>;
}

type LooseTransactionConstructor = new (
  resultKind: 'async',
  dialect: unknown,
  session: unknown,
  schema: unknown,
  nestedIndex?: number,
) => unknown;

const TransactionConstructor =
  OPSQLiteTransaction as unknown as LooseTransactionConstructor;
const sessionPrototype =
  OPSQLiteSession.prototype as unknown as SessionPrototype;
const transactionPrototype =
  OPSQLiteTransaction.prototype as unknown as TransactionPrototype;

let isInstalled = false;

/**
 * 修复 drizzle-orm 0.45.x op-sqlite 会话的事务实现：
 * 原实现没有 await begin/commit 与异步回调，导致事务实际不生效、失败也不会回滚。
 * 官方在 1.0.0-rc.5 修复（"Fixed op-sqlite transaction being handled as synchronous"），
 * 升级 drizzle 到 1.0 后应删除本补丁。
 */
export function applyOpSqliteTransactionFix(): void {
  if (isInstalled) {
    return;
  }
  isInstalled = true;

  sessionPrototype.transaction = async function (run) {
    const tx = new TransactionConstructor(
      'async',
      this.dialect,
      this,
      this.schema,
    );
    let result: unknown;
    // op-sqlite 的事务包装会串行化并发事务，并等待回调结束后再提交。
    await this.client.transaction(async () => {
      result = await run(tx);
    });
    return result;
  };

  transactionPrototype.transaction = async function (run) {
    const savepoint = `sp${this.nestedIndex}`;
    const nested = new TransactionConstructor(
      'async',
      this.dialect,
      this.session,
      this.schema,
      this.nestedIndex + 1,
    );
    await this.session.run(sql.raw(`savepoint ${savepoint}`));
    try {
      const result = await run(nested);
      await this.session.run(sql.raw(`release savepoint ${savepoint}`));
      return result;
    } catch (error) {
      await this.session.run(sql.raw(`rollback to savepoint ${savepoint}`));
      throw error;
    }
  };
}
