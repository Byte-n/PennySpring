import React, { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { Image, ImagePreview, Row, Text } from '@pennyspring/ui';
import { useMediaStore } from '../../../../media';
import { useRecordDetailStyles } from './recordDetailStyles';

const RECORD_IMAGE_HIT_SLOP = 6;

interface RecordImagesProps {
  recordId: number;
  imagePaths: readonly string[];
}

export function RecordImages({
  recordId,
  imagePaths,
}: RecordImagesProps): React.ReactElement {
  const styles = useRecordDetailStyles();
  const media = useMediaStore();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const images = useMemo(() => {
    if (media === null) {
      return [];
    }

    return imagePaths.map(ref => media.resolveSource(ref));
  }, [imagePaths, media]);

  useEffect(() => {
    setPreviewIndex(null);
  }, [recordId]);

  if (images.length === 0) {
    return (
      <Text size="sm" color="tertiary">
        {`${imagePaths.length} 张`}
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
