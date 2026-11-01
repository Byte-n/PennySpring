import React, { useLayoutEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRequest } from 'ahooks';
import { Button, Empty, Loading, Popup, Row, Text } from '@pennyspring/ui';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import { useBookStore, useGlobalApi } from '../../../../stores/bookStore';
import { RecordDetailContent } from './RecordDetailContent';
import { useRecordDetailStyles } from './recordDetailStyles';
import { buildDetailViews, type DetailRecordView } from './detailData';

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

interface RecordDetailPanelData {
  recordId: number;
  view: DetailRecordView;
  relatedViews: DetailRecordView[];
}

function toMap<T extends { id: number }>(rows: readonly T[]): Map<number, T> {
  return new Map(rows.map(row => [row.id, row]));
}

interface RecordDetailPanelProps {
  recordId: number | null;
  hidden?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (recordId: number) => void;
  onDelete: (recordId: number) => void;
}

export function RecordDetailPanel({
  recordId,
  hidden = false,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: RecordDetailPanelProps) {
  const styles = useRecordDetailStyles();
  const { height: viewportHeight } = useWindowDimensions();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const bookId = currentBook?.id;
  const { data, loading, error } = useRequest<RecordDetailPanelData | null, []>(
    async () => {
      if (recordId === null || !bookId) return null;

      const recordDetail = await globalApi.record.getDetailById(
        recordId,
        bookId,
      );
      const relatedDetails = await Promise.all(
        recordDetail.relatedRecordIds.map(relatedRecordId =>
          globalApi.record.getDetailById(relatedRecordId, bookId),
        ),
      );
      const details = [recordDetail, ...relatedDetails];
      const [types, assets, tags] = await Promise.all([
        globalApi.type.getAll(bookId),
        globalApi.asset.getByBook(bookId),
        globalApi.tag.getAll(bookId),
      ]);
      const imageCounts = new Map(
        details.map(detail => [detail.record.id, detail.imagePaths.length]),
      );
      const recordTags = new Map(
        details.map(detail => [detail.record.id, detail.tagIds]),
      );
      const tagMap = toMap(tags);
      const views = buildDetailViews(
        details.map(detail => detail.record),
        toMap(types),
        toMap(assets),
        imageCounts,
        tagMap,
        recordTags,
      ).map(view => ({
        ...view,
        imagePaths:
          details.find(detail => detail.record.id === view.record.id)
            ?.imagePaths ?? [],
      }));
      const viewsById = new Map(views.map(view => [view.record.id, view]));
      const view = viewsById.get(recordId);
      if (!view) return null;

      return {
        recordId,
        view,
        relatedViews: recordDetail.relatedRecordIds
          .map(relatedRecordId => viewsById.get(relatedRecordId))
          .filter(
            (related): related is DetailRecordView => related !== undefined,
          ),
      };
    },
    {
      ready: open && recordId !== null && Boolean(bookId),
      refreshDeps: [open, recordId, bookId, globalApi],
    },
  );
  const detailData = data?.recordId === recordId ? data : null;
  const view = detailData?.view ?? null;
  const relatedViews = detailData?.relatedViews ?? [];
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
              if (recordId !== null) {
                onDelete(recordId);
              }
            }}
          >
            删除
          </Button>
          <Button
            type="primary"
            style={styles.editButton}
            onPress={() => {
              if (recordId !== null) {
                onEdit(recordId);
              }
            }}
          >
            编辑记录
          </Button>
        </Row>
      )}
    >
      {loading ? (
        <Loading variant="block" text="加载详情" />
      ) : error ? (
        <Empty titleText="详情加载失败" descriptionText="请关闭后重试。" />
      ) : view ? (
        <RecordDetailContent
          view={view}
          relatedViews={relatedViews}
          hidden={hidden}
        />
      ) : null}
    </Popup.FloatingPanel>
  );
}
