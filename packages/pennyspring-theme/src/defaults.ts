import { Platform } from 'react-native';
import type { SeedToken } from './types';

export const defaultSeedToken: SeedToken = {
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#1677ff',
  colorTextBase: '',
  colorBgBase: '',
  colorLink: '',
  // RN 下使用系统字体；CSS 字体栈与 Emoji 字体在 RN 中无效
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }) as string,
  fontFamilyCode: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Menlo',
  }) as string,
  // 移动端正文最小 16（iOS HIG / Material）
  fontSize: 16,
  fontWeight: 400,
  lineWidth: 1,
  // 现代移动端 UI 基准圆角：内容卡片 12，浮层经 genRadius 派生至 16
  borderRadius: 12,
  sizeUnit: 4,
  sizeStep: 4,
  sizePopupArrow: 16,
  // 守住 Apple HIG 44×44 触达区底线
  controlHeight: 44,
  zIndexBase: 0,
  zIndexPopupBase: 1000,
  opacityImage: 1,
  motionUnit: 0.1,
  motionBase: 0,
  motionEaseOutCirc: [0.08, 0.82, 0.17, 1],
  motionEaseInOutCirc: [0.78, 0.14, 0.15, 0.86],
  motionEaseInOut: [0.645, 0.045, 0.355, 1],
  motionEaseOutBack: [0.12, 0.4, 0.29, 1.46],
  motionEaseInBack: [0.71, -0.46, 0.88, 0.6],
  motionEaseInQuint: [0.755, 0.05, 0.855, 0.06],
  motionEaseOutQuint: [0.23, 1, 0.32, 1],
  motionEaseOut: [0.215, 0.61, 0.355, 1],
  wireframe: false,
  motion: true,
  // PresetColorType fields
  blue: '#1677FF',
  purple: '#722ED1',
  cyan: '#13C2C2',
  green: '#52C41A',
  magenta: '#EB2F96',
  pink: '#EB2F96',
  red: '#F5222D',
  orange: '#FA8C16',
  yellow: '#FADB14',
  volcano: '#FA541C',
  geekblue: '#2F54EB',
  gold: '#FAAD14',
  lime: '#A0D911',
};
