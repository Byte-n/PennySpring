import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { getComponentPreviewById } from '../previews/registry';
import { COMPONENT_PREVIEW_ROUTES } from '../navigation/routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ComponentPreviewStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<
  ComponentPreviewStackParamList,
  typeof COMPONENT_PREVIEW_ROUTES.ComponentDetail
>;

const useStyles = createUseSheetStyle(token => ({
  fallback: {
    flex: 1,
    padding: token.paddingMD,
    justifyContent: 'center',
    gap: token.marginXS,
  },
}));

export function ComponentPreviewDetailScreen({ route }: Props) {
  const styles = useStyles();
  const preview = getComponentPreviewById(route.params.previewId);

  if (preview === undefined) {
    return (
      <View style={styles.fallback}>
        <Text color="heading" size="h5" weight="strong">
          未找到预览
        </Text>
        <Text color="description">当前组件预览不存在或已被移除。</Text>
      </View>
    );
  }

  const Preview = preview.component;

  return <Preview />;
}
