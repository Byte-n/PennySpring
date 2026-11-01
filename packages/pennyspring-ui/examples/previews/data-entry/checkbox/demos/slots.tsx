import React from 'react';
import { Checkbox, Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import type { CheckboxGroupOption } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  topAligned: {
    alignItems: 'flex-start',
  },
  sharpIndicator: {
    borderRadius: token.borderRadiusXS,
  },
}));

const LABEL_PRIORITY_OPTIONS: CheckboxGroupOption[] = [
  { label: '保存记录', labelText: 'labelText 不生效', value: 'record' },
  { labelText: '存为模板', value: 'template' },
  { value: '删除这笔记录' },
];

export function CheckboxSlotsDemo() {
  const styles = useStyles();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        children 支持字符串 / 数字 / 自定义节点；字符串自动套
        Text，自定义节点自带内部间距
      </Text>
      <Checkbox defaultValue>保存记录</Checkbox>
      <Checkbox defaultValue>
        <Row gap="small">
          <Text>保存记录</Text>
          <Text color="tertiary" size="sm">
            默认账本
          </Text>
        </Row>
      </Checkbox>
      <Text color="tertiary" size="sm">
        长标签允许换行，styles.content 改 alignItems 让勾选框顶部对齐
      </Text>
      <Checkbox styles={{ content: styles.topAligned }}>
        导入后自动按备注关键词匹配分类，无法匹配的记录会留在「待分类」
      </Checkbox>
      <Text color="tertiary" size="sm">
        无标签时热区仍为 44，仅用于表格行首
      </Text>
      <Checkbox defaultValue />
      <Text color="tertiary" size="sm">
        styles.indicator / styles.label 仍可覆盖，尺寸与圆角由 size 决定
      </Text>
      <Checkbox defaultValue styles={{ indicator: styles.sharpIndicator }}>
        同一张卡连续记账
      </Checkbox>
      <Text color="tertiary" size="sm">
        Group 的 option 支持 label / labelText / value 与 option.disabled
      </Text>
      <Checkbox.Group options={LABEL_PRIORITY_OPTIONS} />
    </Column>
  );
}

export default CheckboxSlotsDemo;
