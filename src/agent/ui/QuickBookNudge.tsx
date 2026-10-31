import React from 'react';
import { Image } from 'react-native';
import type { ImageStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { XIcon } from 'phosphor-react-native';

import type { QuickBookImage } from '../../features/quickBook/types';

const NUDGE_Z_INDEX = 10;

const useStyles = createUseSheetStyle<{ top: number }>((token, options) => ({
  root: {
    left: token.padding,
    position: 'absolute',
    right: token.padding,
    top: options.top,
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
    borderRadius: token.borderRadius,
    height: token.controlHeight,
    width: token.controlHeight,
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
  const styles = useStyles({ top: insets.top + token.paddingXS });

  if (image === null) {
    return null;
  }

  return (
    <Column style={styles.root}>
      <Row align="center" gap={token.marginSM} style={styles.card}>
        <Image
          source={{ uri: image.localPath }}
          style={styles.thumbnail as ImageStyle}
        />
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
    </Column>
  );
}
