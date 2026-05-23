import React from 'react';
import { View } from 'react-native';
import { Carousel, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

interface SlideItem {
  label: string;
  backgroundColor: string;
}

interface CountIndicatorProps {
  current: number;
  total: number;
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

function CountIndicator(props: CountIndicatorProps) {
  const { current, total } = props;
  const styles = useStyles();

  return (
    <View style={styles.customIndicator}>
      <Text style={styles.customIndicatorText}>
        {current + 1} / {total}
      </Text>
    </View>
  );
}

export const carouselSection3DemoTitle = '指示器';

export function CarouselSection3Demo() {
  const styles = useStyles();
  const { token } = useTheme();
  const renderItem = React.useCallback(
    (item: SlideItem) => (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.slideText}>{item.label}</Text>
      </View>
    ),
    [styles.slide, styles.slideText],
  );
  const renderItemWithSpace = React.useCallback(
    (item: SlideItem) => (
      <View
        style={[
          styles.slide,
          styles.slideWithBottomSpace,
          { backgroundColor: item.backgroundColor },
        ]}
      >
        <Text style={styles.slideText}>{item.label}</Text>
      </View>
    ),
    [styles.slide, styles.slideWithBottomSpace, styles.slideText],
  );
  const renderCountIndicator = React.useCallback(
    (total: number, current: number) => (
      <CountIndicator total={total} current={current} />
    ),
    [],
  );

  return (
    <>
      <View style={styles.sectionStack}>
        <View style={styles.demoBlock}>
          <Text style={styles.blockTitle}>指示器颜色</Text>
          <Carousel<SlideItem>
            data={DEMO_SLIDES}
            renderItem={renderItem}
            style={styles.carousel}
            styles={{
              indicatorDotActive: { backgroundColor: token.colorWhite },
            }}
            defaultIndex={1}
          />
        </View>

        <View style={styles.demoBlock}>
          <Text style={styles.blockTitle}>指示器在滑块外面</Text>
          <Carousel<SlideItem>
            data={DEMO_SLIDES}
            renderItem={renderItemWithSpace}
            style={styles.carousel}
          />
        </View>

        <View style={styles.demoBlock}>
          <Text style={styles.blockTitle}>自定义指示器</Text>
          <Carousel<SlideItem>
            data={DEMO_SLIDES}
            renderItem={renderItem}
            style={styles.carousel}
            autoplay
            loop
            indicator={renderCountIndicator}
          />
        </View>

        <View style={styles.demoBlock}>
          <Text style={styles.blockTitle}>无指示器</Text>
          <Carousel<SlideItem>
            data={DEMO_SLIDES}
            renderItem={renderItem}
            style={styles.carousel}
            indicator={false}
          />
        </View>
      </View>
    </>
  );
}

export default CarouselSection3Demo;
