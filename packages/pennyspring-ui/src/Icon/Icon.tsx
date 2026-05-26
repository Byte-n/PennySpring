import React from 'react';
import { useTheme } from '@pennyspring/theme';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BellIcon,
  CalendarIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckCircleIcon,
  CheckIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelSimpleIcon,
  GearSixIcon,
  HeartIcon,
  HouseIcon,
  InfoIcon,
  ImageSquareIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PencilSimpleIcon,
  PlusIcon,
  ShareNetworkIcon,
  StarIcon,
  TrashIcon,
  UploadSimpleIcon,
  UserIcon,
  WarningCircleIcon,
  XCircleIcon,
  XIcon,
} from 'phosphor-react-native';
import type { AliasToken } from '@pennyspring/theme';
import { useIconColor } from './useIconColor';
import type { IconComponent, IconName, IconProps, IconSize } from './types';

interface IconSizeConfig {
  value: (token: AliasToken) => number;
}

const ICON_SIZE_MAP: Record<Exclude<IconSize, number>, IconSizeConfig> = {
  small: { value: token => token.fontSizeSM },
  normal: { value: token => token.fontSize },
  large: { value: token => token.fontSizeLG },
};

const DEFAULT_ICON_MAP: Record<IconName, IconComponent> = {
  add: PlusIcon,
  'arrow-down': ArrowDownIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-up': ArrowUpIcon,
  calendar: CalendarIcon,
  'caret-down': CaretDownIcon,
  'caret-left': CaretLeftIcon,
  'caret-right': CaretRightIcon,
  'caret-up': CaretUpIcon,
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  close: XIcon,
  'close-circle': XCircleIcon,
  download: DownloadSimpleIcon,
  edit: PencilSimpleIcon,
  eye: EyeIcon,
  'eye-slash': EyeSlashIcon,
  filter: FunnelSimpleIcon,
  heart: HeartIcon,
  home: HouseIcon,
  info: InfoIcon,
  image: ImageSquareIcon,
  list: ListBulletsIcon,
  minus: MinusIcon,
  more: DotsThreeIcon,
  notification: BellIcon,
  plus: PlusIcon,
  search: MagnifyingGlassIcon,
  settings: GearSixIcon,
  share: ShareNetworkIcon,
  star: StarIcon,
  trash: TrashIcon,
  upload: UploadSimpleIcon,
  user: UserIcon,
  warning: WarningCircleIcon,
};

function resolveIcon(icon: IconName | IconComponent): IconComponent {
  if (typeof icon === 'string') {
    return DEFAULT_ICON_MAP[icon];
  }

  return icon;
}

function resolveSize(size: IconSize | undefined, token: AliasToken): number {
  if (typeof size === 'number') {
    return size;
  }

  const resolvedSize = size ?? 'normal';
  return ICON_SIZE_MAP[resolvedSize].value(token);
}

export function Icon({
  icon,
  size = 'normal',
  color,
  weight,
  duotoneColor,
  duotoneOpacity,
  mirrored,
  style,
  testID,
}: IconProps) {
  const { token } = useTheme();
  const IconComponent = resolveIcon(icon);
  const resolvedColor = useIconColor(color);
  const resolvedDuotoneColor = useIconColor(duotoneColor);

  return (
    <IconComponent
      color={resolvedColor}
      duotoneColor={resolvedDuotoneColor}
      duotoneOpacity={duotoneOpacity}
      mirrored={mirrored}
      size={resolveSize(size, token)}
      style={style}
      testID={testID}
      weight={weight}
    />
  );
}
