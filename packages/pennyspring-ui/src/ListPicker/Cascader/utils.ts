import React from 'react';
import type {
  ListPickerCascaderOption,
  ListPickerCascaderRemoveParams,
  ListPickerCascaderSelectParams,
  ListPickerCascaderValue,
} from '../types';
import type { ListPickerValue } from '../types';

export function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join(' ');
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }

  return '';
}

export function isLeafOption<TData>(
  option: ListPickerCascaderOption<TData>,
): boolean {
  return option.children === undefined || option.children.length === 0;
}

export function getPathOptions<TData>(
  options: Array<ListPickerCascaderOption<TData>>,
  value: ListPickerCascaderValue | undefined,
): Array<ListPickerCascaderOption<TData>> {
  const path: Array<ListPickerCascaderOption<TData>> = [];
  let currentOptions: Array<ListPickerCascaderOption<TData>> | undefined =
    options;

  for (const itemValue of value ?? []) {
    if (!currentOptions) {
      break;
    }

    const option: ListPickerCascaderOption<TData> | undefined =
      currentOptions.find(item => item.value === itemValue);

    if (!option) {
      break;
    }

    path.push(option);
    currentOptions = option.children;
  }

  return path;
}

export function normalizeValue<TData>(
  options: Array<ListPickerCascaderOption<TData>>,
  value: ListPickerCascaderValue | undefined,
): ListPickerCascaderValue {
  return getPathOptions(options, value).map(item => item.value);
}

export function getOptionsAtLevel<TData>(
  options: Array<ListPickerCascaderOption<TData>>,
  path: Array<ListPickerCascaderOption<TData>>,
  level: number,
): Array<ListPickerCascaderOption<TData>> {
  if (level <= 0) {
    return options;
  }

  return path[level - 1]?.children ?? [];
}

export function getVisibleLevelCount<TData>(
  path: Array<ListPickerCascaderOption<TData>>,
): number {
  const last = path[path.length - 1];

  if (last?.children && last.children.length > 0) {
    return path.length + 1;
  }

  return Math.max(path.length, 1);
}

export function clampLevel(level: number, maxLevel: number): number {
  if (level < 0) {
    return 0;
  }

  if (level >= maxLevel) {
    return maxLevel - 1;
  }

  return level;
}

export function getPathLabel<TData>(
  options: Array<ListPickerCascaderOption<TData>>,
  value: ListPickerCascaderValue | undefined,
): string {
  return getPathOptions(options, value)
    .map(item => item.labelText ?? extractText(item.label))
    .filter(Boolean)
    .join(' / ');
}

export function buildSelectParams<TData>(
  options: Array<ListPickerCascaderOption<TData>>,
  nextValue: ListPickerCascaderValue,
  option: ListPickerCascaderOption<TData>,
  level: number,
  optionIndex: number,
): ListPickerCascaderSelectParams<TData> {
  const path = getPathOptions(options, nextValue);

  return {
    reason: 'select',
    option,
    value: option.value,
    level,
    optionIndex,
    path,
    items: nextValue.map((_, index) => path[index]),
    isLeaf: isLeafOption(option),
  };
}

export function buildRemoveParams<TData>(
  options: Array<ListPickerCascaderOption<TData>>,
  currentValue: ListPickerCascaderValue,
  nextValue: ListPickerCascaderValue,
  removedLevel: number,
): ListPickerCascaderRemoveParams<TData> | undefined {
  const currentPath = getPathOptions(options, currentValue);
  const removedOption = currentPath[removedLevel];

  if (!removedOption) {
    return undefined;
  }

  const nextPath = getPathOptions(options, nextValue);
  const siblingOptions =
    removedLevel === 0
      ? options
      : (currentPath[removedLevel - 1]?.children ?? []);
  const optionIndex = siblingOptions.findIndex(
    item => item.value === removedOption.value,
  );

  return {
    reason: 'remove',
    option: removedOption,
    value: removedOption.value,
    level: removedLevel,
    optionIndex: optionIndex >= 0 ? optionIndex : 0,
    path: nextPath,
    items: nextValue.map((_, index) => nextPath[index]),
    isLeaf: isLeafOption(removedOption),
  };
}

export function getPathTagItems<TData>(
  options: Array<ListPickerCascaderOption<TData>>,
  value: ListPickerCascaderValue | undefined,
): Array<{ label: string; value: ListPickerValue }> {
  return getPathOptions(options, value)
    .map(item => ({
      label: item.labelText ?? extractText(item.label),
      value: item.value,
    }))
    .filter(item => item.label.length > 0);
}
