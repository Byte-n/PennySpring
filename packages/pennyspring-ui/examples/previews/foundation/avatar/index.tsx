import React from 'react';
import { View } from 'react-native';
import { Avatar } from '@pennyspring/ui';
import { UserIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { AvatarGroupItem, ComponentSize } from '@pennyspring/ui';

const SIZES: ComponentSize[] = ['small', 'normal', 'large'];

const AVATAR_ITEMS: AvatarGroupItem[] = [
  { key: 'april', text: 'AP' },
  { key: 'spring', text: 'SP' },
  { key: 'penny', text: 'PN' },
  { key: 'kaori', text: 'KR' },
];

const useStyles = createUseSheetStyle(() => ({
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export function AvatarPreview() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="Size">
        <PreviewRow>
          {SIZES.map(size => (
            <Avatar key={size} size={size} text={size.slice(0, 2)} />
          ))}
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Shape and content">
        <PreviewRow>
          <Avatar text="PS" />
          <Avatar shape="square" text="钱" />
          <Avatar
            icon={(
              <View style={styles.iconCircle}>
                <UserIcon color={token.colorIcon} size={token.fontSizeXL} />
              </View>
            )}
          />
          <Avatar disabled text="禁用" />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Group">
        <Avatar.Group items={AVATAR_ITEMS} maxCount={token.lineWidthBold + token.lineWidthBold + token.lineWidth} />
      </PreviewSection>
    </PreviewScaffold>
  );
}
