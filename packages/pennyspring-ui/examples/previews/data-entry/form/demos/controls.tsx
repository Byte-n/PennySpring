import React from 'react';
import {
  CalendarPicker,
  Checkbox,
  DateTimePicker,
  DisplayInput,
  Divider,
  Form,
  ImagePicker,
  Input,
  ListPicker,
  Picker,
  Radio,
  Segmented,
  Slider,
  Stepper,
  Switch,
  TagPicker,
  Text,
  Textarea,
} from '@pennyspring/ui';
import type { ImagePickerSelectedValue, TagPickerValue } from '@pennyspring/ui';

interface AllControlsValues {
  name: string;
  remark: string;
  display: string;
  avatar: ImagePickerSelectedValue | undefined;
  account: Array<string | number>;
  category: string;
  tags: TagPickerValue[];
  moment: Array<string | number>;
  date: number | undefined;
  notify: boolean;
  ratio: number;
  people: number;
  mode: string;
  preferences: string[];
  cycle: string;
}

const TypedForm = Form.infer<AllControlsValues>();

const INITIAL_VALUES: AllControlsValues = {
  name: '',
  remark: '',
  display: '',
  avatar: undefined,
  account: [],
  category: '',
  tags: [],
  moment: [],
  date: undefined,
  notify: false,
  ratio: 40,
  people: 1,
  mode: 'normal',
  preferences: [],
  cycle: 'month',
};

const accountColumns = [
  [
    { labelText: '现金', value: 'cash' },
    { labelText: '银行卡', value: 'bank' },
  ],
];

const categoryOptions = [
  { labelText: '餐饮', value: 'food' },
  { labelText: '交通', value: 'traffic' },
  { labelText: '购物', value: 'shopping' },
];

const tagOptions = [
  { label: '出差', value: 'trip' },
  { label: '报销', value: 'expense' },
  { label: '家庭', value: 'family' },
];

const modeOptions = [
  { labelText: '普通', value: 'normal' },
  { labelText: '严格', value: 'strict' },
];

const preferenceOptions = [
  { labelText: '记账', value: 'ledger' },
  { labelText: '报表', value: 'report' },
];

const cycleOptions = [
  { labelText: '按月', value: 'month' },
  { labelText: '按年', value: 'year' },
];

export function FormControlsDemo() {
  const [form] = TypedForm.useForm();

  return (
    <TypedForm form={form} initialValues={INITIAL_VALUES} labelMode="child">
      <Text color="description" size="sm">
        Form 级 labelMode="child"：label 由控件自身渲染，表单项不再显示独立
        label。Switch、Slider、Stepper、Segmented、Checkbox.Group、Radio.Group
        暂不支持子标签。
      </Text>
      <Divider>文本与数值</Divider>
      <TypedForm.Item labelText="名称" name="name">
        <Input placeholder="请输入名称" />
      </TypedForm.Item>
      <TypedForm.Item labelText="备注" name="remark">
        <Textarea maxLength={100} placeholder="请输入备注" showCount />
      </TypedForm.Item>
      <TypedForm.Item labelText="只读展示" name="display">
        <DisplayInput valueText="只读展示值" />
      </TypedForm.Item>
      <Divider>选择器</Divider>
      <TypedForm.Item labelText="账户" name="account">
        <Picker
          displayInputProps={{ display: 'block' }}
          columns={accountColumns}
        />
      </TypedForm.Item>
      <TypedForm.Item labelText="分类" name="category">
        <ListPicker
          displayInputProps={{ display: 'block' }}
          options={categoryOptions}
        />
      </TypedForm.Item>
      <TypedForm.Item labelText="标签" name="tags">
        <TagPicker
          displayInputProps={{ display: 'block' }}
          options={tagOptions}
        />
      </TypedForm.Item>
      <TypedForm.Item labelText="时间" name="moment">
        <DateTimePicker
          displayInputProps={{ display: 'block' }}
          precision="minute"
        />
      </TypedForm.Item>
      <TypedForm.Item labelText="日期" name="date">
        <CalendarPicker displayInputProps={{ display: 'block' }} />
      </TypedForm.Item>
      <TypedForm.Item labelText="图片" name="avatar">
        <ImagePicker displayInputProps={{ display: 'block' }} />
      </TypedForm.Item>
      <Divider>开关与选择</Divider>
      <TypedForm.Item labelText="通知" name="notify">
        <Switch />
      </TypedForm.Item>
      <TypedForm.Item labelText="额度比例" name="ratio">
        <Slider max={100} min={0} />
      </TypedForm.Item>
      <TypedForm.Item labelText="人数" name="people">
        <Stepper max={20} min={1} unitText="人" />
      </TypedForm.Item>
      <TypedForm.Item labelText="模式" name="mode">
        <Segmented block options={modeOptions} />
      </TypedForm.Item>
      <TypedForm.Item labelText="偏好" name="preferences">
        <Checkbox.Group options={preferenceOptions} />
      </TypedForm.Item>
      <TypedForm.Item labelText="周期" name="cycle">
        <Radio.Group options={cycleOptions} />
      </TypedForm.Item>
    </TypedForm>
  );
}

export default FormControlsDemo;
