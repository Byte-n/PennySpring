import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  VISIBILITY,
  type AssetRow,
  type RecordRow,
  type TypeRow,
} from '@pennyspring/api';

import {
  categoryOf,
  percentOf,
  shiftMonth,
  toTypeMap,
  type AssetOverview,
  type DueReminder,
  type NetWorthPoint,
} from './chartModel';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DUE_LIMIT = 2;
const DEFAULT_TREND_MONTHS = 6;

function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function isLiabilityAsset(asset: AssetRow): boolean {
  return (
    asset.type === ASSET_TYPE.creditCard ||
    (asset.type === ASSET_TYPE.debt &&
      asset.classification === ASSET_CLASSIFICATION.borrow)
  );
}

function isReceivableAsset(asset: AssetRow): boolean {
  return (
    asset.type === ASSET_TYPE.debt &&
    asset.classification === ASSET_CLASSIFICATION.lend
  );
}

export function buildAssetOverview(assets: readonly AssetRow[]): AssetOverview {
  const visible = assets.filter(asset => asset.invisible !== VISIBILITY.hidden);
  let capital = 0;
  let stored = 0;
  let investment = 0;
  let receivable = 0;
  let credit = 0;
  let borrow = 0;

  for (const asset of visible) {
    if (asset.type === ASSET_TYPE.capitalAccount) {
      capital += asset.balance;
    } else if (asset.type === ASSET_TYPE.storedValueCard) {
      stored += asset.balance;
    } else if (asset.type === ASSET_TYPE.investment) {
      investment += asset.balance;
    } else if (asset.type === ASSET_TYPE.creditCard) {
      credit += asset.balance;
    } else if (isReceivableAsset(asset)) {
      receivable += asset.balance;
    } else if (
      asset.type === ASSET_TYPE.debt &&
      asset.classification === ASSET_CLASSIFICATION.borrow
    ) {
      borrow += asset.balance;
    }
  }

  const available = capital + stored + investment;
  const debt = credit + borrow;
  const assetsTotal = available + receivable;
  const accounts = [...visible]
    .sort((a, b) => a.sort - b.sort || a.id - b.id)
    .map(asset => {
      const liability = isLiabilityAsset(asset);
      return {
        asset,
        name: asset.name,
        subtitle: buildAccountSubtitle(asset),
        amount: liability ? -asset.balance : asset.balance,
        isLiability: liability,
      };
    });

  return {
    available,
    receivable,
    debt,
    netWorth: available + receivable - debt,
    assetsTotal,
    liabilitiesTotal: debt,
    debtRatio: percentOf(debt, assetsTotal),
    assetGroups: [
      { key: 'capital', name: '资金账户', amount: capital },
      { key: 'stored', name: '储值卡', amount: stored },
      { key: 'investment', name: '投资理财', amount: investment },
      { key: 'receivable', name: '应收债权', amount: receivable },
    ],
    liabilityGroups: [
      { key: 'credit', name: '信用卡待还', amount: credit },
      { key: 'borrow', name: '借入债务', amount: borrow },
    ],
    accounts,
  };
}

function buildAccountSubtitle(asset: AssetRow): string {
  if (asset.type === ASSET_TYPE.creditCard) {
    return asset.repaymentDate > 0
      ? `待还 · 每月${asset.repaymentDate}日`
      : '待还';
  }
  if (isLiabilityAsset(asset)) {
    return asset.repaymentDate > 0
      ? `应还 · 每月${asset.repaymentDate}日`
      : '应还';
  }
  if (isReceivableAsset(asset)) {
    return '应收债权';
  }
  const typeLabel =
    ASSET_CLASSIFICATION.label(asset.classification) ||
    ASSET_TYPE.label(asset.type);
  if (asset.cardNo.length >= 4) {
    return `${typeLabel} · 尾号${asset.cardNo.slice(-4)}`;
  }
  return typeLabel;
}

export function buildNetWorthHistory(
  assets: readonly AssetRow[],
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  anchor: Date,
  months = DEFAULT_TREND_MONTHS,
): NetWorthPoint[] {
  if (assets.length === 0) return [];

  const typeMap = toTypeMap(types);
  const currentNetWorth = buildAssetOverview(assets).netWorth;
  const anchorStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);

  return Array.from({ length: months }, (_, index) => {
    const offset = index - (months - 1);
    const monthDate = shiftMonth(anchorStart, offset);
    const nextMonthStart = shiftMonth(anchorStart, offset + 1).getTime();
    let laterNetEffect = 0;

    for (const record of records) {
      if (record.recordTime < nextMonthStart) continue;
      const category = categoryOf(typeMap, record.typeId);
      if (category === RECORD_TYPE_CATEGORY.expense) {
        laterNetEffect -= record.finalAmount;
      } else if (category === RECORD_TYPE_CATEGORY.income) {
        laterNetEffect += record.finalAmount;
      }
    }

    return {
      label: `${monthDate.getMonth() + 1}月`,
      value: currentNetWorth - laterNetEffect,
    };
  });
}

function buildDueDate(year: number, monthIndex: number, day: number): number {
  const normalized = new Date(year, monthIndex, 1);
  const targetYear = normalized.getFullYear();
  const targetMonth = normalized.getMonth();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  return new Date(
    targetYear,
    targetMonth,
    Math.min(Math.max(day, 1), daysInMonth),
  ).getTime();
}

export function buildDueReminders(
  assets: readonly AssetRow[],
  now: Date,
  limit = DEFAULT_DUE_LIMIT,
): DueReminder[] {
  const today = startOfDay(now.getTime());
  const todayDate = new Date(today);

  return assets
    .filter(asset => asset.invisible !== VISIBILITY.hidden)
    .filter(asset => isLiabilityAsset(asset))
    .filter(asset => asset.balance > 0 && asset.repaymentDate > 0)
    .map(asset => {
      const thisMonthDue = buildDueDate(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        asset.repaymentDate,
      );
      const dueDate =
        thisMonthDue >= today
          ? thisMonthDue
          : buildDueDate(
              todayDate.getFullYear(),
              todayDate.getMonth() + 1,
              asset.repaymentDate,
            );
      return {
        asset,
        dueDate,
        daysLeft: Math.round((dueDate - today) / DAY_MS),
        amount: asset.balance,
      };
    })
    .sort((a, b) => a.dueDate - b.dueDate || a.asset.id - b.asset.id)
    .slice(0, limit);
}
