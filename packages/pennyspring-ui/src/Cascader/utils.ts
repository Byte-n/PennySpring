import type {
  CascaderChangeParams,
  CascaderOption,
  CascaderValue,
} from './types';

export function getPathOptions<TData>(
  options: Array<CascaderOption<TData>>,
  value: CascaderValue[] | undefined,
): Array<CascaderOption<TData>> {
  const path: Array<CascaderOption<TData>> = [];
  let currentOptions: Array<CascaderOption<TData>> | undefined = options;

  for (const itemValue of value ?? []) {
    if (!currentOptions) {
      break;
    }

    const option: CascaderOption<TData> | undefined = currentOptions.find(
      item => item.value === itemValue,
    );

    if (!option) {
      break;
    }

    path.push(option);
    currentOptions = option.children;
  }

  return path;
}

export function normalizeValue<TData>(
  options: Array<CascaderOption<TData>>,
  value: CascaderValue[] | undefined,
): CascaderValue[] {
  return getPathOptions(options, value).map(item => item.value);
}

export function getOptionsAtLevel<TData>(
  options: Array<CascaderOption<TData>>,
  path: Array<CascaderOption<TData>>,
  level: number,
): Array<CascaderOption<TData>> {
  if (level <= 0) {
    return options;
  }

  return path[level - 1]?.children ?? [];
}

export function getVisibleLevelCount<TData>(
  path: Array<CascaderOption<TData>>,
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

export function buildChangeParams<TData>(
  options: Array<CascaderOption<TData>>,
  nextValue: CascaderValue[],
  option: CascaderOption<TData>,
  level: number,
  optionIndex: number,
): CascaderChangeParams<TData> {
  const path = getPathOptions(options, nextValue);
  const isLeaf = !(option.children && option.children.length > 0);

  return {
    option,
    value: option.value,
    level,
    optionIndex,
    path,
    items: nextValue.map((_, index) => path[index]),
    isLeaf,
  };
}
