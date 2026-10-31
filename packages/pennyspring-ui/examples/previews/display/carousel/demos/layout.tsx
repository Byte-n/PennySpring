import React from 'react';
import { Carousel, Column, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

interface SlideItem {
  kicker: string;
  title: string;
  meta: string;
}

const SINGLE_SLIDES: SlideItem[] = [
  { kicker: '本月结余', title: '¥ 2,860.00', meta: '收入 7,140 · 支出 4,280' },
  { kicker: '固定支出', title: '¥ 1,200.00', meta: '房租 900 · 会员 300' },
];

const PEEK_SLIDES: SlideItem[] = [
  { kicker: '账本 1', title: '日常开销', meta: '¥ 4,280' },
  { kicker: '账本 2', title: '旅行基金', meta: '¥ 1,200' },
  { kicker: '账本 3', title: '家庭共账', meta: '¥ 3,600' },
];

const VERTICAL_SLIDES: SlideItem[] = [
  { kicker: '快捷模板', title: '早餐 12 元', meta: '再点一次直接记账' },
  { kicker: '快捷模板', title: '地铁 4 元', meta: '工作日 8:30 自动带出' },
];

const CAROUSEL_HEIGHT = 160;
const PEEK_SLIDE_SIZE = 76;

const useStyles = createUseSheetStyle(token => ({
  frame: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    height: CAROUSEL_HEIGHT,
    overflow: 'hidden',
  },
  peekFrame: {
    backgroundColor: 'transparent',
    height: CAROUSEL_HEIGHT,
    overflow: 'hidden',
  },
  verticalFrame: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    height: CAROUSEL_HEIGHT,
    overflow: 'hidden',
    width: '60%',
  },
  slide: {
    backgroundColor: token.colorBgSpotlight,
    flex: 1,
    justifyContent: 'flex-end',
    padding: token.padding,
  },
  section: {
    gap: token.marginSM,
  },
}));

function Slide({ item }: { item: SlideItem }) {
  const styles = useStyles();

  return (
    <Column style={styles.slide}>
      <Text color="lightSolid" size="xs">{item.kicker}</Text>
      <Text color="lightSolid" size="xl" weight="semibold">{item.title}</Text>
      <Text color="lightSolid" size="xs">{item.meta}</Text>
    </Column>
  );
}

export function CarouselLayoutDemo() {
  const styles = useStyles();
  const { token } = useTheme();
  const verticalIndicatorStyle = {
    bottom: 0,
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    left: 'auto' as const,
    right: token.paddingSM,
    top: 0,
  };

  return (
    <Column gap="large">
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">single · 单页整屏，底部指示器居中</Text>
        <Column style={styles.frame}>
          <Carousel
            data={SINGLE_SLIDES}
            renderItem={item => <Slide item={item} />}
          />
        </Column>
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">peek · 下页露 24%，slideSize=76；组件不内置间距，由调用方决定</Text>
        <Column style={styles.peekFrame}>
          <Carousel
            data={PEEK_SLIDES}
            renderItem={item => <Slide item={item} />}
            slideSize={PEEK_SLIDE_SIZE}
            stuckAtBoundary={false}
          />
        </Column>
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">vertical · 纵向翻页，指示器移到右侧垂直居中</Text>
        <Column style={styles.verticalFrame}>
          <Carousel
            data={VERTICAL_SLIDES}
            direction="vertical"
            renderItem={item => <Slide item={item} />}
            styles={{ indicator: verticalIndicatorStyle }}
          />
        </Column>
      </Column>
    </Column>
  );
}

export default CarouselLayoutDemo;
