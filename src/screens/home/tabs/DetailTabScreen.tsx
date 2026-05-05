import React from 'react';
import { ScrollView, Text, View, type TextStyle } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle((token) => ({
  content: {
    flexGrow: 1,
    padding: token.paddingLG,
  },
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    padding: token.paddingLG,
  },
  title: {
    color: token.colorTextHeading,
    fontFamily: token.fontFamily,
    fontSize: token.fontSizeHeading3,
    fontWeight: String(token.fontWeightSemiBold) as TextStyle['fontWeight'],
    lineHeight: token.lineHeightHeading3,
  },
  description: {
    color: token.colorTextSecondary,
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    marginTop: token.marginSM,
  },
}));

export function DetailTabScreen() {
  const styles = useStyles();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>明细占位</Text>
        <Text style={styles.description}>这里将展示收支明细列表。</Text>
      </View>
    </ScrollView>
  );
}
