import React from 'react';
import { View } from 'react-native';
import { IndexBar, List, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

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

export function IndexBarPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Panels and sidebar">
        <View style={styles.panelBody}>
          <IndexBar defaultValue="B">
            <IndexBar.Panel index="A" titleText="A · Accounts">
              <PanelList prefix="A" />
            </IndexBar.Panel>
            <IndexBar.Panel index="B" titleText="B · Budget">
              <PanelList prefix="B" />
            </IndexBar.Panel>
            <IndexBar.Panel index="C" titleText="C · Category" disabled>
              <View style={styles.panelPadding}>
                <Text color="description">This panel is disabled.</Text>
              </View>
            </IndexBar.Panel>
          </IndexBar>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
