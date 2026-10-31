import React from 'react';
import { Carousel, Column, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/ui';

interface SlideItem {
  kicker: string;
  title: string;
  meta: string;
}

const DARK_SLIDES: SlideItem[] = [
  { kicker: '本月结余', title: '¥ 2,860.00', meta: '收入 7,140 · 支出 4,280' },
  { kicker: '固定支出', title: '¥ 1,200.00', meta: '房租 900 · 会员 300' },
];

const SINGLE_SLIDE: SlideItem[] = [
  { kicker: '账本', title: '只有一张时不渲染指示器', meta: '避免一个孤立的点' },
];

const CAROUSEL_HEIGHT = 160;

const useStyles = createUseSheetStyle(token => ({
  frame: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    height: CAROUSEL_HEIGHT,
    overflow: 'hidden',
  },
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
  },
  slide: {
    backgroundColor: token.colorBgSpotlight,
    flex: 1,
    justifyContent: 'flex-end',
    padding: token.padding,
  },
  surfaceSlide: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
    justifyContent: 'flex-end',
    padding: token.padding,
  },
  section: {
    gap: token.marginSM,
  },
}));

function DarkSlide({ item }: { item: SlideItem }) {
  const styles = useStyles();

  return (
    <Column style={styles.slide}>
      <Text color="lightSolid" size="xs">{item.kicker}</Text>
      <Text color="lightSolid" size="xl" weight="semibold">{item.title}</Text>
      <Text color="lightSolid" size="xs">{item.meta}</Text>
    </Column>
  );
}

function SurfaceSlide({ item }: { item: SlideItem }) {
  const styles = useStyles();

  return (
    <Column style={styles.surfaceSlide}>
      <Text color="tertiary" size="xs">{item.kicker}</Text>
      <Text size="xl" weight="semibold">{item.title}</Text>
      <Text color="tertiary" size="xs">{item.meta}</Text>
    </Column>
  );
}

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column style={styles.surface}>
      <Column style={styles.frame}>
        <Carousel
          data={DARK_SLIDES}
          renderItem={item => <DarkSlide item={item} />}
        />
      </Column>
      <Column style={styles.frame}>
        <Carousel
          data={DARK_SLIDES}
          renderItem={item => <SurfaceSlide item={item} />}
        />
      </Column>
    </Column>
  );
}

export function CarouselStatesDemo() {
  const styles = useStyles();

  return (
    <Column gap="large">
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">
          深色对照：媒体预设不随主题变化，始终白点；surface 预设跟随 colorPrimary / colorTextQuaternary
        </Text>
        <ThemeProvider config={{ algorithm: 'dark' }}>
          <DarkSurface />
        </ThemeProvider>
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">单页：不渲染指示器，也不占位</Text>
        <Column style={styles.frame}>
          <Carousel
            data={SINGLE_SLIDE}
            renderItem={item => <SurfaceSlide item={item} />}
          />
        </Column>
      </Column>
      <Text color="tertiary" size="xs">
        loop=false 且到边界时不再回弹；loop=true 首尾相连。自动播放默认 4s，拖拽期间暂停
      </Text>
    </Column>
  );
}

export default CarouselStatesDemo;
