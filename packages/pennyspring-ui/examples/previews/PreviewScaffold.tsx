import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

interface PreviewScaffoldProps {
  children?: ReactNode;
}

interface PreviewSectionProps {
  title: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface PreviewRowProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const useStyles = createUseSheetStyle(token => ({
  content: {
    padding: token.padding,
    gap: token.marginLG,
  },
  section: {
    gap: token.paddingXS,
  },
  sectionTitle: {
    marginBottom: token.marginXXS,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: token.paddingSM,
  },
}));

export function PreviewScaffold({ children }: PreviewScaffoldProps) {
  const styles = useStyles();

  return (
    <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
  );
}

export function PreviewSection({
  children,
  style,
  title,
}: PreviewSectionProps) {
  const styles = useStyles();

  return (
    <View style={[styles.section, style]}>
      <Text
        color="heading"
        size="h5"
        weight="strong"
        style={styles.sectionTitle}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

export function PreviewRow({ children, style }: PreviewRowProps) {
  const styles = useStyles();

  return <View style={[styles.row, style]}>{children}</View>;
}
