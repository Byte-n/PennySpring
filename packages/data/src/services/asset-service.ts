import { count, eq } from 'drizzle-orm';

import { VISIBILITY } from '../constants';
import type { Database } from '../types';
import { assets, records } from '../schema';
import type { AssetRow, CreateAssetInput, Tx, UpdateAssetInput } from './types';

function validateAssetInput(input: CreateAssetInput | UpdateAssetInput): void {
  if (!input.name.trim()) {
    throw new Error('资产名称不能为空');
  }
}

async function getAssetRow(
  tx: Tx,
  id: number,
  booksId: number,
): Promise<AssetRow> {
  const row = await tx.select().from(assets).where(eq(assets.id, id)).get();
  if (!row) {
    throw new Error(`资产不存在: ${id}`);
  }
  if (row.booksId !== booksId) {
    throw new Error(`资产 ${id} 不属于账本 ${booksId}`);
  }
  return row;
}

export async function getAllAssets(
  db: Database,
  booksId: number,
): Promise<AssetRow[]> {
  return db.select().from(assets).where(eq(assets.booksId, booksId)).all();
}

export async function getAssetsByBook(
  db: Database,
  booksId: number,
): Promise<AssetRow[]> {
  return db.select().from(assets).where(eq(assets.booksId, booksId)).all();
}

export function createAsset(
  db: Database,
  input: CreateAssetInput,
): Promise<AssetRow> {
  validateAssetInput(input);
  return db.transaction(async tx => {
    const inserted = await tx
      .insert(assets)
      .values({
        booksId: input.booksId,
        name: input.name,
        balance: input.balance ?? 0,
        totalAmount: input.totalAmount ?? 0,
        billingDate: input.billingDate ?? 0,
        repaymentDate: input.repaymentDate ?? 0,
        type: input.type,
        classification: input.classification,
        invisible: input.invisible ?? VISIBILITY.visible,
        openBank: input.openBank ?? '',
        cardNo: input.cardNo ?? '',
        remark: input.remark ?? '',
      })
      .returning({ id: assets.id });
    const id = inserted[0]?.id;
    if (!id) throw new Error('创建资产失败');
    return getAssetRow(tx, id, input.booksId);
  });
}

export function updateAsset(
  db: Database,
  input: UpdateAssetInput,
): Promise<AssetRow> {
  validateAssetInput(input);
  return db.transaction(async tx => {
    await getAssetRow(tx, input.id, input.booksId);
    await tx
      .update(assets)
      .set({
        booksId: input.booksId,
        name: input.name,
        balance: input.balance ?? 0,
        totalAmount: input.totalAmount ?? 0,
        billingDate: input.billingDate ?? 0,
        repaymentDate: input.repaymentDate ?? 0,
        type: input.type,
        classification: input.classification,
        invisible: input.invisible ?? VISIBILITY.visible,
        openBank: input.openBank ?? '',
        cardNo: input.cardNo ?? '',
        remark: input.remark ?? '',
      })
      .where(eq(assets.id, input.id));
    return getAssetRow(tx, input.id, input.booksId);
  });
}

export function deleteAsset(
  db: Database,
  id: number,
  booksId: number,
): Promise<void> {
  return db.transaction(async tx => {
    await getAssetRow(tx, id, booksId);
    const usedCount = await tx
      .select({ count: count() })
      .from(records)
      .where(eq(records.assetId, id))
      .get();
    if ((usedCount?.count ?? 0) > 0) {
      throw new Error(`资产正在使用中,无法删除: ${id}`);
    }
    await tx.delete(assets).where(eq(assets.id, id));
  });
}
