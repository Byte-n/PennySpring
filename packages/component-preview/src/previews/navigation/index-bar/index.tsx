import React from 'react';
import { View } from 'react-native';
import { IndexBar, List, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { IndexBarValue } from '@pennyspring/component';

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
  const [value, setValue] = React.useState<IndexBarValue>('B');

  return (
    <PreviewScaffold>
      <PreviewSection title="Controlled and panel disabled">
        <View style={styles.panelBody}>
          <IndexBar value={value} onChange={setValue}>
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
        <Text color="description" size="sm">
          Current index: {String(value)}
        </Text>
      </PreviewSection>

      <PreviewSection title="Size and disabled">
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
