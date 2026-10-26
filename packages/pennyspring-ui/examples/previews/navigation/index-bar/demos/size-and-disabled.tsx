import React from 'react';
import { View } from 'react-native';
import { IndexBar, List } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { IndexBarItem } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  panelBody: {
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    overflow: 'hidden',
  },
  listBorder: {
    borderTopWidth: token.lineWidth,
    borderBottomWidth: token.lineWidth,
    borderColor: token.colorSplit,
  },
  panelPadding: {
    padding: token.padding,
  },
}));

function PanelList({ prefix }: { prefix: string }) {
  const styles = useStyles();

  return (
    <List
      data={[
        { titleText: `${prefix}lpha`, descriptionText: 'Item' },
        { titleText: `${prefix}eta`, descriptionText: 'Item' },
        { titleText: `${prefix}amma`, descriptionText: 'Item' },
      ]}
      style={styles.listBorder}
    />
  );
}

export const indexBarSizeAndDisabledDemoTitle = 'Size and disabled';

const INDEX_BAR_DATA: IndexBarItem[] = [
  {
    index: 'A',
    titleText: 'A',
  },
  {
    index: 'B',
    titleText: 'B',
  },
];

export function IndexBarSizeAndDisabledDemo() {
  const styles = useStyles();
  const renderPanel = (item: IndexBarItem) => (
    <PanelList prefix={String(item.index)} />
  );

  return (
    <>
      <View style={styles.panelBody}>
        <IndexBar
          data={INDEX_BAR_DATA}
          defaultValue="A"
          size="small"
          renderPanel={renderPanel}
        />
      </View>
      <View style={styles.panelBody}>
        <IndexBar
          data={INDEX_BAR_DATA}
          defaultValue="A"
          disabled
          renderPanel={renderPanel}
        />
      </View>
    </>
  );
}

export default IndexBarSizeAndDisabledDemo;
