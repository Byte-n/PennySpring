import React, { useState } from 'react';
import { Column, ListPicker, Text } from '@pennyspring/ui';
import type { ListPickerOption } from '@pennyspring/ui';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const OPTIONS: ListPickerOption[] = [
  { value: 'daily', labelText: 'Daily', descriptionText: 'Everyday spending' },
  { value: 'travel', labelText: 'Travel', descriptionText: 'Trips and holidays' },
  { value: 'shared', labelText: 'Shared', descriptionText: 'Shared with family' },
];

function PickerModesDemo() {
  const [single, setSingle] = useState<ListPickerOption['value']>('daily');
  const [multiple, setMultiple] = useState<ListPickerOption['value'][]>(['daily']);
  return <Column>
    <ListPicker
      labelText="Single selection"
      options={OPTIONS}
      searchable
      value={single}
      onChange={value => setSingle(Array.isArray(value) ? value[0] : value)}
      texts={{ headerText: 'Choose one', searchPlaceholder: 'Search', emptyText: 'No matches' }}
    />
    <ListPicker
      labelText="Multiple selection"
      mode="multiple"
      options={OPTIONS}
      searchable
      value={multiple}
      onChange={value => setMultiple(Array.isArray(value) ? value : value === undefined ? [] : [value])}
      texts={{ headerText: 'Choose several', searchPlaceholder: 'Search', confirmText: 'Done', emptyText: 'No matches' }}
    />
    <Text color="description">Single: {String(single)} · Multiple: {multiple.join(', ')}</Text>
  </Column>;
}

export function ListPickerPreview() {
  return <PreviewScaffold><PreviewSection title="ListPicker trigger and selection panel"><PickerModesDemo /></PreviewSection></PreviewScaffold>;
}
export default ListPickerPreview;
