import React, { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { useRequest } from 'ahooks';
import { Image, ImagePreview, Row, Text } from '@pennyspring/ui';
import { useMediaStore } from '../../../../media';
import { useGlobalApi } from '../../../../stores/bookStore';
import { useRecordDetailStyles } from './recordDetailStyles';

const RECORD_IMAGE_HIT_SLOP = 6;

interface RecordImagesProps {
  recordId: number;
  booksId: number;
  imageCount: number;
}

export function RecordImages({
  recordId,
  booksId,
  imageCount,
}: RecordImagesProps): React.ReactElement {
  const styles = useRecordDetailStyles();
  const globalApi = useGlobalApi();
  const media = useMediaStore();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const { data, error, loading } = useRequest(
    () => globalApi.record.getDetailById(recordId, booksId),
    { refreshDeps: [recordId, booksId, globalApi] },
  );
  const images = useMemo(() => {
    if (data === undefined || data.record.id !== recordId || media === null) {
      return [];
    }

    return data.imagePaths.map(ref => media.resolveSource(ref));
  }, [data, media, recordId]);

  useEffect(() => {
    setPreviewIndex(null);
  }, [recordId]);

  if (images.length === 0) {
    return (
      <Text size="sm" color="tertiary">
        {!loading && error ? '图片加载失败' : `${imageCount} 张`}
      </Text>
    );
  }

  return (
    <>
      <Row wrap gap="small">
        {images.map((image, index) => (
          <Pressable
            key={`${image.uri}-${index}`}
            hitSlop={RECORD_IMAGE_HIT_SLOP}
            onPress={() => setPreviewIndex(index)}
            testID={`record-detail-image-${index}`}
          >
            <Image
              preview={false}
              radius="small"
              src={image}
              style={styles.imageThumb}
            />
          </Pressable>
        ))}
      </Row>
      <ImagePreview
        images={images}
        index={previewIndex ?? 0}
        onIndexChange={setPreviewIndex}
        onOpenChange={open => {
          if (!open) {
            setPreviewIndex(null);
          }
        }}
        open={previewIndex !== null}
      />
    </>
  );
}
