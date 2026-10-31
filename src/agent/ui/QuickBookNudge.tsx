import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Column,
  Image,
  ImagePreview,
  Row,
  Text,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import { XIcon } from 'phosphor-react-native';

import type { QuickBookImage } from '../../features/quickBook/types';

const NUDGE_Z_INDEX = 10;
const NUDGE_THUMB_SIZE = 36;
const NUDGE_IMAGE_HIT_SLOP = 4;

const useStyles = createUseSheetStyle<{ bottom: number }>((token, options) => ({
  root: {
    bottom: options.bottom,
    left: token.padding,
    position: 'absolute',
    // 让出右下角悬浮按钮列，避免遮挡助手/快捷记账/新增入口。
    right: token.controlHeight + token.paddingLG,
    zIndex: NUDGE_Z_INDEX,
  },
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    gap: token.marginSM,
    padding: token.paddingSM,
  },
  thumbnail: {
    height: NUDGE_THUMB_SIZE,
    width: NUDGE_THUMB_SIZE,
  },
  copy: {
    flex: 1,
  },
}));

export interface QuickBookNudgeProps {
  image: QuickBookImage | null;
  onStart: () => void;
  onDismiss: () => void;
}

export function QuickBookNudge({
  image,
  onStart,
  onDismiss,
}: QuickBookNudgeProps): React.ReactElement | null {
  const { token } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottom: insets.bottom + token.padding });
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setPreviewOpen(false);
  }, [image?.localPath]);

  if (image === null) {
    return null;
  }

  const imageSource = { uri: image.localPath };

  return (
    <Column style={styles.root}>
      <Row align="center" gap={token.marginSM} style={styles.card}>
        <Pressable
          hitSlop={NUDGE_IMAGE_HIT_SLOP}
          onPress={() => setPreviewOpen(true)}
          testID="quick-book-nudge-image"
        >
          <Image
            preview={false}
            radius="small"
            src={imageSource}
            style={styles.thumbnail}
          />
        </Pressable>
        <Column gap={token.marginXXS} style={styles.copy}>
          <Text size="sm">发现新截图</Text>
          <Text color="secondary" size="xs">
            让助手帮你记一笔？
          </Text>
        </Column>
        <Button onPress={onStart} size="small" type="primary">
          记一笔
        </Button>
        <Button
          icon={XIcon}
          onPress={onDismiss}
          shape="circle"
          size="small"
          testID="quick-book-nudge-dismiss"
          type="text"
        />
      </Row>
      <ImagePreview
        images={[imageSource]}
        onOpenChange={setPreviewOpen}
        open={previewOpen}
      />
    </Column>
  );
}
