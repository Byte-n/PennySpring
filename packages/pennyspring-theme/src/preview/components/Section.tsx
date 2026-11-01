import React from 'react';
import { View, Text } from 'react-native';
import { createUseSheetStyle } from '../../createUseSheetStyle';

const useSectionStyles = createUseSheetStyle(tokens => ({
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colorBorderSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: tokens.colorText,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    color: tokens.colorTextSecondary,
  },
}));

interface SectionProps {
  title: string;
  children?: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  const styles = useSectionStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function SubSectionTitle({ title }: { title: string }) {
  const styles = useSectionStyles();
  return <Text style={styles.subSectionTitle}>{title}</Text>;
}
