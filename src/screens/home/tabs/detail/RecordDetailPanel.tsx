import React, { useLayoutEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Button, Popup, Row, Text } from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import { RecordDetailContent } from './RecordDetailContent';
import { useRecordDetailStyles } from './recordDetailStyles';
import type { DetailRecordView } from './detailData';

const CLOSE_HIT_SLOP = 6;
const DEFAULT_PANEL_HEIGHT_RATIO = 0.6;
const TRANSFER_PANEL_HEIGHT_RATIO = 0.66;
const RELATED_PANEL_HEIGHT_RATIO = 0.62;

function getPreferredPanelRatio(
  view: DetailRecordView | null,
  relatedCount: number,
): number {
  if (!view) {
    return DEFAULT_PANEL_HEIGHT_RATIO;
  }

  if (
    view.category === RECORD_TYPE_CATEGORY.transfer &&
    view.record.charge > 0
  ) {
    return TRANSFER_PANEL_HEIGHT_RATIO;
  }

  if (view.category === RECORD_TYPE_CATEGORY.income && relatedCount > 0) {
    return RELATED_PANEL_HEIGHT_RATIO;
  }

  return DEFAULT_PANEL_HEIGHT_RATIO;
}

interface RecordDetailPanelProps {
  view: DetailRecordView | null;
  relatedViews: readonly DetailRecordView[];
  hidden?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (view: DetailRecordView) => void;
  onDelete: (view: DetailRecordView) => void;
}

export function RecordDetailPanel({
  view,
  relatedViews,
  hidden = false,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: RecordDetailPanelProps) {
  const styles = useRecordDetailStyles();
  const { height: viewportHeight } = useWindowDimensions();
  const preferredRatio = getPreferredPanelRatio(view, relatedViews.length);
  const [panelHeight, setPanelHeight] = useState(
    () => viewportHeight * preferredRatio,
  );

  useLayoutEffect(() => {
    if (view) {
      setPanelHeight(viewportHeight * preferredRatio);
    }
  }, [preferredRatio, view, viewportHeight]);

  return (
    <Popup.FloatingPanel
      bodyScrollable
      scrollEnabled
      open={open}
      onOpenChange={onOpenChange}
      onChange={height => setPanelHeight(height)}
      position="bottom"
      value={panelHeight}
      minHeight="42%"
      maxHeight="80%"
      styles={{
        header: styles.panelHeader,
        handle: styles.panelHandle,
        panelBody: styles.panelBody,
        footer: styles.panelFooter,
      }}
      renderHeader={({ cancel }) => (
        <Row align="center" justify="between" style={styles.headerRow}>
          <Text
            size="lg"
            weight="semibold"
            color="heading"
            style={styles.headerTitle}
          >
            记录详情
          </Text>
          <Button
            type="text"
            size="small"
            shape="circle"
            icon="close"
            iconProps={{ color: 'tertiary' }}
            hitSlop={CLOSE_HIT_SLOP}
            onPress={cancel}
          />
        </Row>
      )}
      renderFooter={() => (
        <Row align="center" gap="small" style={styles.footerRow}>
          <Button
            type="text"
            color="danger"
            size="small"
            icon="trash"
            style={styles.deleteButton}
            onPress={() => {
              if (view) {
                onDelete(view);
              }
            }}
          >
            删除
          </Button>
          <Button
            type="primary"
            style={styles.editButton}
            onPress={() => {
              if (view) {
                onEdit(view);
              }
            }}
          >
            编辑记录
          </Button>
        </Row>
      )}
    >
      {view ? (
        <RecordDetailContent
          view={view}
          relatedViews={relatedViews}
          hidden={hidden}
        />
      ) : null}
    </Popup.FloatingPanel>
  );
}
