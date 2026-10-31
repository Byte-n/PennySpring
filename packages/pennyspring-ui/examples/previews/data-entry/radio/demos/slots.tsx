import React from 'react';
import { Column, Radio, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import type { RadioGroupOption } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  topAligned: {
    alignItems: 'flex-start',
  },
  spaciousRing: {
    marginRight: token.marginXXS,
  },
}));

const LABEL_PRIORITY_OPTIONS: RadioGroupOption[] = [
  { value: 'record', label: '保存记录', labelText: 'labelText 不生效' },
  { value: 'template', labelText: '存为模板' },
  { value: 'delete' },
];

export function RadioSlotsDemo() {
  const styles = useStyles();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        children 支持字符串 / 数字 / 自定义节点；字符串自动套 Text，自定义节点自带内部间距
      </Text>
      <Radio defaultValue>保存记录</Radio>
      <Radio defaultValue>
        <Row gap="small">
          <Text>保存记录</Text>
          <Text color="tertiary" size="sm">默认账本</Text>
        </Row>
      </Radio>
      <Text color="tertiary" size="sm">
        长标签换行时外圈顶部对齐：styles.content 改 alignItems
      </Text>
      <Radio styles={{ content: styles.topAligned }}>
        按备注关键词匹配分类，无法匹配的记录会进入「待分类」
      </Radio>
      <Text color="tertiary" size="sm">
        无标签时热区仍为行高，仅用于表格行首
      </Text>
      <Radio defaultValue />
      <Text color="tertiary" size="sm">
        styles.control / styles.indicator / styles.label 只调外边距与原位覆盖，不改尺寸与 2px 描边
      </Text>
      <Radio defaultValue styles={{ control: styles.spaciousRing }}>
        同一张卡连续记账
      </Radio>
      <Text color="tertiary" size="sm">
        Group 的 option 支持 label / labelText / value 与 option.disabled
      </Text>
      <Radio.Group direction="vertical" options={LABEL_PRIORITY_OPTIONS} defaultValue="template" />
    </Column>
  );
}

export default RadioSlotsDemo;
