import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Carousel,
  type CarouselRef,
  Text,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

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

export function CarouselPreview() {
  const styles = useStyles();
  const { token } = useTheme();
  const carouselRef = React.useRef<CarouselRef | null>(null);

  const renderItem = React.useCallback(
    (item: SlideItem) => (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.slideText}>{item.label}</Text>
      </View>
    ),
    [styles.slide, styles.slideText],
  );

  const renderLargeItem = React.useCallback(
    (item: SlideItem) => (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.slideTextLarge}>{item.label}</Text>
      </View>
    ),
    [styles.slide, styles.slideTextLarge],
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
    <PreviewScaffold>
      <PreviewSection title="基础用法">
        <View style={styles.sectionStack}>
          <View style={styles.demoBlock}>
            <Text style={styles.blockTitle}>基础用法</Text>
            <Carousel<SlideItem>
              data={DEMO_SLIDES}
              renderItem={renderLargeItem}
              style={styles.carousel}
            />
          </View>

          <View style={styles.demoBlock}>
            <Text style={styles.blockTitle}>自动播放</Text>
            <Carousel<SlideItem>
              data={DEMO_SLIDES}
              renderItem={renderLargeItem}
              autoplay
              autoplayInterval={2500}
              loop
              style={styles.carousel}
            />
          </View>

          <View style={styles.demoBlock}>
            <Text style={styles.blockTitle}>循环</Text>
            <Carousel<SlideItem>
              data={DEMO_SLIDES}
              renderItem={renderLargeItem}
              loop
              style={styles.carousel}
            />
          </View>

          <View style={styles.demoBlock}>
            <Text style={styles.blockTitle}>手动控制</Text>
            <Carousel<SlideItem>
              data={DEMO_SLIDES}
              renderItem={renderLargeItem}
              allowTouchMove={false}
              loop
              ref={carouselRef}
              style={styles.carousel}
            />
            <View style={styles.row}>
              <Button size="normal" onPress={() => carouselRef.current?.swipePrev()}>
                上一张
              </Button>
              <Button type="primary" size="normal" onPress={() => carouselRef.current?.swipeNext()}>
                下一张
              </Button>
            </View>
          </View>

          <View style={styles.demoBlock}>
            <Text style={styles.blockTitle}>自定义样式</Text>
            <Carousel<SlideItem>
              data={DEMO_SLIDES}
              renderItem={renderLargeItem}
              style={[
                styles.carousel,
                styles.roundedCarousel,
              ]}
              defaultIndex={2}
            />
          </View>
        </View>
      </PreviewSection>

      <PreviewSection title="非全宽轮播">
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
      </PreviewSection>

      <PreviewSection title="指示器">
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
      </PreviewSection>

      <PreviewSection title="竖向">
        <View style={styles.sectionStack}>
          <View style={styles.verticalBlock}>
            <Text style={styles.blockTitle}>竖向</Text>
            <Carousel<SlideItem>
              data={DEMO_SLIDES}
              renderItem={renderItem}
              direction="vertical"
              style={styles.verticalCarousel}
              styles={{
                indicator: styles.verticalIndicator,
              }}
            />
          </View>

          <View style={styles.verticalBlock}>
            <Text style={styles.blockTitle}>竖向居中展示</Text>
            <Carousel<SlideItem>
              data={DEMO_SLIDES}
              renderItem={renderItem}
              direction="vertical"
              slideSize={80}
              trackOffset={10}
              stuckAtBoundary={false}
              style={styles.verticalCarousel}
              styles={{
                indicator: styles.verticalIndicator,
              }}
            />
          </View>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
