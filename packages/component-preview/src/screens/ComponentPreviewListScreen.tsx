import React from 'react';
import { ScrollView, View } from 'react-native';
import { List, Tabs, Text } from '@pennyspring/component';
import { CaretRightIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { COMPONENT_PREVIEW_SECTIONS } from '../previews/registry';
import { COMPONENT_PREVIEW_ROUTES } from '../navigation/routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ComponentPreviewStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<
  ComponentPreviewStackParamList,
  typeof COMPONENT_PREVIEW_ROUTES.ComponentList
>;

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: token.paddingMD,
    gap: token.marginLG,
  },
  tabsWrap: {
    paddingTop: token.paddingMD,
    paddingHorizontal: token.paddingMD,
    backgroundColor: token.colorBgLayout,
  },
  section: {
    gap: token.marginXS,
  },
  sectionTitle: {
    paddingHorizontal: token.paddingMD,
  },
  list: {
    borderColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
    borderBottomWidth: token.lineWidth,
  },
}));

export function ComponentPreviewListScreen({ navigation }: Props) {
  const styles = useStyles();
  const { token } = useTheme();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [sectionId, setSectionId] = React.useState(
    COMPONENT_PREVIEW_SECTIONS[0]?.id,
  );
  const [sectionOffsets, setSectionOffsets] = React.useState<
    Record<string, number>
  >({});

  return (
    <View style={styles.container}>
      <View style={styles.tabsWrap}>
        <Tabs
          block
          value={sectionId}
          onChange={nextValue => {
            const nextSectionId = String(nextValue);
            setSectionId(nextSectionId);

            const nextOffset = sectionOffsets[nextSectionId];
            if (nextOffset === undefined) {
              return;
            }

            scrollViewRef.current?.scrollTo({
              y: Math.max(nextOffset, 0),
              animated: true,
            });
          }}
          items={COMPONENT_PREVIEW_SECTIONS.map(section => ({
            value: section.id,
            label: section.title,
          }))}
        />
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
      {COMPONENT_PREVIEW_SECTIONS.map(section => (
        <View
          key={section.id}
          style={styles.section}
          onLayout={event => {
            const nextY = event.nativeEvent.layout.y;
            setSectionOffsets(prev => {
              if (prev[section.id] === nextY) {
                return prev;
              }

              return {
                ...prev,
                [section.id]: nextY,
              };
            });
          }}
        >
          <Text
            color="description"
            size="sm"
            weight="medium"
            style={styles.sectionTitle}
          >
            {section.title}
          </Text>
          <List
            divider="full"
            items={section.items.map(item => ({
              titleText: item.title,
              descriptionText: item.description,
              right: (
                  <CaretRightIcon
                    color={token.colorIcon}
                    size={token.fontSizeLG}
                  />
              ),
              onPress: () => {
                  navigation.navigate(COMPONENT_PREVIEW_ROUTES.ComponentDetail, {
                    previewId: item.id,
                  });
              },
            }))}
            style={styles.list}
          />
        </View>
      ))}
      </ScrollView>
    </View>
  );
}
