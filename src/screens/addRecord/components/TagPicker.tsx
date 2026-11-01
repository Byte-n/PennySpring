import React, { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { TagPicker as BaseTagPicker } from '@pennyspring/ui';
import type {
  TagPickerOption,
  TagPickerTexts,
  TagPickerValue,
} from '@pennyspring/ui';
import { VISIBILITY, type TagRow } from '@pennyspring/api';

import { getPhosphorIconComponent } from '../../../constants/typeIconTree';

interface TagPickerProps {
  disabled?: boolean;
  labelText?: string;
  loading?: boolean;
  onChange: (value: number[]) => void;
  style?: StyleProp<ViewStyle>;
  tags: TagRow[];
  titleText?: string;
  value: number[];
}

const TEXTS: TagPickerTexts = {
  emptyText: '暂无标签，可在标签管理中新增',
  hiddenOptionsTitle: '已隐藏',
  loadingText: '标签加载中',
  optionsTitle: '标签',
};

export function TagPicker({
  disabled = false,
  labelText = '标签',
  loading = false,
  onChange,
  style,
  tags,
  titleText = '选择标签',
  value,
}: TagPickerProps) {
  const options = useMemo<TagPickerOption[]>(
    () =>
      tags.map(tag => ({
        hidden: tag.invisible === VISIBILITY.hidden,
        icon: tag.icon ? getPhosphorIconComponent(tag.icon) : undefined,
        labelText: tag.name,
        value: tag.id,
      })),
    [tags],
  );

  function handleChange(nextValue: TagPickerValue[]): void {
    onChange(nextValue as number[]);
  }

  return (
    <BaseTagPicker
      disabled={disabled}
      floatingPanelProps={{
        closeOnMaskClick: true,
        height: '50%',
        keyboardAvoiding: true,
        titleText,
      }}
      labelText={labelText}
      loading={loading}
      onChange={handleChange}
      options={options}
      style={style}
      tagProps={{ closable: false }}
      texts={TEXTS}
      value={value}
    />
  );
}
