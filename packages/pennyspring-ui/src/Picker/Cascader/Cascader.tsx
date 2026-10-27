import React, { useEffect, useMemo, useState } from 'react';
import { Column } from '../../Column';
import { Tabs } from '../../Tabs';
import { Text } from '../../Text';
import { renderTextNode } from '../../shares/node';
import { useControllableValue } from '../../_hooks';
import { PickerCore } from '../PickerCore';
import type { PickerPopupProps, PickerProps, PickerStyles } from '../types';
import type { TabsItem, TabsStyles, TabsValue } from '../../Tabs';
import type {
  PickerCascaderProps,
  PickerCascaderTab,
  PickerCascaderTabKey,
} from './types';
import type { PickerCascaderItem } from './utils';
import {
  buildChangeParams,
  buildOkParams,
  completePathFromColumn,
  getActiveTab,
  getActiveTabIndex,
  getInitialActiveTabKey,
  getOptionsForPath,
  getTabLabel,
  isTabDisabled,
  normalizeCascadeValue,
  normalizeTabValue,
  optionsToColumns,
} from './utils';

function buildTabItems<TData, TTabKey extends PickerCascaderTabKey>(
  tabs: Array<PickerCascaderTab<TData, TTabKey>>,
): Array<TabsItem> {
  return tabs.map(tab => ({
    value: tab.tabKey,
    label: getTabLabel(tab),
    disabled: isTabDisabled(tab),
  }));
}

function toPickerStyles(
  styles: PickerCascaderProps['styles'],
): PickerStyles | undefined {
  if (styles === undefined) {
    return undefined;
  }

  return {
    trigger: styles.trigger,
    input: styles.input,
    popup: styles.popup,
    panel: styles.panel,
  };
}

function toTabsStyles(
  styles: PickerCascaderProps['styles'],
): TabsStyles | undefined {
  if (styles?.tabs === undefined) {
    return undefined;
  }

  return {
    tabList: styles.tabs.tabList,
    tab: styles.tabs.tab,
    tabActive: styles.tabs.tabActive,
    label: styles.tabs.label,
    labelActive: styles.tabs.labelActive,
  };
}

export function PickerCascader<
  TData = unknown,
  TTabKey extends PickerCascaderTabKey = string,
>(props: PickerCascaderProps<TData, TTabKey>) {
  const { tabs, renderLabel } = props;
  const normalizedValue = useMemo(
    () => (props.value === undefined ? undefined : normalizeTabValue(tabs, props.value)),
    [props.value, tabs],
  );
  const normalizedDefaultValue = useMemo(
    () =>
      props.defaultValue === undefined
        ? normalizeTabValue(tabs, undefined)
        : normalizeTabValue(tabs, props.defaultValue),
    [props.defaultValue, tabs],
  );
  const [mainValue = normalizedDefaultValue, setMainValue] = useControllableValue(
    normalizedDefaultValue,
    normalizedValue,
    undefined,
  );
  const [draftValue, setDraftValue] = useState(mainValue);
  const [activeTabKey, setActiveTabKey] = useState<TTabKey | undefined>(() =>
    getInitialActiveTabKey(tabs),
  );

  useEffect(() => {
    setDraftValue(mainValue);
  }, [mainValue]);

  useEffect(() => {
    if (tabs.length === 0) {
      if (activeTabKey !== undefined) {
        setActiveTabKey(undefined);
      }

      return;
    }

    const hasActiveTab = tabs.some(tab => tab.tabKey === activeTabKey);
    if (!hasActiveTab) {
      setActiveTabKey(getInitialActiveTabKey(tabs));
    }
  }, [activeTabKey, tabs]);

  const activeTab = getActiveTab(tabs, activeTabKey);
  const resolvedActiveTabKey = activeTab?.tabKey;
  const activeTabIndex = getActiveTabIndex(tabs, resolvedActiveTabKey);
  const activeTabValue = resolvedActiveTabKey === undefined
    ? []
    : draftValue[resolvedActiveTabKey] ?? [];

  const columns = useMemo(
    () => (activeTab ? optionsToColumns(activeTab.options, activeTabValue) : []),
    [activeTab, activeTabValue],
  );

  const layerOptionsForLabel = useMemo(
    () => (activeTab ? getOptionsForPath(activeTab.options, activeTabValue) : []),
    [activeTab, activeTabValue],
  );

  const pickerRenderLabel = renderLabel && activeTab
    ? (item: PickerCascaderItem<TData>, columnIndex: number, itemIndex: number) => {
        const layer = layerOptionsForLabel[columnIndex];
        const originalOption = layer?.[itemIndex];

        if (!originalOption) {
          return item.label ?? item.labelText;
        }

        return renderLabel(originalOption);
      }
    : undefined;

  const pickerRenderHeader: NonNullable<
    PickerPopupProps<PickerCascaderItem<TData>>['renderHeader']
  > = ({ header }) => {
    const tabItems = buildTabItems(tabs);

    return (
      <Column>
        {renderTextNode(header, (text) => (
          <Text>{text}</Text>
        ))}
        <Tabs
          block
          items={tabItems}
          layout="scroll"
          onChange={nextTab => setActiveTabKey(nextTab as TTabKey)}
          styles={toTabsStyles(props.styles)}
          value={resolvedActiveTabKey as TabsValue | undefined}
        />
      </Column>
    );
  };

  const handlePickerChange: NonNullable<
    PickerProps<PickerCascaderItem<TData>>['onChange']
  > = (_nextPickerValue, pickerParams) => {
    if (pickerParams.reason !== 'select' || !activeTab || resolvedActiveTabKey === undefined) {
      return;
    }

    const nextValue = completePathFromColumn(
      activeTab.options,
      activeTabValue,
      pickerParams.columnIndex,
      pickerParams.value,
    );
    const nextDraftValue = {
      ...draftValue,
      [resolvedActiveTabKey]: nextValue,
    };

    setDraftValue(nextDraftValue);
    setMainValue(nextDraftValue);
    props.onChange?.(
      nextDraftValue,
      buildChangeParams<TData, TTabKey>(
        activeTab,
        resolvedActiveTabKey,
        activeTabIndex,
        nextValue,
        pickerParams.columnIndex,
        pickerParams.itemIndex,
      ),
    );
  };

  const handlePickerOk: NonNullable<
    PickerProps<PickerCascaderItem<TData>>['onOk']
  > = nextPickerValue => {
    if (!activeTab || resolvedActiveTabKey === undefined) {
      return;
    }

    const nextValue = normalizeCascadeValue(activeTab.options, nextPickerValue);
    const nextDraftValue = {
      ...draftValue,
      [resolvedActiveTabKey]: nextValue,
    };

    setDraftValue(nextDraftValue);
    setMainValue(nextDraftValue);
    props.onOk?.(
      nextDraftValue,
      buildOkParams<TData, TTabKey>(
        activeTab,
        resolvedActiveTabKey,
        activeTabIndex,
        nextValue,
      ),
    );
  };

  return (
    <PickerCore
      columns={columns}
      defaultOpen={props.defaultOpen}
      disabled={props.disabled}
      displayInputProps={props.displayInputProps}
      label={props.label}
      labelText={props.labelText}
      onCancel={props.onCancel}
      onChange={handlePickerChange}
      onOk={handlePickerOk}
      onOpenChange={props.onOpenChange}
      open={props.open}
      readonly={props.readonly}
      popupProps={{
        cancel: props.cancel,
        cancelText: props.cancelText,
        empty: props.empty,
        emptyText: props.emptyText,
        loading: props.loading,
        loadingIndicator: props.loadingIndicator,
        loadingIndicatorText: props.loadingIndicatorText,
        ok: props.ok,
        okDisabled: props.okDisabled,
        okText: props.okText,
        renderHeader: pickerRenderHeader,
        renderLabel: pickerRenderLabel,
        title: props.title,
        titleText: props.titleText,
      }}
      size={props.size}
      style={props.style}
      styles={toPickerStyles(props.styles)}
      value={resolvedActiveTabKey === undefined ? [] : activeTabValue}
    >
      {props.children}
    </PickerCore>
  );
}
