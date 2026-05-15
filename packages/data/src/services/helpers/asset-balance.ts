import { eq, sql } from 'drizzle-orm'

import { ASSET_CLASSIFICATION, ASSET_TYPE } from '../../constants'
import { assets } from '../../schema'
import type { AssetRow, Tx } from '../types'

export type BalanceAction = 'expense' | 'income' | 'transfer_out' | 'transfer_in'

export function isLiabilityAsset(asset: AssetRow): boolean {
  return (
    asset.type === ASSET_TYPE.creditCard ||
    (asset.type === ASSET_TYPE.debt && asset.classification === ASSET_CLASSIFICATION.borrow)
  )
}

export function computeBalanceChange(
  asset: AssetRow,
  action: BalanceAction,
  amount: number,
  charge: number
): number {
  const liability = isLiabilityAsset(asset)
  switch (action) {
    case 'expense':
      return liability ? amount + charge : -(amount + charge)
    case 'income':
      return liability ? -(amount - charge) : amount - charge
    case 'transfer_out':
      return liability ? amount + charge : -(amount + charge)
    case 'transfer_in':
      return liability ? -amount : amount
  }
}

export async function applyBalanceChange(tx: Tx, assetId: number, change: number) {
  if (change === 0) return
  await tx
    .update(assets)
    .set({ balance: sql`${assets.balance} + ${change}` })
    .where(eq(assets.id, assetId))
}
