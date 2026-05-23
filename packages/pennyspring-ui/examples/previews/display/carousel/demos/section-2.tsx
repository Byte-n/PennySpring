import React from 'react';
import { View } from 'react-native';
import { Carousel, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

interface SlideItem {
  label: string;
  backgroundColor: string;
}

const CAROUSEL_WIDTH = 320;

const CAROUSEL_HEIGHT = 200;

const VERTICAL_CAROUSEL_HEIGHT = 220;

const SLIDE_FONT_SIZE = 16;

const SLIDE_FONT_SIZE_LARGE = 18;

const DEMO_SLIDES: SlideItem[] = [
  { label: '卡片一', backgroundColor: '#1677ff' },
  { label: '卡片二', backgroundColor: '#52c41a' },
  { label: '卡片三', backgroundColor: '#fa8c16' },
  { label: '卡片四', backgroundColor: '#eb2f96' },
];

const useStyles = createUseSheetStyle(token => ({
  sectionStack: {
    gap: token.marginLG,
  },
  demoBlock: {
    alignItems: 'flex-start',
    gap: token.marginSM,
  },
  blockTitle: {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    fontWeight: '600',
  },
  carousel: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  verticalBlock: {
    width: CAROUSEL_WIDTH,
    gap: token.marginSM,
  },
  verticalCarousel: {
    height: VERTICAL_CAROUSEL_HEIGHT,
  },
  verticalIndicator: {
    left: token.paddingSM,
    right: 'auto',
    bottom: 'auto',
    top: '50%',
    transform: [{ translateY: -50 }],
    flexDirection: 'column',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideWithBottomSpace: {
    marginHorizontal: token.marginSM,
    marginBottom: token.marginLG,
  },
  slideText: {
    color: token.colorWhite,
    fontSize: SLIDE_FONT_SIZE,
    lineHeight: token.lineHeight,
  },
  slideTextLarge: {
    color: token.colorWhite,
    fontSize: SLIDE_FONT_SIZE_LARGE,
    lineHeight: token.lineHeightLG,
  },
  row: {
    flexDirection: 'row',
    gap: token.marginSM,
  },
  customIndicator: {
    position: 'absolute',
    right: token.padding,
    bottom: token.padding,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXXS,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorBgMask,
  },
  customIndicatorText: {
    color: token.colorWhite,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
  roundedCarousel: {
    borderRadius: token.borderRadiusLG,
    overflow: 'hidden',
  },
}));

export const carouselSection2DemoTitle = '非全宽轮播';

export function CarouselSection2Demo() {
  const styles = useStyles();
  const renderItem = React.useCallback(
    (item: SlideItem) => (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.slideText}>{item.label}</Text>
      </View>
    ),
    [styles.slide, styles.slideText],
  );

  return (
    <>
      <View style={styles.sectionStack}>
        <View style={styles.demoBlock}>
          <Text style={styles.blockTitle}>卡在边界</Text>
          <Carousel<SlideItem>
            data={DEMO_SLIDES}
            renderItem={renderItem}
            slideSize={80}
            stuckAtBoundary
            style={styles.carousel}
          />
        </View>

        <View style={styles.demoBlock}>
          <Text style={styles.blockTitle}>允许越过边界</Text>
          <Carousel<SlideItem>
            data={DEMO_SLIDES}
            renderItem={renderItem}
            slideSize={80}
            trackOffset={10}
            stuckAtBoundary={false}
            style={styles.carousel}
          />
        </View>

        <View style={styles.demoBlock}>
          <Text style={styles.blockTitle}>关闭橡皮筋</Text>
          <Carousel<SlideItem>
            data={DEMO_SLIDES}
            renderItem={renderItem}
            slideSize={80}
            trackOffset={10}
            stuckAtBoundary={false}
            rubberband={false}
            style={styles.carousel}
          />
        </View>

        <View style={styles.demoBlock}>
          <Text style={styles.blockTitle}>居中展示</Text>
          <Carousel<SlideItem>
            data={DEMO_SLIDES}
            renderItem={renderItem}
            slideSize={70}
            trackOffset={15}
            stuckAtBoundary={false}
            style={styles.carousel}
          />
        </View>

        <View style={styles.demoBlock}>
          <Text style={styles.blockTitle}>循环居中展示</Text>
          <Carousel<SlideItem>
            data={DEMO_SLIDES}
            renderItem={renderItem}
            slideSize={70}
            trackOffset={15}
            loop
            stuckAtBoundary={false}
            style={styles.carousel}
          />
        </View>
      </View>
    </>
  );
}

export default CarouselSection2Demo;
