import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Picker } from '../Picker';
import { Tabs } from '../Tabs';
import { useControllableValue } from '../_hooks';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerPopupProps,
  PickerValue,
} from '../Picker';
import type {
  TabsItem,
  TabsValue,
} from '../Tabs';
import type {
  CascadePickerChangeParams,
  CascadePickerOkParams,
  CascadePickerOption,
  CascadePickerProps,
  CascadePickerTab,
  CascadePickerTabKey,
  CascadePickerValue,
} from './types';

type CascadePickerItem<TData> = PickerColumnItemData<PickerValue, TData>;

function toPickerColumn<TData>(
  options: Array<CascadePickerOption<TData>>,
): PickerColumn<CascadePickerItem<TData>> {
  return options.map(option => ({
    labelText: option.labelText,
    label: option.label,
    value: option.value,
    disabled: option.disabled,
  }));
}

function findChildOptions<TData>(
  options: Array<CascadePickerOption<TData>>,
  parentValue: PickerValue,
): Array<CascadePickerOption<TData>> | undefined {
  const parent = options.find(option => option.value === parentValue);
  return parent?.children;
}

function getOptionsForPath<TData>(
  options: Array<CascadePickerOption<TData>>,
  path: PickerValue[],
): Array<Array<CascadePickerOption<TData>>> {
  const layers: Array<Array<CascadePickerOption<TData>>> = [];
  let currentOptions: Array<CascadePickerOption<TData>> | undefined = options;

  for (let index = 0; index < path.length; index += 1) {
    if (!currentOptions || currentOptions.length === 0) {
      return layers;
    }

    layers.push(currentOptions);
    const selectedValue = path[index];
    const nextOptions: Array<CascadePickerOption<TData>> | undefined = findChildOptions(
      currentOptions,
      selectedValue,
    );

    if (!nextOptions || nextOptions.length === 0) {
      return layers;
    }

    currentOptions = nextOptions;
  }

  if (currentOptions && currentOptions.length > 0) {
    layers.push(currentOptions);
  }

  return layers;
}

function optionsToColumns<TData>(
  options: Array<CascadePickerOption<TData>>,
  path: PickerValue[],
): Array<PickerColumn<CascadePickerItem<TData>>> {
  const layers = getOptionsForPath(options, path);
  return layers.map(toPickerColumn);
}

function findNodeByPath<TData>(
  options: Array<CascadePickerOption<TData>>,
  path: PickerValue[],
): CascadePickerOption<TData> | undefined {
  let currentOptions: Array<CascadePickerOption<TData>> | undefined = options;
  let node: CascadePickerOption<TData> | undefined;

  for (const value of path) {
    if (!currentOptions) {
      return undefined;
    }

    node = currentOptions.find(option => option.value === value);

    if (!node) {
      return undefined;
    }

    currentOptions = node.children;
  }

  return node;
}

function getPathOptions<TData>(
  options: Array<CascadePickerOption<TData>>,
  path: PickerValue[],
): Array<CascadePickerOption<TData>> {
  const result: Array<CascadePickerOption<TData>> = [];
  let currentOptions: Array<CascadePickerOption<TData>> | undefined = options;

  for (const value of path) {
    if (!currentOptions) {
      break;
    }

    const node: CascadePickerOption<TData> | undefined = currentOptions.find(
      option => option.value === value,
    );

    if (!node) {
      break;
    }

    result.push(node);
    currentOptions = node.children;
  }

  return result;
}

function completePathFromColumn<TData>(
  options: Array<CascadePickerOption<TData>>,
  previousValue: PickerValue[],
  columnIndex: number,
  nextValue: PickerValue,
): PickerValue[] {
  const prefix = previousValue.slice(0, columnIndex);
  const path: PickerValue[] = [...prefix, nextValue];
  let currentNode = findNodeByPath(options, path);

  while (currentNode?.children && currentNode.children.length > 0) {
    const firstEnabled = currentNode.children.find(child => !child.disabled);

    if (!firstEnabled) {
      break;
    }

    path.push(firstEnabled.value);
    currentNode = firstEnabled;
  }

  return path;
}

function normalizeCascadeValue<TData>(
  options: Array<CascadePickerOption<TData>>,
  value: PickerValue[] | undefined,
): PickerValue[] {
  const normalized: PickerValue[] = [];
  let currentOptions: Array<CascadePickerOption<TData>> | undefined = options;

  for (const item of value ?? []) {
    if (!currentOptions) {
      break;
    }

    const node: CascadePickerOption<TData> | undefined = currentOptions.find(
      option => option.value === item,
    );

    normalized.push(item);

    if (!node) {
      break;
    }

    currentOptions = node.children;
  }

  return normalized;
}

function normalizeTabValue<TData, TTabKey extends CascadePickerTabKey>(
  tabs: Array<CascadePickerTab<TData, TTabKey>>,
  value: CascadePickerValue<TTabKey> | undefined,
): CascadePickerValue<TTabKey> {
  const normalized = {} as CascadePickerValue<TTabKey>;

  for (const tab of tabs) {
    normalized[tab.tabKey] = normalizeCascadeValue(tab.options, value?.[tab.tabKey]);
  }

  return normalized;
}

function getTabLabel<TData>(
  tab: CascadePickerTab<TData, CascadePickerTabKey>,
): string | number | React.ReactNode {
  if (tab.label !== undefined) {
    return tab.label;
  }

  if (tab.labelText !== undefined && tab.labelText !== '') {
    return tab.labelText;
  }

  return `Tab ${tab.tabKey}`;
}

function isTabDisabled<TData, TTabKey extends CascadePickerTabKey>(
  tab: CascadePickerTab<TData, TTabKey>,
): boolean {
  return tab.disabled === true
    || tab.options.length === 0
    || tab.options.every(item => item.disabled === true);
}

function getInitialActiveTabKey<TData, TTabKey extends CascadePickerTabKey>(
  tabs: Array<CascadePickerTab<TData, TTabKey>>,
): TTabKey | undefined {
  const enabledTab = tabs.find(tab => !isTabDisabled(tab));
  return enabledTab?.tabKey ?? tabs[0]?.tabKey;
}

function getActiveTabIndex<TData, TTabKey extends CascadePickerTabKey>(
  tabs: Array<CascadePickerTab<TData, TTabKey>>,
  activeTabKey: TTabKey | undefined,
): number {
  if (tabs.length === 0) {
    return 0;
  }

  const activeIndex = tabs.findIndex(tab => tab.tabKey === activeTabKey);
  if (activeIndex >= 0) {
    return activeIndex;
  }

  return tabs.findIndex(tab => !isTabDisabled(tab)) >= 0
    ? tabs.findIndex(tab => !isTabDisabled(tab))
    : 0;
}

function getActiveTab<TData, TTabKey extends CascadePickerTabKey>(
  tabs: Array<CascadePickerTab<TData, TTabKey>>,
  activeTabKey: TTabKey | undefined,
): CascadePickerTab<TData, TTabKey> | undefined {
  const activeTab = tabs.find(tab => tab.tabKey === activeTabKey);
  if (activeTab) {
    return activeTab;
  }

  return tabs.find(tab => !isTabDisabled(tab)) ?? tabs[0];
}

function buildTabItems<TData, TTabKey extends CascadePickerTabKey>(
  tabs: Array<CascadePickerTab<TData, TTabKey>>,
): Array<TabsItem> {
  return tabs.map(tab => ({
    value: tab.tabKey,
    label: getTabLabel(tab),
    disabled: isTabDisabled(tab),
  }));
}

function buildOkParams<TData, TTabKey extends CascadePickerTabKey>(
  tab: CascadePickerTab<TData, TTabKey>,
  tabKey: TTabKey,
  tabIndex: number,
  value: PickerValue[],
): CascadePickerOkParams<TData, TTabKey> {
  const path = getPathOptions(tab.options, value);

  return {
    tabKey,
    tabIndex,
    tab,
    path,
    items: value.map((_, index) => path[index]),
  };
}

function buildChangeParams<TData, TTabKey extends CascadePickerTabKey>(
  tab: CascadePickerTab<TData, TTabKey>,
  tabKey: TTabKey,
  tabIndex: number,
  nextValue: PickerValue[],
  columnIndex: number,
  itemIndex: number,
): CascadePickerChangeParams<TData, TTabKey> {
  const path = getPathOptions(tab.options, nextValue);
  const changedItem = path[columnIndex] ?? path[path.length - 1];

  return {
    tabKey,
    tabIndex,
    tab,
    columnIndex,
    itemIndex,
    value: nextValue[columnIndex] ?? changedItem?.value ?? '',
    item: changedItem!,
    path,
    items: nextValue.map((_, index) => path[index]),
  };
}

export function CascadePicker<TData = unknown, TTabKey extends CascadePickerTabKey = string>(
  props: CascadePickerProps<TData, TTabKey>,
) {
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
    ? (item: PickerColumnItemData, columnIndex: number, itemIndex: number) => {
        const layer = layerOptionsForLabel[columnIndex];
        const originalOption = layer?.[itemIndex];

        if (!originalOption) {
          return item.label ?? item.labelText;
        }

        return renderLabel(originalOption);
      }
    : undefined;

  const pickerRenderHeader: NonNullable<
    PickerPopupProps<CascadePickerItem<TData>>['renderHeader']
  > = ({ header }) => {
    const tabItems = buildTabItems(tabs);

    return (
      <View>
        {header}
        <Tabs
          block
          items={tabItems}
          layout="scroll"
          onChange={nextTab => setActiveTabKey(nextTab as TTabKey)}
          style={props.styles?.tabs}
          value={resolvedActiveTabKey as TabsValue | undefined}
        />
      </View>
    );
  };

  return (
    <Picker
      columns={columns}
      defaultOpen={props.defaultOpen}
      disabled={props.disabled}
      displayInputProps={props.displayInputProps}
      onCancel={props.onCancel}
      onChange={(_nextPickerValue, pickerParams) => {
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
          buildChangeParams(
            activeTab,
            resolvedActiveTabKey,
            activeTabIndex,
            nextValue,
            pickerParams.columnIndex,
            pickerParams.itemIndex,
          ),
        );
      }}
      onOk={nextPickerValue => {
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
          buildOkParams(
            activeTab,
            resolvedActiveTabKey,
            activeTabIndex,
            nextValue,
          ),
        );
      }}
      onOpenChange={props.onOpenChange}
      open={props.open}
      placeholder={props.placeholder}
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
      style={props.style}
      styles={props.styles && {
        trigger: props.styles.trigger,
        input: props.styles.input,
        popup: props.styles.popup,
        panel: props.styles.panel,
      }}
      value={resolvedActiveTabKey === undefined ? [] : activeTabValue}
    >
      {props.children}
    </Picker>
  );
}
