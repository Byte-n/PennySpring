import React from 'react';
import { View } from 'react-native';
import { IndexBar, List } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

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

export const indexBarSizeAndDisabledDemoTitle = 'Size and disabled';

export function IndexBarSizeAndDisabledDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.panelBody}>
        <IndexBar defaultValue="A" size="small">
          <IndexBar.Panel index="A" titleText="A">
            <PanelList prefix="A" />
          </IndexBar.Panel>
          <IndexBar.Panel index="B" titleText="B">
            <PanelList prefix="B" />
          </IndexBar.Panel>
        </IndexBar>
      </View>
      <View style={styles.panelBody}>
        <IndexBar defaultValue="A" disabled>
          <IndexBar.Panel index="A" titleText="A">
            <PanelList prefix="A" />
          </IndexBar.Panel>
          <IndexBar.Panel index="B" titleText="B">
            <PanelList prefix="B" />
          </IndexBar.Panel>
        </IndexBar>
      </View>
    </>
  );
}

export default IndexBarSizeAndDisabledDemo;
