import React from 'react';
import { View } from 'react-native';
import { Icon, type IconName, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const SHOWCASE_ICONS: readonly IconName[] = [
  'home',
  'search',
  'notification',
  'settings',
  'user',
  'warning',
  'check-circle',
  'close-circle',
];

const useStyles = createUseSheetStyle(token => ({
  iconCell: {
    alignItems: 'center',
    gap: token.marginXXS,
    minWidth: token.controlHeightLG,
  },
  iconLabel: {
    textTransform: 'capitalize',
  },
}));

export function IconPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Size and color">
        <PreviewRow>
          <Icon icon="home" size="small" />
          <Icon icon="home" size="normal" />
          <Icon icon="home" size="large" />
          <Icon icon="home" size={28} />
          <Icon icon="warning" color="colorWarning" />
          <Icon icon="check-circle" color="colorSuccess" />
          <Icon icon="close-circle" color="colorError" />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Weight and mirrored">
        <PreviewRow>
          <Icon icon="heart" weight="thin" />
          <Icon icon="heart" weight="regular" />
          <Icon icon="heart" weight="fill" />
          <Icon icon="arrow-right" mirrored />
          <Icon icon="caret-right" mirrored />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Common icons">
        <PreviewRow>
          {SHOWCASE_ICONS.map(name => (
            <View key={name} style={styles.iconCell}>
              <Icon icon={name} />
              <Text color="description" size="sm" style={styles.iconLabel}>
                {name}
              </Text>
            </View>
          ))}
        </PreviewRow>
      </PreviewSection>
    </PreviewScaffold>
  );
}
