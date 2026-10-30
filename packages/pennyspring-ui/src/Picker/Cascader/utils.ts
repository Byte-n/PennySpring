import type { ReactNode } from 'react';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerValue,
} from '../types';
import type {
  PickerCascaderChangeParams,
  PickerCascaderOkParams,
  PickerCascaderOption,
  PickerCascaderTab,
  PickerCascaderTabKey,
  PickerCascaderValue,
} from '../types';

export type PickerCascaderItem<TData> = PickerColumnItemData<PickerValue, TData>;

export function toPickerColumn<TData>(
  options: Array<PickerCascaderOption<TData>>,
): PickerColumn<PickerCascaderItem<TData>> {
  return options.map(option => ({
    labelText: option.labelText,
    label: option.label,
    value: option.value,
    disabled: option.disabled,
  }));
}

export function findNodeByPath<TData>(
  options: Array<PickerCascaderOption<TData>>,
  path: PickerValue[],
): PickerCascaderOption<TData> | undefined {
  let currentOptions: Array<PickerCascaderOption<TData>> | undefined = options;
  let node: PickerCascaderOption<TData> | undefined;

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

export function getPathOptions<TData>(
  options: Array<PickerCascaderOption<TData>>,
  path: PickerValue[],
): Array<PickerCascaderOption<TData>> {
  const result: Array<PickerCascaderOption<TData>> = [];
  let currentOptions: Array<PickerCascaderOption<TData>> | undefined = options;

  for (const value of path) {
    if (!currentOptions) {
      break;
    }

    const node: PickerCascaderOption<TData> | undefined = currentOptions.find(
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

export function getOptionsForPath<TData>(
  options: Array<PickerCascaderOption<TData>>,
  path: PickerValue[],
): Array<Array<PickerCascaderOption<TData>>> {
  const layers: Array<Array<PickerCascaderOption<TData>>> = [];
  let currentOptions: Array<PickerCascaderOption<TData>> | undefined = options;

  for (let index = 0; index < path.length; index += 1) {
    if (!currentOptions || currentOptions.length === 0) {
      return layers;
    }

    layers.push(currentOptions);
    const nextOptions: Array<PickerCascaderOption<TData>> | undefined = currentOptions.find(
      option => option.value === path[index],
    )?.children;

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

export function optionsToColumns<TData>(
  options: Array<PickerCascaderOption<TData>>,
  path: PickerValue[],
): Array<PickerColumn<PickerCascaderItem<TData>>> {
  return getOptionsForPath(options, path).map(toPickerColumn);
}

export function completePathFromColumn<TData>(
  options: Array<PickerCascaderOption<TData>>,
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

export function normalizeCascadeValue<TData>(
  options: Array<PickerCascaderOption<TData>>,
  value: PickerValue[] | undefined,
): PickerValue[] {
  const normalized: PickerValue[] = [];
  let currentOptions: Array<PickerCascaderOption<TData>> | undefined = options;

  for (const item of value ?? []) {
    if (!currentOptions) {
      break;
    }

    const node: PickerCascaderOption<TData> | undefined = currentOptions.find(
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

export function normalizeTabValue<
  TData,
  TTabKey extends PickerCascaderTabKey,
>(
  tabs: Array<PickerCascaderTab<TData, TTabKey>>,
  value: PickerCascaderValue<TTabKey> | undefined,
): PickerCascaderValue<TTabKey> {
  const normalized = {} as PickerCascaderValue<TTabKey>;

  for (const tab of tabs) {
    normalized[tab.tabKey] = normalizeCascadeValue(tab.options, value?.[tab.tabKey]);
  }

  return normalized;
}

export function getTabLabel<TData, TTabKey extends PickerCascaderTabKey>(
  tab: PickerCascaderTab<TData, TTabKey>,
): ReactNode {
  if (tab.label !== undefined) {
    return tab.label;
  }

  if (tab.labelText !== undefined && tab.labelText !== '') {
    return tab.labelText;
  }

  return `选项 ${tab.tabKey}`;
}

export function isTabDisabled<TData, TTabKey extends PickerCascaderTabKey>(
  tab: PickerCascaderTab<TData, TTabKey>,
): boolean {
  return tab.disabled === true
    || tab.options.length === 0
    || tab.options.every(item => item.disabled === true);
}

export function getInitialActiveTabKey<TData, TTabKey extends PickerCascaderTabKey>(
  tabs: Array<PickerCascaderTab<TData, TTabKey>>,
): TTabKey | undefined {
  const enabledTab = tabs.find(tab => !isTabDisabled(tab));
  return enabledTab?.tabKey ?? tabs[0]?.tabKey;
}

function getFirstEnabledTabIndex<TData, TTabKey extends PickerCascaderTabKey>(
  tabs: Array<PickerCascaderTab<TData, TTabKey>>,
): number {
  return tabs.findIndex(tab => !isTabDisabled(tab));
}

export function getActiveTabIndex<TData, TTabKey extends PickerCascaderTabKey>(
  tabs: Array<PickerCascaderTab<TData, TTabKey>>,
  activeTabKey: TTabKey | undefined,
): number {
  if (tabs.length === 0) {
    return 0;
  }

  const activeIndex = tabs.findIndex(tab => tab.tabKey === activeTabKey);
  if (activeIndex >= 0) {
    return activeIndex;
  }

  const firstEnabledIndex = getFirstEnabledTabIndex(tabs);
  return firstEnabledIndex >= 0 ? firstEnabledIndex : 0;
}

export function getActiveTab<TData, TTabKey extends PickerCascaderTabKey>(
  tabs: Array<PickerCascaderTab<TData, TTabKey>>,
  activeTabKey: TTabKey | undefined,
): PickerCascaderTab<TData, TTabKey> | undefined {
  const activeTab = tabs.find(tab => tab.tabKey === activeTabKey);
  if (activeTab) {
    return activeTab;
  }

  return tabs.find(tab => !isTabDisabled(tab)) ?? tabs[0];
}

export function buildOkParams<TData, TTabKey extends PickerCascaderTabKey>(
  tab: PickerCascaderTab<TData, TTabKey>,
  tabKey: TTabKey,
  tabIndex: number,
  value: PickerValue[],
): PickerCascaderOkParams<TData, TTabKey> {
  const path = getPathOptions(tab.options, value);

  return {
    tabKey,
    tabIndex,
    tab,
    path,
    items: value.map((_, index) => path[index]),
  };
}

export function buildChangeParams<TData, TTabKey extends PickerCascaderTabKey>(
  tab: PickerCascaderTab<TData, TTabKey>,
  tabKey: TTabKey,
  tabIndex: number,
  nextValue: PickerValue[],
  columnIndex: number,
  itemIndex: number,
): PickerCascaderChangeParams<TData, TTabKey> {
  const path = getPathOptions(tab.options, nextValue);
  const changedItem = path[columnIndex] ?? path[path.length - 1];

  return {
    tabKey,
    tabIndex,
    tab,
    columnIndex,
    itemIndex,
    value: nextValue[columnIndex] ?? changedItem?.value ?? '',
    item: changedItem as PickerCascaderOption<TData>,
    path,
    items: nextValue.map((_, index) => path[index]),
  };
}
