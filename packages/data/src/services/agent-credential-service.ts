import { and, eq } from 'drizzle-orm';

import { agentProviders, bookProviderKeys } from '../schema';
import type { Database } from '../types';
import { validateBookExists } from './helpers';
import type { Tx } from './types';

async function ensureProviderExists(tx: Tx, providerId: number): Promise<void> {
  const row = await tx
    .select({ id: agentProviders.id })
    .from(agentProviders)
    .where(eq(agentProviders.id, providerId))
    .get();
  if (!row) {
    throw new Error(`提供商不存在: ${providerId}`);
  }
}

export async function hasProviderKey(
  db: Database,
  booksId: number,
  providerId: number,
): Promise<boolean> {
  const row = await db
    .select({ apiKey: bookProviderKeys.apiKey })
    .from(bookProviderKeys)
    .where(
      and(
        eq(bookProviderKeys.booksId, booksId),
        eq(bookProviderKeys.providerId, providerId),
      ),
    )
    .get();
  return row !== undefined && row.apiKey !== '';
}

export async function getProviderKey(
  db: Database,
  booksId: number,
  providerId: number,
): Promise<string> {
  const row = await db
    .select({ apiKey: bookProviderKeys.apiKey })
    .from(bookProviderKeys)
    .where(
      and(
        eq(bookProviderKeys.booksId, booksId),
        eq(bookProviderKeys.providerId, providerId),
      ),
    )
    .get();
  return row?.apiKey ?? '';
}

export function setProviderKey(
  db: Database,
  booksId: number,
  providerId: number,
  apiKey: string,
): Promise<void> {
  return db.transaction(async tx => {
    await validateBookExists(tx, { booksId }, 'booksId');
    await ensureProviderExists(tx, providerId);

    const normalizedKey = apiKey.trim();
    if (!normalizedKey) {
      await tx
        .delete(bookProviderKeys)
        .where(
          and(
            eq(bookProviderKeys.booksId, booksId),
            eq(bookProviderKeys.providerId, providerId),
          ),
        );
      return;
    }

    await tx
      .insert(bookProviderKeys)
      .values({ booksId, providerId, apiKey: normalizedKey })
      .onConflictDoUpdate({
        target: [bookProviderKeys.booksId, bookProviderKeys.providerId],
        set: { apiKey: normalizedKey, updatedTime: Date.now() },
      });
  });
}
