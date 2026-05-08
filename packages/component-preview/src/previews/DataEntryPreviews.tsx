import React from 'react';
import { View } from 'react-native';
import {
  Calendar,
  Input,
  SelectionList,
  Text,
  Textarea,
} from '@pennyspring/component';
import { MagnifyingGlassIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from './PreviewScaffold';
import type {
  SelectionListOption,
  SelectionListOptionGroup,
} from '@pennyspring/component';

const SELECTION_LIST_OPTIONS: SelectionListOption[] = [
  { value: 'cash', label: 'Cash', description: 'Available balance' },
  { value: 'card', label: 'Card', description: 'Primary card' },
  { value: 'saving', label: 'Saving', disabled: true },
];

const SELECTION_LIST_GROUPS: SelectionListOptionGroup[] = [
  {
    key: 'daily',
    title: 'Daily',
    options: [
      { value: 'food', label: 'Food' },
      { value: 'traffic', label: 'Traffic' },
    ],
  },
  {
    key: 'fixed',
    title: 'Fixed',
    options: [
      { value: 'rent', label: 'Rent' },
      { value: 'utility', label: 'Utility' },
    ],
  },
];

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXS,
  },
  prefix: {
    color: token.colorTextSecondary,
  },
  calendarBox: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
}));

export function InputPreview() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <Input label="Normal" placeholder="Placeholder" defaultValue="PennySpring" />
          <Input
            clearable
            defaultValue="Search text"
            label="With addons"
            prefix={<MagnifyingGlassIcon color={token.colorIcon} size={token.fontSizeLG} />}
            suffix={<Text color="description">USD</Text>}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Status">
        <View style={styles.stack}>
          <Input label="Error" status="error" errorText="Invalid value" defaultValue="100.00" />
          <Input label="Warning" status="warning" helperText="Please review this value" defaultValue="42" />
          <Input label="Success" status="success" helperText="Looks good" defaultValue="Ready" />
        </View>
      </PreviewSection>

      <PreviewSection title="State">
        <View style={styles.stack}>
          <Input disabled label="Disabled" defaultValue="Disabled value" />
          <Input readonly label="Readonly" defaultValue="Readonly value" />
          <Input loading label="Loading" defaultValue="Checking" />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}

export function TextareaPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <Textarea
          defaultValue="A multi-line note for preview."
          helperText="Helper text stays below the field."
          label="Note"
          maxLength={140}
          showCount
        />
      </PreviewSection>

      <PreviewSection title="Rows and status">
        <View style={styles.stack}>
          <Textarea label="Small" size="small" minRows={2} placeholder="Small textarea" />
          <Textarea label="Large" size="large" minRows={4} placeholder="Large textarea" />
          <Textarea
            defaultValue="This value needs attention."
            errorText="Please shorten the content."
            label="Error"
            status="error"
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}

export function SelectionListPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Trigger">
        <View style={styles.stack}>
          <SelectionList label="Single" options={SELECTION_LIST_OPTIONS} defaultValue="cash" />
          <SelectionList label="Multiple" mode="multiple" options={SELECTION_LIST_OPTIONS} defaultValue={['cash', 'card']} />
          <SelectionList disabled label="Disabled" options={SELECTION_LIST_OPTIONS} placeholder="Not selectable" />
        </View>
      </PreviewSection>

      <PreviewSection title="Open and grouped">
        <SelectionList
          defaultOpen
          groups={SELECTION_LIST_GROUPS}
          helperText="Grouped options with search input."
          label="Grouped"
          searchable
        />
      </PreviewSection>
    </PreviewScaffold>
  );
}

export function CalendarPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Date">
        <Calendar
          defaultValue="2026-05-07"
          marks={[
            { date: '2026-05-07', content: <Text size="sm">2</Text> },
            { date: '2026-05-12', content: <Text size="sm">1</Text> },
          ]}
          showToday
          style={styles.calendarBox}
        />
      </PreviewSection>

      <PreviewSection title="Modes and range">
        <View style={styles.stack}>
          <Calendar mode="month" defaultValue="2026-05" style={styles.calendarBox} />
          <Calendar.Range defaultValue={['2026-05-03', '2026-05-12']} style={styles.calendarBox} />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
