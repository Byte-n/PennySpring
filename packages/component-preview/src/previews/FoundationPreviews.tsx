import React from 'react';
import { View } from 'react-native';
import { Avatar, Button, Grid, Text } from '@pennyspring/component';
import {
  CheckIcon,
  DotsThreeIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from './PreviewScaffold';
import type { AvatarGroupItem, AvatarSize } from '@pennyspring/component';

const SIZES: AvatarSize[] = ['small', 'normal', 'large'];
const BUTTON_SIZES = ['small', 'normal', 'large'] as const;

const AVATAR_ITEMS: AvatarGroupItem[] = [
  { key: 'april', text: 'AP' },
  { key: 'spring', text: 'SP' },
  { key: 'penny', text: 'PN' },
  { key: 'kaori', text: 'KR' },
];

interface GridDemoItem {
  key: string;
  title: string;
  value: string;
}

const GRID_ITEMS: GridDemoItem[] = [
  { key: 'today', title: 'Today', value: '12' },
  { key: 'week', title: 'Week', value: '48' },
  { key: 'month', title: 'Month', value: '128' },
  { key: 'year', title: 'Year', value: '856' },
];

const useStyles = createUseSheetStyle(token => ({
  tile: {
    minHeight: token.controlHeightLG + token.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: token.marginXXS,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
  inlineGrid: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
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

export function ButtonPreview() {
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="Type">
        <PreviewRow>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Color and variant">
        <PreviewRow>
          <Button color="green" variant="solid">
            Green
          </Button>
          <Button color="gold" variant="filled">
            Gold
          </Button>
          <Button danger>Danger</Button>
          <Button color="purple" variant="outlined">
            Outlined
          </Button>
          <Button color="cyan" variant="dashed">
            Dashed
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Size and shape">
        <PreviewRow>
          {BUTTON_SIZES.map(size => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
          <Button shape="round" type="primary">
            Round
          </Button>
          <Button
            accessibilityLabel="Add"
            icon={
              <PlusIcon
                color={token.colorPrimaryText}
                size={token.fontSizeLG}
              />
            }
            shape="circle"
          />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Icon and state">
        <PreviewRow>
          <Button
            icon={
              <CheckIcon
                color={token.colorTextLightSolid}
                size={token.fontSizeLG}
              />
            }
            type="primary"
          >
            Confirm
          </Button>
          <Button
            icon={
              <TrashIcon color={token.colorErrorText} size={token.fontSizeLG} />
            }
            iconPlacement="end"
            danger
          >
            Remove
          </Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Block">
        <Button block type="primary">
          Block button
        </Button>
      </PreviewSection>
    </PreviewScaffold>
  );
}

export function GridPreview() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="Columns">
        <Grid columns={token.lineWidthBold + token.lineWidth} gap={token.marginXS}>
          {GRID_ITEMS.map(item => (
            <Grid.Item key={item.key}>
              <View style={styles.tile}>
                <Text color="description" size="sm">
                  {item.title}
                </Text>
                <Text color="heading" weight="strong">
                  {item.value}
                </Text>
              </View>
            </Grid.Item>
          ))}
        </Grid>
      </PreviewSection>

      <PreviewSection title="Span">
        <Grid columns={token.lineWidthBold + token.lineWidth} gap={[token.marginXS, token.marginSM]} style={styles.inlineGrid}>
          <Grid.Item span={token.lineWidthBold}>
            <View style={styles.tile}>
              <Text color="description" size="sm">
                Wide
              </Text>
              <Text color="heading" weight="strong">
                2 cols
              </Text>
            </View>
          </Grid.Item>
          <Grid.Item>
            <View style={styles.tile}>
              <DotsThreeIcon color={token.colorIcon} size={token.fontSizeXL} />
            </View>
          </Grid.Item>
        </Grid>
      </PreviewSection>
    </PreviewScaffold>
  );
}
