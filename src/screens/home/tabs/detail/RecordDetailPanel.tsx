import React from 'react';
import { Row, Text, List, Button, Popup, Icon } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { ListItemProps } from '@pennyspring/ui';
import {
  amountColor,
  formatRecordTime,
  formatSignedAmount,
  type DetailRecordView,
} from './detailData';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import { useGlobalApi } from '../../../../stores/bookStore';
import * as Icons from 'phosphor-react-native';
import type { IconProps as PhosphorIconProps } from 'phosphor-react-native';

const useStyles = createUseSheetStyle(token => ({
  header: {
    paddingHorizontal: token.padding,
    paddingVertical: token.padding / 2,
  },
  actions: {
    gap: token.marginXS,
  },
  tagContainer: {
    flexWrap: 'wrap',
  },
}));

function buildItems(view: DetailRecordView, onImagePress: () => void, styles: ReturnType<typeof useStyles>): ListItemProps[] {
  const valueText = (text: string): ListItemProps['right'] => (
    <Text size="md" color="secondary">
      {text}
    </Text>
  );

  const typeDisplay = view.parentTypeName
    ? `${view.parentTypeName} > ${view.typeName}`
    : view.typeName;

  const IconComponent = view.iconValue
    ? (Icons[`${view.iconValue}Icon` as keyof typeof Icons] as React.ComponentType<PhosphorIconProps>)
    : null;

  const ParentIconComponent = view.parentIconValue
    ? (Icons[`${view.parentIconValue}Icon` as keyof typeof Icons] as React.ComponentType<PhosphorIconProps>)
    : null;

  const typeContent = (
    <Row align="center" gap={8}>
      {view.parentTypeName && ParentIconComponent && (
        <>
          <Icon icon={ParentIconComponent} size="small" color="secondary" />
          <Text size="md" color="secondary">
            {view.parentTypeName}
          </Text>
          <Text size="md" color="secondary">
            {'>'}
          </Text>
        </>
      )}
      {IconComponent && <Icon icon={IconComponent} size="small" color="secondary" />}
      <Text size="md" color="secondary">
        {view.parentTypeName ? view.typeName : typeDisplay}
      </Text>
    </Row>
  );

  const items: ListItemProps[] = [
    { titleText: '类型', right: typeContent },
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

  if (view.category === RECORD_TYPE_CATEGORY.transfer) {
    if (view.assetName && view.intoAssetName) {
      items.splice(2, 0, {
        titleText: '资产',
        right: valueText(`${view.assetName} → ${view.intoAssetName}`),
      });
    }
  } else {
    if (view.assetName) {
      items.splice(2, 0, { titleText: '资产', right: valueText(view.assetName) });
    }
  }

  if (view.record.remark) {
    items.push({ titleText: '备注', right: valueText(view.record.remark) });
  }

  if (view.tags.length > 0) {
    items.push({
      titleText: '标签',
      right: (
        <Row align="center" gap={8} style={styles.tagContainer}>
          {view.tags.map(tag => {
            const TagIconComponent = tag.icon
              ? (Icons[`${tag.icon}Icon` as keyof typeof Icons] as React.ComponentType<PhosphorIconProps>)
              : null;
            return (
              <Row key={tag.id} align="center" gap={4}>
                {TagIconComponent && <Icon icon={TagIconComponent} size="small" color="secondary" />}
                <Text size="md" color="secondary">
                  {tag.name}
                </Text>
              </Row>
            );
          })}
        </Row>
      ),
    });
  }

  if (view.imageCount > 0) {
    items.push({
      titleText: '图片',
      right: (
        <Button
          size="small"
          variant="text"
          icon="image"
          onPress={onImagePress}
        >
          {view.imageCount} 张
        </Button>
      ),
    });
  }

  return items;
}

interface RecordDetailPanelProps {
  view: DetailRecordView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (view: DetailRecordView) => void;
  onDelete: (view: DetailRecordView) => void;
}

export function RecordDetailPanel({
  view,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: RecordDetailPanelProps) {
  const styles = useStyles();
  const globalApi = useGlobalApi();
  const handleImagePress = async () => {
    if (!view) return;
    await globalApi.record.getDetailById(view.record.id, view.record.booksId);
    // TODO: 实现图片预览功能
  };

  return (
    <Popup.FloatingPanel
      open={open}
      onOpenChange={onOpenChange}
      position="bottom"
      renderHeader={() => (
        <Row align="center" justify="between" style={styles.header}>
          <Text size="lg" weight="semibold" color="heading">
            记录详情
          </Text>
          <Row align="center" style={styles.actions}>
            <Button
              size="small"
              variant="text"
              icon="edit"
              onPress={() => view && onEdit(view)}
            >
              编辑
            </Button>
            <Button
              size="small"
              variant="text"
              color="danger"
              icon="trash"
              onPress={() => view && onDelete(view)}
            >
              删除
            </Button>
          </Row>
        </Row>
      )}
    >
      {view ? <List items={buildItems(view, handleImagePress, styles)} /> : null}
    </Popup.FloatingPanel>
  );
}
