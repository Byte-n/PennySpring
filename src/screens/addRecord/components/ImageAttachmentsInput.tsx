import React, { useCallback } from 'react';
import {
  Column,
  ImagePicker,
  Row,
  Tag,
  useToast,
  type ImagePickerValue,
} from '@pennyspring/ui';
import { useTheme } from '@pennyspring/theme';

interface ImageAttachmentsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

function getImagePath(image: ImagePickerValue): string {
  return image.uri;
}

function getImageName(imagePath: string): string {
  const parts = imagePath.split('/');
  return parts[parts.length - 1] || imagePath;
}

export function ImageAttachmentsInput({
  onChange,
  value,
}: ImageAttachmentsInputProps) {
  const { token } = useTheme();
  const toast = useToast();

  const handleImageChange = useCallback(
    (image: ImagePickerValue) => {
      const imagePath = getImagePath(image);
      if (value.includes(imagePath)) {
        return;
      }

      onChange([...value, imagePath]);
    },
    [onChange, value],
  );

  const handleRemove = useCallback(
    (imagePath: string) => {
      onChange(value.filter(item => item !== imagePath));
    },
    [onChange, value],
  );

  return (
    <Column gap={token.marginXS}>
      <ImagePicker
        label="图片"
        onChange={handleImageChange}
        onError={(error: unknown) => {
          toast.show({
            messageText: error instanceof Error ? error.message : '选择图片失败',
          });
        }}
        placeholder="添加图片"
      />
      {value.length > 0 ? (
        <Row gap={token.marginXS} wrap>
          {value.map(imagePath => (
            <Tag
              key={imagePath}
              color="blue"
              onPress={() => handleRemove(imagePath)}
              variant="outlined"
            >
              {getImageName(imagePath)}
            </Tag>
          ))}
        </Row>
      ) : null}
    </Column>
  );
}
