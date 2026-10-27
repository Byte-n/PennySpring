import { PickerCascader } from './Cascader';
import { PickerCore } from './PickerCore';

/** 滚轮选择器，附带级联轮盘子模式。 */
export const Picker = Object.assign(PickerCore, {
  Cascader: PickerCascader,
});
