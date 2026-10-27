import React from 'react';
import { Button, Column, Empty, Icon, Text } from '@pennyspring/ui';

export const emptySlotsDemoTitle = '插槽组合（slots）';

export function EmptySlotsDemo() {
  return (
    <Column gap="normal">
      <Column gap="small">
        <Text color="tertiary" size="sm">icon + title + description + action：最常见组合</Text>
        <Empty
          size="small"
          titleText="还没有创建标签"
          descriptionText="标签用来给记录分组，报表里可以直接按标签筛选。"
          action={<Button size="small">新建标签</Button>}
        />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="sm">title + description：没有下一步动作时不要硬塞按钮</Text>
        <Empty
          size="small"
          titleText="搜索无结果"
          descriptionText="「咖啡」没有匹配记录，换个关键词试试。"
        />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="sm">文字链操作：筛选空用无底文字，避免出现第二个主色块</Text>
        <Empty
          size="small"
          titleText="「餐饮」没有记录"
          action={<Button size="small" type="text">清除筛选</Button>}
        />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="sm">自定义图标：节点自带语义色时不再套默认底板</Text>
        <Empty
          size="small"
          icon={<Icon icon="warning" size={20} color="error" />}
          titleText="同步失败，没有拉到数据"
          descriptionText="检查网络后重试，已记账的数据不会丢。"
          action={<Button size="small">重试</Button>}
        />
      </Column>
    </Column>
  );
}

export default EmptySlotsDemo;
