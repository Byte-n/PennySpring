import React from 'react';
import { Pressable } from 'react-native';
import { Icon, Image, Row, Text, type ImagePickerValue } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const ATTACHMENT_SIZE = 44;
const REMOVE_BADGE_SIZE = 18;
const REMOVE_BADGE_OFFSET = 6;
const REMOVE_BADGE_ICON_SIZE = 9;
const REMOVE_BADGE_HIT_SLOP = 13;
const ADD_ICON_SIZE = 18;
const PILL_RADIUS = 999;
const PRESS_SCALE = 0.97;
/** 删除角标固定深色，保证任何小票缩略图上都可读，不随主题反转。 */
const REMOVE_BADGE_BACKGROUND = 'rgba(0, 0, 0, 0.58)';

const useStyles = createUseSheetStyle(token => ({
  rail: {
    alignItems: 'center',
    gap: token.marginXS,
    paddingBottom: token.marginXS,
    paddingTop: token.marginXXS,
  },
  item: {
    width: ATTACHMENT_SIZE,
    height: ATTACHMENT_SIZE,
    position: 'relative' as const,
  },
  thumbnail: {
    width: ATTACHMENT_SIZE,
    height: ATTACHMENT_SIZE,
  },
  removeButton: {
    position: 'absolute' as const,
    top: -REMOVE_BADGE_OFFSET,
    right: -REMOVE_BADGE_OFFSET,
    width: REMOVE_BADGE_SIZE,
    height: REMOVE_BADGE_SIZE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: REMOVE_BADGE_BACKGROUND,
    borderRadius: PILL_RADIUS,
  },
  removeButtonPressed: {
    transform: [{ scale: PRESS_SCALE }],
  },
  addTile: {
    width: ATTACHMENT_SIZE,
    height: ATTACHMENT_SIZE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusSM,
    borderStyle: 'dashed' as const,
    borderWidth: token.lineWidth,
  },
  addTilePressed: {
    backgroundColor: token.colorFillContent,
  },
}));

export interface ComposerAttachmentsProps {
  images: ImagePickerValue[];
  canAdd: boolean;
  maxCount: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function ComposerAttachments({
  images,
  canAdd,
  maxCount,
  onAdd,
  onRemove,
}: ComposerAttachmentsProps): React.ReactElement {
  const styles = useStyles();

  return (
    <Image.PreviewGroup>
      <Row align="center" style={styles.rail} testID="agent-image-staging-bar">
        {images.map((image, index) => (
          <Row key={`${image.uri}-${index}`} style={styles.item}>
            <Image
              radius="small"
              src={{ uri: image.uri }}
              style={styles.thumbnail}
              testID={`agent-image-thumb-${index}`}
            />
            <Pressable
              hitSlop={REMOVE_BADGE_HIT_SLOP}
              onPress={() => onRemove(index)}
              style={({ pressed }) => [
                styles.removeButton,
                pressed ? styles.removeButtonPressed : undefined,
              ]}
              testID={`agent-image-remove-${index}`}
            >
              <Icon
                color="lightSolid"
                icon="close"
                size={REMOVE_BADGE_ICON_SIZE}
              />
            </Pressable>
          </Row>
        ))}
        {canAdd ? (
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [
              styles.addTile,
              pressed ? styles.addTilePressed : undefined,
            ]}
            testID="agent-image-add"
          >
            <Icon color="tertiary" icon="plus" size={ADD_ICON_SIZE} />
          </Pressable>
        ) : null}
        <Text color="tertiary" size="xs" testID="agent-image-count">
          {`${images.length} / ${maxCount}`}
        </Text>
      </Row>
    </Image.PreviewGroup>
  );
}
