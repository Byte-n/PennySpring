import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  type AssetRow,
  type RecordRow,
  type TypeRow,
} from '@pennyspring/api';
import type { ListPickerOption } from '@pennyspring/ui';

import '../../utils/prototype';
import { formatAmount } from './addRecordDraft';

function formatCurrency(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  return `${sign}¥ ${formatAmount(Math.abs(cents))}`;
}

function formatRecordTime(time: number): string {
  return time.formatDateBy('MM-DD HH:mm');
}

export function toAssetOptions(
  assets: AssetRow[],
  disabledAssetId?: number | null,
): ListPickerOption[] {
  return assets.map(asset => ({
    value: asset.id,
    labelText: asset.name,
    descriptionText: [
      ASSET_TYPE.label(asset.type),
      ASSET_CLASSIFICATION.label(asset.classification),
      formatCurrency(asset.balance),
    ]
      .filter(Boolean)
      .join(' · '),
    disabled: disabledAssetId === asset.id,
  }));
}

export function toRelatedRecordOptions(
  records: RecordRow[],
  typeLookup: Map<number, TypeRow>,
): ListPickerOption[] {
  return records.map(record => ({
    value: record.id,
    labelText: `${typeLookup.get(record.typeId)?.name ?? '支出'} ${formatCurrency(record.amount)}`,
    descriptionText: [
      formatRecordTime(record.recordTime),
      `剩余承担 ${formatCurrency(record.finalAmount)}`,
      record.remark,
    ]
      .filter(Boolean)
      .join(' · '),
  }));
}
