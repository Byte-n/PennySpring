import { eq } from 'drizzle-orm'

import { records, recordWithRecord } from '../../schema'
import type { Tx } from '../types'

export async function recalculateAbsorption(tx: Tx, expenseRecordId: number) {
  const expense = await tx
    .select({ amount: records.amount, charge: records.charge })
    .from(records)
    .where(eq(records.id, expenseRecordId))
    .get()

  if (!expense) return

  const originalImpact = expense.amount + expense.charge

  const links = await tx
    .select({ recordId: recordWithRecord.recordId })
    .from(recordWithRecord)
    .where(eq(recordWithRecord.relatedRecordId, expenseRecordId))
    .orderBy(recordWithRecord.recordId)

  let cumulativeAbsorbed = 0

  for (const link of links) {
    const incomeRecord = await tx
      .select({ id: records.id, amount: records.amount, charge: records.charge })
      .from(records)
      .where(eq(records.id, link.recordId))
      .get()

    if (!incomeRecord) continue

    const arrivalAmount = incomeRecord.amount - incomeRecord.charge
    const availableToAbsorb = originalImpact - cumulativeAbsorbed
    const actualAbsorption = Math.min(arrivalAmount, Math.max(0, availableToAbsorb))
    const incomeFinalAmount = Math.max(0, arrivalAmount - actualAbsorption)

    await tx.update(records)
      .set({ finalAmount: incomeFinalAmount })
      .where(eq(records.id, incomeRecord.id))

    cumulativeAbsorbed += actualAbsorption
  }

  const expenseFinalAmount = Math.max(0, originalImpact - cumulativeAbsorbed)
  await tx.update(records)
    .set({ finalAmount: expenseFinalAmount })
    .where(eq(records.id, expenseRecordId))
}
