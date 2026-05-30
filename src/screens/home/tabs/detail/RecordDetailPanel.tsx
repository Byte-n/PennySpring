import React from 'react';
import { Row, Text, List, Button, Popup } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { ListItemProps } from '@pennyspring/ui';
import {
  amountColor,
  formatRecordTime,
  formatSignedAmount,
  type DetailRecordView,
} from './detailData';

const useStyles = createUseSheetStyle(token => ({
  header: {
    paddingHorizontal: token.padding,
    paddingVertical: token.padding / 2,
  },
  actions: {
    gap: token.marginXS,
  },
}));

function buildItems(view: DetailRecordView): ListItemProps[] {
  const valueText = (text: string): ListItemProps['right'] => (
    <Text size="md" color="secondary">
      {text}
    </Text>
  );

  const items: ListItemProps[] = [
    { titleText: '类目', right: valueText(view.typeName) },
    {
      titleText: '金额',
      right: (
        <Text size="md" weight="medium" color={amountColor(view.category)}>
          {formatSignedAmount(view.finalAmount, view.category)}
        </Text>
      ),
    },
    { titleText: '时间', right: valueText(formatRecordTime(view.recordTime)) },
  ];

  if (view.assetName) {
    items.splice(1, 0, { titleText: '账户', right: valueText(view.assetName) });
  }
  if (view.record.remark) {
    items.push({ titleText: '备注', right: valueText(view.record.remark) });
  }

  return items;
}

interface RecordDetailPanelProps {
  view: DetailRecordView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (view: DetailRecordView) => void;
}

export function RecordDetailPanel({
  view,
  open,
  onOpenChange,
  onDelete,
}: RecordDetailPanelProps) {
  const styles = useStyles();

  return (
    <Popup.FloatingPanel
      open={open}
      onOpenChange={onOpenChange}
      position="bottom"
      renderHeader={() => (
        <Row align="center" justify="between" style={styles.header}>
          <Text size="lg" weight="semibold" color="heading">
            {view?.typeName ?? '记录详情'}
          </Text>
          <Row align="center" style={styles.actions}>
            {/* TODO: AddRecord 暂不支持编辑既有记录，编辑入口先占位置灰 */}
            <Button size="small" variant="text" icon="edit" disabled>
              编辑
            </Button>
            <Button
              size="small"
              variant="text"
              danger
              icon="trash"
              onPress={() => view && onDelete(view)}
            >
              删除
            </Button>
          </Row>
        </Row>
      )}
    >
      {view ? <List items={buildItems(view)} /> : null}
    </Popup.FloatingPanel>
  );
}
