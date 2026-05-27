import React from 'react';
import { View } from 'react-native';
import { IndexBar, List, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { IndexBarItem, IndexBarValue } from '@pennyspring/ui';

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
      items={[
        { titleText: `${prefix}lpha`, descriptionText: 'Item' },
        { titleText: `${prefix}eta`, descriptionText: 'Item' },
        { titleText: `${prefix}amma`, descriptionText: 'Item' },
      ]}
      style={styles.listBorder}
    />
  );
}

export const indexBarControlledAndPanelDisabledDemoTitle =
  'Controlled and panel disabled';

const INDEX_BAR_DATA: IndexBarItem[] = [
  {
    index: 'A',
    titleText: 'A · Accounts',
  },
  {
    index: 'B',
    titleText: 'B · Budget',
  },
  {
    disabled: true,
    index: 'C',
    titleText: 'C · Category',
  },
];

export function IndexBarControlledAndPanelDisabledDemo() {
  const styles = useStyles();
  const [value, setValue] = React.useState<IndexBarValue>('B');

  const renderPanel = (item: IndexBarItem) => {
    if (item.index === 'C') {
      return (
        <View style={styles.panelPadding}>
          <Text color="description">This panel is disabled.</Text>
        </View>
      );
    }

    return <PanelList prefix={String(item.index)} />;
  };

  return (
    <>
      <View style={styles.panelBody}>
        <IndexBar
          data={INDEX_BAR_DATA}
          value={value}
          onChange={setValue}
          renderPanel={renderPanel}
        />
      </View>
      <Text color="description" size="sm">
        Current index: {String(value)}
      </Text>
    </>
  );
}

export default IndexBarControlledAndPanelDisabledDemo;
