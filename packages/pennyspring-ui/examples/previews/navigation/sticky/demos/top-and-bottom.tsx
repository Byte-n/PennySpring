import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Sticky, StickyLayout, Space, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const CONTENT_ROWS = [
  '金额、分类和资产字段',
  '日期、标签和图片字段',
  '备注和关联记录字段',
  '更多业务字段示例',
  '滚动到末尾查看底部操作区',
];

const useStyles = createUseSheetStyle(token => ({
  canvas: {
    height: token.controlHeightLG * 8,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    overflow: 'hidden',
  },
  content: {
    gap: token.marginSM,
    padding: token.paddingSM,
  },
  scroll: {
    flex: 1,
  },
  contentRow: {
    minHeight: token.controlHeightLG,
    justifyContent: 'center',
    paddingHorizontal: token.paddingSM,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorFillTertiary,
  },
  stickyTop: {
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
    backgroundColor: token.colorPrimaryBg,
    borderBottomColor: token.colorPrimaryBorder,
    borderBottomWidth: token.lineWidth,
  },
  stickyBottom: {
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
    backgroundColor: token.colorBgContainer,
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
  },
  status: {
    minHeight: token.controlHeightSM,
  },
}));

export function StickyTopAndBottomDemo() {
  const styles = useStyles();
  const [bottomDisabled, setBottomDisabled] = React.useState(false);
  const [status, setStatus] = React.useState('向上或向下滚动查看吸附状态');

  return (
    <Space direction="vertical" gap="small">
      <Text color="description" size="sm" style={styles.status}>
        {status}
      </Text>
      <Button
        type={bottomDisabled ? 'default' : 'primary'}
        onPress={() => {
          setBottomDisabled(value => !value);
          setStatus(
            bottomDisabled ? '底部 Sticky 已启用' : '底部 Sticky 已禁用',
          );
        }}
      >
        {bottomDisabled ? '启用底部吸附' : '禁用底部吸附'}
      </Button>
      <View style={styles.canvas}>
        <StickyLayout>
          <ScrollView
            contentContainerStyle={styles.content}
            scrollEnabled
            showsVerticalScrollIndicator
            style={styles.scroll}
          >
            <View style={styles.contentRow}>
              <Text color="heading" weight="strong">
                滚动区域内的业务内容
              </Text>
            </View>
            <Sticky
              offset={0}
              onChange={affixed => {
                setStatus(
                  affixed ? '顶部 Sticky 正在吸附' : '顶部 Sticky 已回到原位',
                );
              }}
              placement="top"
            >
              <View style={styles.stickyTop}>
                <Text color="primary" weight="strong">
                  顶部筛选栏
                </Text>
              </View>
            </Sticky>
            {CONTENT_ROWS.map(row => (
              <View key={row} style={styles.contentRow}>
                <Text color="secondary">{row}</Text>
              </View>
            ))}
            <Sticky
              disabled={bottomDisabled}
              offset={0}
              onChange={affixed => {
                setStatus(
                  affixed ? '底部提交栏正在吸附' : '底部提交栏已回到原位',
                );
              }}
              placement="bottom"
            >
              <View style={styles.stickyBottom}>
                <Text color="heading" weight="strong">
                  提交操作区
                </Text>
              </View>
            </Sticky>
          </ScrollView>
        </StickyLayout>
      </View>
    </Space>
  );
}

export default StickyTopAndBottomDemo;
