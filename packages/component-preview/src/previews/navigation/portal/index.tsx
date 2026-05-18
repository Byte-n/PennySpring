import React from 'react';
import { Pressable, View } from 'react-native';
import { Portal, PortalProvider, Text } from '@pennyspring/component';
import { DotsThreeIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  infoPanel: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    padding: token.paddingSM,
    gap: token.marginXXS,
  },
  portalRoot: {
    minHeight: token.controlHeightLG + token.controlHeightLG,
    justifyContent: 'center',
    padding: token.padding,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
  floating: {
    alignSelf: 'flex-end',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgElevated,
  },
}));

export function PortalPreview() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="文字说明">
        <View style={styles.infoPanel}>
          <Text color="heading" weight="medium">
            App、ConfigProvider、useComponentConfig、PortalProvider
          </Text>
          <Text color="secondary" size="sm">
            App 是组合容器，内部按顺序包裹 ConfigProvider 与 PortalProvider。
          </Text>
          <Text color="secondary" size="sm">
            ConfigProvider 用于注入组件级配置，useComponentConfig 在任意后代节点读取并继承合并后的配置。
          </Text>
          <Text color="secondary" size="sm">
            PortalProvider 提供跨层级挂载能力，Portal 以及 useToast/useMessage/useNotification 等浮层能力都依赖它。
          </Text>
        </View>
      </PreviewSection>
      <PreviewSection title="Portal">
        <PortalProvider>
          <View style={styles.portalRoot}>
            <Text color="heading" weight="strong">Provider content</Text>
            <Text color="secondary">Portal children are mounted after provider children.</Text>
            <Portal>
              <View style={styles.floating}>
                <Text>Portaled content</Text>
              </View>
            </Portal>
          </View>
        </PortalProvider>
      </PreviewSection>

      <PreviewSection title="Trigger shape">
        <Pressable>
          <DotsThreeIcon color={token.colorIcon} />
        </Pressable>
      </PreviewSection>
    </PreviewScaffold>
  );
}
