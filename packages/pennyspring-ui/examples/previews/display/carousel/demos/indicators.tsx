import React from 'react';
import { Carousel, Column, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

interface SlideItem {
  kicker: string;
  title: string;
  meta: string;
}

const MEDIA_SLIDES: SlideItem[] = [
  { kicker: '本月概览', title: '支出 ¥ 4,280', meta: '比上月少 12%' },
  { kicker: '分类', title: '餐饮 38%', meta: '共 26 笔' },
  { kicker: '预算', title: '剩余 ¥ 1,140', meta: '还有 9 天' },
];

const SURFACE_SLIDES: SlideItem[] = [
  { kicker: '账本', title: '日常开销', meta: '本月 26 笔 · ¥ 4,280' },
  { kicker: '账本', title: '旅行基金', meta: '本月 4 笔 · ¥ 1,200' },
];

const COUNTER_SLIDES: SlideItem[] = Array.from({ length: 10 }, (_, index) => ({
  kicker: '导入预览',
  title: `第 ${index + 1} 页`,
  meta: '共 128 笔待确认',
}));

const MEDIA_INACTIVE_OPACITY = 0.45;
const CAROUSEL_HEIGHT = 160;

const useStyles = createUseSheetStyle(token => ({
  frame: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    height: CAROUSEL_HEIGHT,
    overflow: 'hidden',
  },
  mediaSlide: {
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
  kicker: {
    opacity: 0.72,
  },
  gap: {
    marginTop: token.marginXXS,
  },
  section: {
    gap: token.marginSM,
  },
}));

function MediaSlide({ item }: { item: SlideItem }) {
  const styles = useStyles();

  return (
    <Column style={styles.mediaSlide}>
      <Text color="lightSolid" size="xs" style={styles.kicker}>{item.kicker}</Text>
      <Text color="lightSolid" size="xl" weight="semibold">{item.title}</Text>
      <Text color="lightSolid" size="xs" style={styles.kicker}>{item.meta}</Text>
    </Column>
  );
}

function SurfaceSlide({ item }: { item: SlideItem }) {
  const styles = useStyles();

  return (
    <Column style={styles.surfaceSlide}>
      <Text color="tertiary" size="xs">{item.kicker}</Text>
      <Text size="xl" weight="semibold">{item.title}</Text>
      <Text color="tertiary" size="xs" style={styles.gap}>{item.meta}</Text>
    </Column>
  );
}

export function CarouselIndicatorsDemo() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <Column gap="large">
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">dots · 1–8 页；媒体预设 active 纯白 / inactive 45% 白</Text>
        <Column style={styles.frame}>
          <Carousel
            data={MEDIA_SLIDES}
            renderItem={item => <MediaSlide item={item} />}
            styles={{
              indicatorDot: {
                backgroundColor: token.colorWhite,
                opacity: MEDIA_INACTIVE_OPACITY,
              },
              indicatorDotActive: {
                backgroundColor: token.colorWhite,
                opacity: 1,
              },
            }}
          />
        </Column>
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">surface · 白卡场景；active colorPrimary / inactive colorTextQuaternary</Text>
        <Column style={styles.frame}>
          <Carousel
            data={SURFACE_SLIDES}
            renderItem={item => <SurfaceSlide item={item} />}
          />
        </Column>
      </Column>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">counter · 超过 8 页改用右下角计数胶囊，不再渲染圆点</Text>
        <Column style={styles.frame}>
          <Carousel
            data={COUNTER_SLIDES}
            renderItem={item => <MediaSlide item={item} />}
          />
        </Column>
      </Column>
    </Column>
  );
}

export default CarouselIndicatorsDemo;
