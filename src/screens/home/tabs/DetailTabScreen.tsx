import React from 'react';
import { ScrollView, View, type TextStyle } from 'react-native';
import { FloatingActionButton, Icon, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';

import { useNavigation } from '../../../navigation/useNavigation';

const useStyles = createUseSheetStyle((token) => ({
  container: {
    flex: 1,
  },
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
  fab: {
    position: 'absolute',
    bottom: token.paddingLG,
    right: token.paddingLG,
  },
}));

export function DetailTabScreen() {
  const styles = useStyles();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>明细占位</Text>
          <Text style={styles.description}>这里将展示收支明细列表。</Text>
        </View>
      </ScrollView>
      <FloatingActionButton
        icon={<Icon icon="plus" />}
        onPress={() => navigation.navigate('AddRecord')}
        style={styles.fab}
        testID="detail-tab-fab"
      />
    </View>
  );
}
