import React from 'react';
import { Avatar, Button, Column, Row, Skeleton, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  card: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    gap: token.marginSM,
    padding: token.padding,
  },
  row: {
    alignItems: 'center',
    gap: token.marginSM,
  },
  column: {
    flex: 1,
    gap: token.marginXS,
  },
  w40: {
    width: '40%',
  },
  w60: {
    width: '60%',
  },
  w80: {
    width: '80%',
  },
}));

export function SkeletonStatesDemo() {
  const styles = useStyles();
  const [loading, setLoading] = React.useState(true);

  return (
    <Column gap="large">
      <Column gap="small">
        <Text color="tertiary" size="xs">animated vs static：静态不渲染高光块，只留底色</Text>
        <Skeleton />
        <Skeleton style={styles.w80} />
        <Skeleton animated={false} style={styles.w60} />
        <Skeleton animated={false} style={styles.w40} />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">loading=false：切换时内容 100ms 淡入</Text>
        <Column style={styles.card}>
          <Skeleton loading={loading} shape="rect" size="small">
            <Row style={styles.row}>
              <Avatar text="陈" />
              <Column style={styles.column}>
                <Text weight="medium">陈嘉宁</Text>
                <Text color="tertiary" size="xs">共同记账 128 天</Text>
              </Column>
            </Row>
          </Skeleton>
        </Column>
        <Button
          onPress={() => setLoading(previous => !previous)}
          size="small"
          variant="outlined"
        >
          {loading ? '模拟加载完成' : '重新加载'}
        </Button>
      </Column>
      <Text color="tertiary" size="xs">
        同一屏最多一组骨架，不做逐块闪烁；shimmer 占容器 40% 宽，1.2s 循环
      </Text>
    </Column>
  );
}

export default SkeletonStatesDemo;
