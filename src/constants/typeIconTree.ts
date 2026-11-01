import type { IconComponent } from '@pennyspring/ui';
import * as PhosphorIcons from 'phosphor-react-native';
import { DotsThreeCircleIcon } from 'phosphor-react-native';

import { PHOSPHOR_ICON_INFO_LIST } from './phosphorIconInfoList';

const FALLBACK_CATEGORY_LABEL = '未分类';
const PHOSPHOR_ICON_COMPONENT_SUFFIX = 'Icon';

type PhosphorIconInfo = (typeof PHOSPHOR_ICON_INFO_LIST)[number];

export type IconValue = string;
export type TypeIconComponent = IconComponent;

export interface TypeIconNode {
  value: IconValue;
  label: string;
  icon: TypeIconComponent;
}

export interface TypeIconGroupNode {
  key: string;
  label: string;
  children: readonly TypeIconNode[];
}

export interface PhosphorIconOption extends PhosphorIconInfo {
  label: string;
  primaryCategoryLabel: string;
}

function getPrimaryCategoryLabel(info: PhosphorIconInfo): string {
  return info.categoriesZh[0] ?? info.categories[0] ?? FALLBACK_CATEGORY_LABEL;
}

function isTypeIconComponent(value: unknown): value is TypeIconComponent {
  return typeof value === 'function';
}

export function getPhosphorIconComponent(
  pascalName: string,
): TypeIconComponent {
  const componentName = `${pascalName}${PHOSPHOR_ICON_COMPONENT_SUFFIX}`;
  const iconModule = PhosphorIcons as Record<string, unknown>;
  const iconComponent = iconModule[componentName];

  if (isTypeIconComponent(iconComponent)) {
    return iconComponent;
  }

  return DotsThreeCircleIcon;
}

const TYPE_ICON_CATEGORIES = Array.from(
  new Set(PHOSPHOR_ICON_INFO_LIST.map(getPrimaryCategoryLabel)),
);

export const PHOSPHOR_ICON_OPTIONS = PHOSPHOR_ICON_INFO_LIST.map(info => ({
  ...info,
  label: info.pascalName,
  primaryCategoryLabel: getPrimaryCategoryLabel(info),
})) satisfies readonly PhosphorIconOption[];

export const TYPE_ICON_TREE = TYPE_ICON_CATEGORIES.map(category => ({
  key: category,
  label: category,
  children: PHOSPHOR_ICON_OPTIONS.filter(
    info => info.primaryCategoryLabel === category,
  ).map(info => ({
    value: info.pascalName,
    label: info.label,
    icon: getPhosphorIconComponent(info.pascalName),
  })),
})) satisfies readonly TypeIconGroupNode[];

export const ICON_MAP = Object.fromEntries(
  PHOSPHOR_ICON_INFO_LIST.map(info => [
    info.pascalName,
    getPhosphorIconComponent(info.pascalName),
  ]),
) as Record<string, TypeIconComponent>;
