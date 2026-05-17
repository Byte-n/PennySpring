import React from 'react';
import { View } from 'react-native';
import { Avatar, Badge, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const BADGE_COLORS = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
] as const;

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  sampleWrap: {
    marginRight: token.marginSM,
    marginBottom: token.marginSM,
  },
}));

export function BadgePreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Count and dot">
        <PreviewRow>
          <Badge count={8}>
            <Avatar size="large" text="PS" />
          </Badge>
          <Badge count={128} overflowCount={99}>
            <Avatar size="large" text="OV" />
          </Badge>
          <Badge dot count={1} offset={[-6, 6]}>
            <Avatar size="large" text="DT" />
          </Badge>
          <Badge showZero count={0}>
            <Avatar size="large" text="0" />
          </Badge>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Standalone">
        <PreviewRow>
          <Badge count="New" color="primary" />
          <Badge count="Sync" color="success" />
          <Badge count="Warn" color="warning" />
          <Badge count="Error" color="danger" />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Color and size">
        <View style={styles.stack}>
          <PreviewRow>
            {BADGE_COLORS.map(color => (
              <View key={color} style={styles.sampleWrap}>
                <Badge count={9} color={color} size="small">
                  <Avatar size="small" text="S" />
                </Badge>
              </View>
            ))}
          </PreviewRow>
          <PreviewRow>
            <Badge count={9} color="geekblue" size="small">
              <Avatar size="small" text="S" />
            </Badge>
            <Badge count={9} color="geekblue" size="normal">
              <Avatar size="normal" text="N" />
            </Badge>
            <Badge count={9} color="geekblue" size="large">
              <Avatar size="large" text="L" />
            </Badge>
          </PreviewRow>
        </View>
      </PreviewSection>

      <PreviewSection title="Custom count node">
        <Badge
          color="magenta"
          count={<Text color="lightSolid" size="sm" weight="strong">VIP</Text>}
        >
          <Avatar size="large" text="MB" />
        </Badge>
      </PreviewSection>
    </PreviewScaffold>
  );
}
